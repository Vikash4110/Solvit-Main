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
  const timerRef = useRef(null);

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
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <Card className="group relative bg-gradient-to-br from-white via-white to-primary-50/20 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/20 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-500 overflow-hidden">

          {/* Coloured left accent per status */}
          <div className={`absolute inset-y-0 left-0 w-1 ${
            booking.status === 'dispute_window_open' ? 'bg-violet-400' :
            booking.status === 'disputed'            ? 'bg-amber-400'  :
            booking.status === 'completed'           ? 'bg-emerald-400':
            booking.status === 'cancelled'           ? 'bg-red-400'    :
            'bg-primary-400'
          }`} />

          {alert.show && (
            <Alert className={`rounded-none border-0 border-b ${alert.className}`}>
              <alert.icon className="h-4 w-4" />
              <AlertDescription className="text-xs font-medium">{alert.message}</AlertDescription>
            </Alert>
          )}

          <CardContent className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-12 w-12 border-2 border-primary-200 dark:border-primary-800">
                  <AvatarImage src={booking.clientPhoto} alt={clientName} />
                  <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-600 text-white font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                    {clientName}
                  </h3>
                  <button
                    onClick={() => copyBookingId(booking.bookingId)}
                    className="flex items-center gap-1.5 mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span className="font-mono">{String(booking.bookingId || '').slice(-8)}</span>
                  </button>
                </div>
              </div>

              <Badge className={statusUI.className}>{statusUI.label}</Badge>
            </div>

            <Separator className="bg-neutral-200 dark:bg-neutral-800" />

            {/* Session meta */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                  <Calendar className="w-3.5 h-3.5" /><span>Date</span>
                </div>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {s ? s.date : 'N/A'}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                  <Clock className="w-3.5 h-3.5" /><span>Time</span>
                </div>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {s ? s.time : 'N/A'}
                </p>
                {s && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {s.duration} • <Video className="w-3 h-3 inline" /> Video session
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                  <IndianRupee className="w-3.5 h-3.5" /><span>Your Earnings</span>
                </div>
                <p className={`text-sm font-semibold ${
                  booking.status === 'disputed'
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}>
                  ₹{booking.earnings ?? 0}
                  {booking.status === 'disputed' && (
                    <span className="ml-1.5 text-[10px] font-normal text-amber-500 dark:text-amber-400">(on hold)</span>
                  )}
                  {booking.status === 'dispute_window_open' && (
                    <span className="ml-1.5 text-[10px] font-normal text-violet-500 dark:text-violet-400">(pending)</span>
                  )}
                </p>
              </div>

              {booking.clientEmail && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <Mail className="w-3.5 h-3.5" /><span>Email</span>
                  </div>
                  <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate">
                    {booking.clientEmail}
                  </p>
                </div>
              )}
            </div>

            {/* Dispute detail block (only when disputed) */}
            {booking.status === 'disputed' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/20 p-3 space-y-1.5">
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
              <div className="rounded-xl border border-violet-200 bg-violet-50 dark:border-violet-900/60 dark:bg-violet-950/20 p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <Hourglass className="h-4 w-4 text-violet-600 dark:text-violet-400 shrink-0" />
                  <p className="text-xs font-semibold text-violet-900 dark:text-violet-200">Review window is open</p>
                </div>
                <p className="text-[10px] text-violet-700 dark:text-violet-400 pl-6">
                  Client has up to 24 hours to raise an issue. No action is needed from you right now.
                </p>
              </div>
            )}

            <Separator className="bg-neutral-200 dark:bg-neutral-800" />

            {/* Actions */}
            {booking.canJoin ? (
              <Button
                onClick={() => handleJoinSession(booking)}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-md hover:shadow-lg transition-all"
                size="lg"
              >
                <Video className="w-4 h-4 mr-2" />
                Join Session
              </Button>
            ) : booking.status === 'confirmed' && s ? (
              <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
                {s.minutesToStart > 0
                  ? `Join opens ${s.minutesToStart > EARLY_JOIN_MINUTES
                      ? `at ${dayjs.utc(booking.startTime).subtract(EARLY_JOIN_MINUTES, 'minute').tz(TIMEZONE).format('h:mm A')}`
                      : `in ${s.minutesToStart} min`}`
                  : 'Session window has closed'}
              </p>
            ) : null}
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-50 via-primary-100 to-primary-200/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary-950/30 py-12 px-4">
      <motion.div
        className="relative z-10 max-w-6xl mx-auto w-full"
        initial="hidden"
        animate="visible"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
      >
        <motion.div className="text-center mb-10" variants={fadeInUp}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-3">
            <span className="text-neutral-900 dark:text-white">My </span>
            <span className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 dark:from-primary-400 dark:via-primary-300 dark:to-secondary-400 bg-clip-text text-transparent">
              Sessions
            </span>
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Manage your counseling sessions and track their progress
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-3xl mx-auto mb-8 bg-white/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 p-1 rounded-xl">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-600 data-[state=active]:to-primary-700 data-[state=active]:text-white rounded-lg transition-all"
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline text-xs font-medium">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

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
                  <div className="grid gap-6 md:grid-cols-2">
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
    </section>
  );
};

export default CounselorDashboardMySessions;