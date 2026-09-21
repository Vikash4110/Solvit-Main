import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Mail,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Copy,
  BellRing,
  Hourglass,
  ShieldAlert,
  Info,
  FileText,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { API_ENDPOINTS } from '../../../config/api';
import api from '@/lib/axios';
import { TIMEZONE } from '../../../constants/constants';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import PreSessionGuidelines from './CounselorDashboardPreSessonGuidelines';
import { ClinicalNotesModal } from './ClinicalNotesModal';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const EARLY_JOIN_MINUTES = 10;

const fadeInUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const computeCanJoin = (booking) => {
  if (!booking.videoSDKRoomId || !booking.startTime || !booking.endTime) return false;
  if (booking.status !== 'confirmed') return false;

  const now = dayjs().utc();
  const start = dayjs.utc(booking.startTime);
  const end = dayjs.utc(booking.endTime);

  return now.isSameOrAfter(start.subtract(EARLY_JOIN_MINUTES, 'minute')) && now.isBefore(end);
};

// ─── Tab definitions ──────────────────────────────────────────────────────────
// Each tab has a `filterKey` that maps exactly to what the backend `getCounselorBookings`
// expects in its `allowedFilters` list.
const TABS = [
  { key: 'upcoming',     filterKey: 'upcoming',    label: 'Upcoming',        icon: Clock        },
  { key: 'reviewWindow', filterKey: 'inProgress',  label: 'Review Window',   icon: Hourglass    },
  { key: 'disputed',     filterKey: 'disputed',    label: 'Disputed',        icon: ShieldAlert  },
  { key: 'completed',    filterKey: 'completed',   label: 'Completed',       icon: CheckCircle2 },
];

const CounselorDashboardMySessions = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });

  const [guidelinesState, setGuidelinesState] = useState({ show: false, booking: null });
  const [notesModalState, setNotesModalState] = useState({ show: false, booking: null });
  const timerRef = useRef(null);

  const handleNotesSaved = (bookingId, savedNote) => {
    setBookings((prevBookings) =>
      prevBookings.map((b) =>
        b.bookingId === bookingId || b._id === bookingId
          ? { ...b, hasNotes: true, noteInfo: savedNote }
          : b
      )
    );
  };

  const handleAuthError = useCallback(() => {
    localStorage.removeItem('counselorAccessToken');
    toast.error('Session expired. Please login again.');
    navigate('/counselor/login');
  }, [navigate]);

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchSessions = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);

        // Resolve the correct filter key for the active tab
        const currentTab = TABS.find((t) => t.key === activeTab) || TABS[0];

        const queryParams = new URLSearchParams({
          filter: currentTab.filterKey,
          page: page.toString(),
          perPage: '10',
        });

        const response = await api.get(
          `${API_ENDPOINTS.COUNSELOR_BOOKINGS}?${queryParams}`
        );

        const data = response.data;
        if (!data || typeof data !== 'object') {
          toast.error('Unexpected response from server');
          return;
        }

        if (data.success && data.data && Array.isArray(data.data.bookings)) {
          const enriched = data.data.bookings.map((b) => ({
            ...b,
            canJoin: computeCanJoin(b),
          }));
          setBookings(enriched);
          setPagination(
            data.data.pagination || { currentPage: page, totalPages: 1, totalCount: enriched.length }
          );
        } else {
          toast.error(data.message || 'Failed to load sessions');
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
        toast.error('Network error while loading sessions');
      } finally {
        setLoading(false);
      }
    },
    [activeTab, handleAuthError]
  );

  useEffect(() => { fetchSessions(1); }, [fetchSessions]);

  // Live timer: recompute canJoin every 30 s for the 'upcoming' tab
  useEffect(() => {
    if (activeTab !== 'upcoming') return;

    timerRef.current = setInterval(() => {
      setBookings((prev) =>
        prev.map((b) => ({ ...b, canJoin: computeCanJoin(b) }))
      );
    }, 30_000);

    return () => clearInterval(timerRef.current);
  }, [activeTab]);

  // ── Join handlers ────────────────────────────────────────────────────────────
  const handleJoinSession = (booking) => {
    if (!booking?.bookingId) { toast.error('Invalid session data'); return; }
    if (!computeCanJoin(booking)) { toast.error('Session not ready to join yet'); return; }
    if (!booking.videoSDKRoomId) { toast.error('Meeting room not available'); return; }
    setGuidelinesState({ show: true, booking });
  };

  const handleProceedToSession = (bookingId, videoSDKRoomId) => {
    setGuidelinesState({ show: false, booking: null });
    navigate(`/meeting/${bookingId}/${videoSDKRoomId}`);
  };

  const changePage = (nextPage) => {
    if (loading) return;
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    fetchSessions(nextPage);
  };

  // ── UI helpers ───────────────────────────────────────────────────────────────
  const getStatusUI = (booking) => {
    const base = 'border text-xs font-medium px-3 py-1 rounded-full shadow-sm';
    const map = {
      confirmed: {
        label: booking?.canJoin ? 'Can join now' : 'Scheduled',
        className:
          `${base} bg-emerald-50 text-emerald-700 border-emerald-200 ` +
          `dark:bg-emerald-950/35 dark:text-emerald-300 dark:border-emerald-900/60`,
      },
      completed: {
        label: 'Completed',
        className:
          `${base} bg-neutral-100 text-neutral-700 border-neutral-200 ` +
          `dark:bg-neutral-900/60 dark:text-neutral-200 dark:border-neutral-800`,
      },
      cancelled: {
        label: 'Cancelled',
        className:
          `${base} bg-red-50 text-red-700 border-red-200 ` +
          `dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/60`,
      },
      // dispute_window_open: client can raise an issue within the next 24 h
      dispute_window_open: {
        label: 'Client review window',
        className:
          `${base} bg-violet-50 text-violet-700 border-violet-200 ` +
          `dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-900/60`,
      },
      // disputed: client has actually raised an issue
      disputed: {
        label: 'Issue raised by client',
        className:
          `${base} bg-amber-50 text-amber-700 border-amber-200 ` +
          `dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/60`,
      },
    };
    return map[booking?.status] || map.confirmed;
  };

  const getStatusBorderClass = (status) => {
    switch (status) {
      case 'completed':
        return 'border-emerald-400/80 dark:border-emerald-500/70 hover:border-emerald-500 dark:hover:border-emerald-400 shadow-[0_4px_20px_-10px_rgba(16,185,129,0.25)]';
      case 'dispute_window_open':
        return 'border-violet-400/80 dark:border-violet-500/70 hover:border-violet-500 dark:hover:border-violet-400 shadow-[0_4px_20px_-10px_rgba(139,92,246,0.25)]';
      case 'disputed':
        return 'border-amber-400/80 dark:border-amber-500/70 hover:border-amber-500 dark:hover:border-amber-400 shadow-[0_4px_20px_-10px_rgba(245,158,11,0.25)]';
      case 'cancelled':
        return 'border-red-400/80 dark:border-red-500/70 hover:border-red-400 dark:hover:border-red-400 shadow-[0_4px_20px_-10px_rgba(239,68,68,0.25)]';
      case 'confirmed':
      default:
        return 'border-blue-400/80 dark:border-blue-500/70 hover:border-blue-500 dark:hover:border-blue-400 shadow-[0_4px_20px_-10px_rgba(59,130,246,0.25)]';
    }
  };

  const formatSession = (startTime, endTime) => {
    const start = dayjs.utc(startTime).tz(TIMEZONE);
    const end = dayjs.utc(endTime).tz(TIMEZONE);
    const duration = Math.max(0, end.diff(start, 'minute'));
    return {
      date: start.format('ddd, MMM D, YYYY'),
      time: `${start.format('h:mm A')} – ${end.format('h:mm A')}`,
      duration: `${duration} min`,
      minutesToStart: start.diff(dayjs().utc(), 'minute'),
    };
  };

  const getAlertStrip = (booking) => {
    if (!booking.startTime || !booking.endTime) return { show: false };
    const { minutesToStart } = formatSession(booking.startTime, booking.endTime);

    if (booking.status === 'confirmed' && minutesToStart <= 10 && minutesToStart > 0) {
      return {
        show: true, icon: BellRing,
        className: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-200',
        message: `Session starts in ${minutesToStart} min`,
      };
    }

    if (booking.status === 'dispute_window_open') {
      return {
        show: true, icon: Hourglass,
        className: 'border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-900/50 dark:bg-violet-950/25 dark:text-violet-200',
        message: 'Client has a 24-hour window to raise an issue with this session. If none is raised, it will be marked complete and your earnings released.',
      };
    }

    if (booking.status === 'disputed') {
      return {
        show: true, icon: AlertTriangle,
        className: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-200',
        message: 'The client has raised an issue for this session. Admin will review and reach out if needed. Please stay available.',
      };
    }

    return { show: false };
  };

  const copyBookingId = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success('Session ID copied');
    } catch {
      toast.error('Failed to copy session ID');
    }
  };

  // ── Tab-level informational banner ───────────────────────────────────────────
  const TabBanner = ({ tabKey }) => {
    if (tabKey === 'completed') {
      return (
        <motion.div variants={fadeInUp}>
          <Alert className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30 shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <AlertTitle className="text-sm font-semibold text-emerald-900 dark:text-emerald-200 mb-1">
              Completed sessions
            </AlertTitle>
            <AlertDescription className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
              These sessions passed the 24-hour review window with no client issues. Your earnings for these sessions have been released.
            </AlertDescription>
          </Alert>
        </motion.div>
      );
    }

    if (tabKey === 'reviewWindow') {
      return (
        <motion.div variants={fadeInUp}>
          <Alert className="border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/30 shadow-sm">
            <Hourglass className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <AlertTitle className="text-sm font-semibold text-violet-900 dark:text-violet-200 mb-1">
              Client review window is open
            </AlertTitle>
            <AlertDescription className="text-xs text-violet-800 dark:text-violet-300 leading-relaxed">
              Sessions here have ended and clients have up to <strong>24 hours</strong> to raise an issue.
              If no issue is raised, the session moves to <strong>Completed</strong> and your earnings are released.
              If an issue is raised, the session moves to <strong>Disputed</strong> and admin will review.
            </AlertDescription>
          </Alert>
        </motion.div>
      );
    }

    if (tabKey === 'disputed') {
      return (
        <motion.div variants={fadeInUp}>
          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 shadow-sm">
            <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertTitle className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
              Client raised an issue
            </AlertTitle>
            <AlertDescription className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              These sessions have an active dispute filed by the client. The admin team is reviewing them.
              You may be contacted for more information. Earnings for disputed sessions are held until resolved.
            </AlertDescription>
          </Alert>
        </motion.div>
      );
    }

    return null;
  };

  // ── SessionCard ──────────────────────────────────────────────────────────────
  const SessionCard = ({ booking }) => {
    const s =
      booking.startTime && booking.endTime
        ? formatSession(booking.startTime, booking.endTime)
        : null;

    const statusUI = getStatusUI(booking);
    const alert = s ? getAlertStrip(booking) : { show: false };

    const clientName = booking?.clientName || 'Client';
    const initials =
      clientName.split(' ').filter(Boolean).slice(0, 2)
        .map((w) => w[0]?.toUpperCase()).join('') || 'CL';

    return (
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="w-full h-full">
        <Card className={`group relative bg-white/80 dark:bg-neutral-900/70 backdrop-blur-xl rounded-2xl border ${getStatusBorderClass(booking?.status)} shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden w-full h-full flex flex-col`}>

          {alert.show && (
            <Alert className={`rounded-none border-0 border-b ${alert.className}`}>
              <alert.icon className="h-4 w-4" />
              <AlertDescription className="text-xs font-medium">{alert.message}</AlertDescription>
            </Alert>
          )}

          <CardContent className="p-4 sm:p-6 flex-1 flex flex-col justify-between space-y-4 sm:space-y-5">
            <div className="space-y-4 sm:space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 min-w-0">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar className="h-11 w-11 sm:h-13 sm:w-13 ring-2 ring-primary-100 dark:ring-primary-900/30 border border-primary-200/60 dark:border-primary-800/60 shrink-0">
                    <AvatarImage src={booking.clientPhoto} alt={clientName} />
                    <AvatarFallback className="bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300 font-semibold text-xs sm:text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-50 truncate">
                        {clientName}
                      </h3>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                      <span className="truncate max-w-[180px] sm:max-w-none font-medium">
                        Client
                      </span>
                      {booking.hasNotes && (
                        <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                          Notes Saved
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="self-start sm:self-center shrink-0">
                  <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-lg shadow-xs shrink-0 inline-block ${statusUI.className}`}>
                    {statusUI.label}
                  </span>
                </div>
              </div>

              <Separator className="bg-neutral-200/70 dark:bg-neutral-800/70" />

              {/* Session meta in clean structured tiles with generous breathing room */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-3 sm:gap-3.5 pt-1">
                <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <Calendar className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400 shrink-0" />
                    <span className="font-medium">Date</span>
                  </div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {s ? s.date : 'N/A'}
                  </p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <Clock className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400 shrink-0" />
                    <span className="font-medium">Time</span>
                  </div>
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {s ? s.time : 'N/A'}
                  </p>
                  {s && (
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 pt-0.5">
                      {s.duration} • <Video className="w-3 h-3 inline text-primary-500" /> Video session
                    </p>
                  )}
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-medium">Your Earnings</span>
                  </div>
                  <p className={`text-base font-bold ${
                    booking.status === 'disputed'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    ₹{booking.earnings ?? 0}
                    {booking.status === 'disputed' && (
                      <span className="ml-1.5 text-[10px] font-medium text-amber-500 dark:text-amber-400">(on hold)</span>
                    )}
                    {booking.status === 'dispute_window_open' && (
                      <span className="ml-1.5 text-[10px] font-medium text-violet-500 dark:text-violet-400">(pending)</span>
                    )}
                  </p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-neutral-50/80 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60 space-y-1.5 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <Mail className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400 shrink-0" />
                    <span className="font-medium">Email</span>
                  </div>
                  <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate" title={booking.clientEmail}>
                    {booking.clientEmail || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Dispute detail block (only when disputed) */}
              {booking.status === 'disputed' && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/20 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">Issue raised by client</p>
                  </div>
                  {booking.dispute?.issueType && (
                    <p className="text-xs text-amber-800 dark:text-amber-300 pl-6">
                      <span className="font-medium">Type: </span>
                      {booking.dispute.issueType.replace(/_/g, ' ')}
                    </p>
                  )}
                  {booking.dispute?.description && (
                    <p className="text-xs text-amber-800 dark:text-amber-300 pl-6 line-clamp-2">
                      <span className="font-medium">Details: </span>
                      {booking.dispute.description}
                    </p>
                  )}
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 pl-6 pt-0.5">
                    Admin is reviewing this. Your earnings are on hold until resolved.
                  </p>
                </div>
              )}

              {/* Review-window info block */}
              {booking.status === 'dispute_window_open' && (
                <div className="rounded-xl border border-violet-200 bg-violet-50 dark:border-violet-900/60 dark:bg-violet-950/20 p-4 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Hourglass className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0" />
                    <p className="text-xs font-semibold text-violet-900 dark:text-violet-200">Review window is open</p>
                  </div>
                  <p className="text-xs text-violet-700 dark:text-violet-400 pl-6">
                    Client has up to 24 hours to raise an issue. No action is needed from you right now.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-1 flex flex-col sm:flex-row gap-2">
                {booking.canJoin && (
                  <Button
                    onClick={() => handleJoinSession(booking)}
                    className="w-full sm:flex-1 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 transition-all"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Join Session
                  </Button>
                )}

                {booking.status === 'confirmed' && !booking.canJoin && s && s.minutesToStart > 0 && (
                  <div className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200/50 dark:border-neutral-700/50 text-center text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    {`Join opens ${s.minutesToStart > EARLY_JOIN_MINUTES
                        ? `at ${dayjs.utc(booking.startTime).subtract(EARLY_JOIN_MINUTES, 'minute').tz(TIMEZONE).format('h:mm A')}`
                        : `in ${s.minutesToStart} min`}`}
                  </div>
                )}

                <Button
                  variant="outline"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotesModalState({ show: true, booking });
                  }}
                  className="w-full sm:flex-1 rounded-xl border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-primary-50 dark:hover:bg-primary-950/40 text-neutral-800 dark:text-neutral-200 font-semibold py-3 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  <span>{booking.hasNotes ? 'View Clinical Notes' : 'Add Clinical Notes'}</span>
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <button
                className="inline-flex items-center gap-1.5 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                onClick={() => navigate('/contact')}
              >
                <HelpCircle className="h-4 w-4" />
                Need help
              </button>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-neutral-400">Booking:</span>
                <code className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[11px] font-mono text-neutral-700 dark:text-neutral-300">
                  {String(booking.bookingId || '').slice(-8)}
                </code>
                <button
                  onClick={() => copyBookingId(booking.bookingId)}
                  className="p-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer"
                  title="Copy booking ID"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // ── Empty state messages ─────────────────────────────────────────────────────
  const emptyMessage = {
    upcoming:      "You don't have any upcoming sessions scheduled.",
    reviewWindow:  'No sessions are currently in the client review window.',
    disputed:      'No sessions have an active client dispute.',
    completed:     'No completed sessions yet. Sessions appear here after the review period ends with no issues raised.',
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <section className="relative min-h-full w-full max-w-full overflow-x-hidden bg-gradient-to-br from-neutral-50 via-primary-100 to-primary-200/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary-950/30 py-6 sm:py-10 px-3 sm:px-6">
      <motion.div
        className="relative z-10 max-w-7xl mx-auto w-full"
        initial="hidden"
        animate="visible"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
      >
        <motion.div className="text-center mb-6 sm:mb-8" variants={fadeInUp}>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-2 sm:mb-3">
            <span className="text-neutral-900 dark:text-white">My </span>
            <span className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 dark:from-primary-400 dark:via-primary-300 dark:to-secondary-400 bg-clip-text text-transparent">
              Sessions
            </span>
          </h2>
          <p className="text-xs sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Manage your counseling sessions and track their progress
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="pb-1 max-w-3xl mx-auto mb-6 sm:mb-8">
            <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex h-auto p-1.5 rounded-2xl bg-white/80 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800/60 shadow-sm gap-1">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="flex items-center justify-center gap-1.5 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-600 data-[state=active]:to-primary-700 data-[state=active]:text-white data-[state=active]:shadow-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
                >
                  <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {TABS.map((tab) => (
            <TabsContent key={tab.key} value={tab.key} className="space-y-6">
              {/* Per-tab informational banner */}
              <TabBanner tabKey={tab.key} />

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-4" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Loading sessions...</p>
                </div>
              ) : bookings.length === 0 ? (
                <Card className="border-dashed border-2 border-neutral-300 dark:border-neutral-700 bg-transparent">
                  <CardContent className="flex flex-col items-center justify-center py-20">
                    <tab.icon className="w-16 h-16 text-neutral-400 dark:text-neutral-600 mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                      No sessions found
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center max-w-sm">
                      {emptyMessage[tab.key]}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-2 w-full gap-5 sm:gap-6 items-start">
                    <AnimatePresence mode="wait">
                      {bookings.map((booking) => (
                        <SessionCard key={booking.bookingId} booking={booking} />
                      ))}
                    </AnimatePresence>
                  </div>

                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-6">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Showing{' '}
                        <span className="font-semibold">{(pagination.currentPage - 1) * 10 + 1}</span>{' '}
                        to{' '}
                        <span className="font-semibold">{Math.min(pagination.currentPage * 10, pagination.totalCount)}</span>{' '}
                        of <span className="font-semibold">{pagination.totalCount}</span>
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline" size="sm"
                          onClick={() => changePage(pagination.currentPage - 1)}
                          disabled={pagination.currentPage === 1 || loading}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-medium px-3">
                          {pagination.currentPage} / {pagination.totalPages}
                        </span>
                        <Button
                          variant="outline" size="sm"
                          onClick={() => changePage(pagination.currentPage + 1)}
                          disabled={pagination.currentPage === pagination.totalPages || loading}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>

      <PreSessionGuidelines
        isOpen={guidelinesState.show}
        onClose={() => setGuidelinesState({ show: false, booking: null })}
        onProceed={() => {
          if (guidelinesState.booking) {
            handleProceedToSession(
              guidelinesState.booking.bookingId,
              guidelinesState.booking.videoSDKRoomId
            );
          }
        }}
      />

      <ClinicalNotesModal
        isOpen={notesModalState.show}
        onClose={() => setNotesModalState({ show: false, booking: null })}
        booking={notesModalState.booking}
        onNotesSaved={handleNotesSaved}
      />
    </section>
  );
};

export default CounselorDashboardMySessions;