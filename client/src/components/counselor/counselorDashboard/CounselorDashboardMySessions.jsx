import React, { useState, useEffect } from 'react';
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
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { API_BASE_URL, API_ENDPOINTS } from '../../../config/api';
import { TIMEZONE } from '../../../constants/constants';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import PreSessionGuidelines from './CounselorDashboardPreSessonGuidelines';
dayjs.extend(utc);
dayjs.extend(timezone);

const fadeInUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const CounselorDashboardMySessions = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });
  const [showGuidelines, setShowGuidelines] = useState(false);

  const tabs = [
    { key: 'upcoming', label: 'Upcoming', icon: Clock },
    { key: 'completed', label: 'Completed', icon: CheckCircle2 },
  ];

  useEffect(() => {
    fetchSessions(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleAuthError = () => {
    localStorage.removeItem('counselorAccessToken');
    toast.error('Session expired. Please login again.');
    navigate('/counselor/login');
  };

  const fetchSessions = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('counselorAccessToken');
      if (!token) {
        handleAuthError();
        return;
      }

      const queryParams = new URLSearchParams({
        filter: activeTab,
        page: page.toString(),
        perPage: '10',
      });

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.COUNSELOR_BOOKINGS}?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }

      const data = await response.json().catch(() => null);

      if (!data || typeof data !== 'object') {
        toast.error('Unexpected response from server');
        return;
      }

      if (data.success && data.data && Array.isArray(data.data.bookings)) {
        setBookings(data.data.bookings);
        setPagination(
          data.data.pagination || {
            currentPage: page,
            totalPages: 1,
            totalCount: data.data.bookings.length,
          }
        );
      } else {
        toast.error(data.message || 'Failed to load sessions');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Network error while loading sessions');
    } finally {
      setLoading(false);
      setJoiningId(null);
    }
  };

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
      dispute_window_open: {
        label: 'In Progress',
        className:
          `${base} bg-violet-50 text-violet-700 border-violet-200 ` +
          `dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-900/60`,
      },
      disputed: {
        label: 'Disputed',
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
        show: true,
        icon: BellRing,
        className:
          'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-200',
        message: `Session starts in ${minutesToStart} min`,
      };
    }

    if (booking.status === 'disputed') {
      return {
        show: true,
        icon: AlertTriangle,
        className:
          'border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/25 dark:text-red-200',
        message: 'Client raised a dispute. Admin will review.',
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

  const handleJoinSession = (booking) => {
    if (!booking?.bookingId) {
      toast.error('Invalid session data');
      return;
    }

    if (!booking.canJoin) {
      toast.error('Session not ready to join yet');
      return;
    }

    if (!booking.videoSDKRoomId) {
      toast.error('Meeting room not available');
      return;
    }

    setJoiningId(booking.bookingId);
    setShowGuidelines(true);
    // navigate(`/counselor/session/${booking.bookingId}`);
  };
  const handleProceedToSession = (bookingId, videoSDKRoomId) => {
    setShowGuidelines(false);
    // Navigate to video call or open video SDK
    // window.open(`/meeting/${bookingId}/${videoSDKRoomId}`, '_blank');
    navigate(`/meeting/${bookingId}/${videoSDKRoomId}`)
  };

  const changePage = (nextPage) => {
    if (loading) return;
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    fetchSessions(nextPage);
  };

  const SessionCard = ({ booking }) => {
    const s =
      booking.startTime && booking.endTime
        ? formatSession(booking.startTime, booking.endTime)
        : null;

    const statusUI = getStatusUI(booking);
    const alert = s ? getAlertStrip(booking) : { show: false };

    const clientName = booking?.clientName || 'Client';
    const initials =
      clientName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join('') || 'CL';

    const isJoining = joiningId === String(booking.bookingId);

    return (
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <Card className="group relative bg-gradient-to-br from-white via-white to-primary-50/20 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/20 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-500 overflow-hidden">
          {alert.show && (
            <Alert className={`rounded-none border-0 border-b ${alert.className}`}>
              <alert.icon className="h-4 w-4" />
              <AlertDescription className="text-xs font-medium">{alert.message}</AlertDescription>
            </Alert>
          )}

          <CardContent className="p-5 space-y-4">
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Date</span>
                </div>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {s ? s.date : 'N/A'}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Time</span>
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
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>Your Earnings</span>
                </div>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  ₹{booking.earnings ?? 0}
                </p>
              </div>

              {booking.clientEmail && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </div>
                  <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate">
                    {booking.clientEmail}
                  </p>
                </div>
              )}
            </div>

            {booking.status === 'disputed' && booking.dispute?.issueType && (
              <Alert className="border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/25">
                <MessageSquare className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-semibold">Issue: </span>
                  {booking.dispute.issueType.replace(/_/g, ' ')}
                </AlertDescription>
              </Alert>
            )}

            <Separator className="bg-neutral-200 dark:bg-neutral-800" />

            {booking.canJoin ? (
              <>
                <Button
                  onClick={() => handleJoinSession(booking)}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-md hover:shadow-lg transition-all"
                  size="lg"
                  disabled={isJoining}
                >
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    Join Session
                  </>
                  
                </Button>
                {/* Pre Session Guidelines modal */}
                <PreSessionGuidelines
                  isOpen={showGuidelines}
                  onClose={() => setShowGuidelines(false)}
                  onProceed={() => {
                    handleProceedToSession(booking.bookingId, booking.videoSDKRoomId);
                  }}
                />
              </>
            ) : booking.status === 'confirmed' && s ? (
              <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
                You can join {s.minutesToStart > 0 ? `in ${s.minutesToStart} minutes` : 'soon'}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-50 via-primary-100 to-primary-200/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary-950/30 py-12 px-4">
      <motion.div
        className="relative z-10 max-w-6xl mx-auto w-full"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
      >
        <motion.div className="text-center mb-10" variants={fadeInUp}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-3">
            <span className="text-neutral-900 dark:text-white">My </span>
            <span className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 dark:from-primary-400 dark:via-primary-300 dark:to-secondary-400 bg-clip-text text-transparent">
              Sessions
            </span>
          </h2>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Manage your counseling sessions and connect with clients
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-2xl mx-auto mb-8 bg-white/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 p-1 rounded-xl">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-600 data-[state=active]:to-primary-700 data-[state=active]:text-white rounded-lg transition-all"
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.key} value={tab.key} className="space-y-6">
              {/* ✅ PROFESSIONAL NOTE - Only shown in Completed tab */}
              {tab.key === 'completed' && (
                <motion.div variants={fadeInUp}>
                  <Alert className="border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 shadow-sm">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertTitle className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1.5">
                      Session Completion Review Period
                    </AlertTitle>
                    <AlertDescription className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                      After each session, there is a
                      <span className="font-semibold">24-hour review window</span> during which
                      clients can share any concerns. If no issues are raised within this period,
                      the session is marked as completed and your earnings are released.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-4" />
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Loading sessions...
                  </p>
                </div>
              ) : bookings.length === 0 ? (
                <Card className="border-dashed border-2 border-neutral-300 dark:border-neutral-700 bg-transparent">
                  <CardContent className="flex flex-col items-center justify-center py-20">
                    <tab.icon className="w-16 h-16 text-neutral-400 dark:text-neutral-600 mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                      No sessions found
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center max-w-sm">
                      {activeTab === 'upcoming' &&
                        "You don't have any upcoming sessions scheduled."}
                      {activeTab === 'completed' &&
                        'No completed sessions yet. Sessions appear here after the review period.'}
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
                        <span className="font-semibold">
                          {(pagination.currentPage - 1) * 10 + 1}
                        </span>{' '}
                        to{' '}
                        <span className="font-semibold">
                          {Math.min(pagination.currentPage * 10, pagination.totalCount)}
                        </span>{' '}
                        of <span className="font-semibold">{pagination.totalCount}</span>
                      </p>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => changePage(pagination.currentPage - 1)}
                          disabled={pagination.currentPage === 1 || loading}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-medium px-3">
                          {pagination.currentPage} / {pagination.totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
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
    </section>
  );
};

export default CounselorDashboardMySessions;
