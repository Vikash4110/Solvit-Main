import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  X,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  MessageSquare,
  Star,
  CheckCircle2,
  Receipt,
  Copy,
  HelpCircle,
  IndianRupee,
  Globe,
  BellRing,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { API_BASE_URL, API_ENDPOINTS } from '../../../config/api';
import { TIMEZONE } from '../../../constants/constants';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);

const fadeInUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const ClientDashboardMyBookings = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });

  const [cancelModal, setCancelModal] = useState({
    show: false,
    booking: null,
  });
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const tabs = [
    { key: 'upcoming', label: 'Upcoming', icon: Clock },
    { key: 'raiseIssue', label: 'Raise Issue', icon: AlertTriangle },
    { key: 'issuesRaised', label: 'Issues Raised', icon: MessageSquare },
    { key: 'completed', label: 'Completed', icon: CheckCircle2 },
     
  ];

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('clientAccessToken');

      const queryParams = new URLSearchParams({
        filter: activeTab,
        page: page.toString(),
        perPage: '10',
      });

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CLIENT_BOOKINGS}?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (data.success) {
        setBookings(data.data.bookings);
        console.log(data.data.bookings)
        setPagination(data.data.pagination);
      } else {
        toast.error(data.message || 'Failed to load bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelModal.booking || !cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    try {
      setCancelLoading(true);
      const token = localStorage.getItem('clientAccessToken');

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CLIENT_BOOKING_CANCEL}/${cancelModal.booking.bookingId}/cancel`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ reason: cancelReason }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success(data.message || 'Booking cancelled successfully');
        setCancelModal({ show: false, booking: null });
        setCancelReason('');
        fetchBookings();
      } else {
        toast.error(data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Failed to cancel booking');
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusUI = (booking) => {
    const base = 'border text-xs font-medium px-3 py-1 rounded-full shadow-sm';

    const map = {
      confirmed: {
        label: booking?.canJoin ? 'Starting soon' : 'Upcoming',
        className:
          `${base} bg-sky-50 text-sky-700 border-sky-200 ` +
          `dark:bg-sky-950/35 dark:text-sky-300 dark:border-sky-900/60`,
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
        label: 'Under review',
        className:
          `${base} bg-violet-50 text-violet-700 border-violet-200 ` +
          `dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-900/60`,
      },
      disputed: {
        label: 'Issue raised',
        className:
          `${base} bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 ` +
          `dark:bg-fuchsia-950/30 dark:text-fuchsia-300 dark:border-fuchsia-900/60`,
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
      tz: TIMEZONE,
      minutesToStart: start.diff(dayjs().utc(), 'minute'),
    };
  };

  const getAlertStrip = (booking) => {
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

    if (booking.status === 'dispute_window_open') {
      return {
        show: true,
        icon: AlertTriangle,
        className:
          'border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-900/50 dark:bg-violet-950/25 dark:text-violet-200',
        message: 'You can raise an issue during this review window.',
      };
    }

    return { show: false };
  };

  const copyBookingId = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success('Booking ID copied');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const BookingCard = ({ booking }) => {
    const s = formatSession(booking.startTime, booking.endTime);
    const statusUI = getStatusUI(booking);
    const alert = getAlertStrip(booking);

    const name = booking?.counselorName || 'Counselor';
    const initials =
      name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join('') || 'CN';

    const specialization = Array.isArray(booking?.specialization)
      ? booking.specialization
      : booking?.specialization
        ? [booking.specialization]
        : [];

    return (
      <motion.div variants={fadeInUp} layout>
        <Card
          className={
            'relative overflow-hidden rounded-2xl border border-neutral-200/70 dark:border-neutral-800/80 ' +
            'bg-white/70 dark:bg-neutral-900/55 backdrop-blur-xl ' +
            'shadow-[0_10px_30px_-18px_rgba(2,132,199,0.35)] dark:shadow-none ' +
            'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-24px_rgba(2,132,199,0.45)]'
          }
        >
          {/* top accent */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500/70 via-sky-500/60 to-primary-700/70" />
          <CardContent className="p-5 sm:p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <Avatar className="h-12 w-12 sm:h-14 sm:w-14 ring-2 ring-primary-100 dark:ring-primary-900/30 border border-primary-200/60 dark:border-primary-800/60">
                  <AvatarImage src={booking.counselorPhoto} alt={name} />
                  <AvatarFallback className="bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300 font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-50 truncate">
                      {name}
                    </h3>
                    <BadgeCheck className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                    {specialization?.[0] && (
                      <span className="truncate max-w-[220px] sm:max-w-none">
                        {specialization[0]}
                      </span>
                    )}
                    {specialization.length > 1 && (
                      <Badge variant="secondary" className="px-2 py-0.5 text-[10px]">
                        +{specialization.length - 1}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                <span className={statusUI.className}>{statusUI.label}</span>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Session Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 h-8 w-8 rounded-xl bg-primary-50 dark:bg-primary-950/35 border border-primary-100 dark:border-primary-900/40 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary-700 dark:text-primary-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {s.date}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Date</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 h-8 w-8 rounded-xl bg-primary-50 dark:bg-primary-950/35 border border-primary-100 dark:border-primary-900/40 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-primary-700 dark:text-primary-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {s.time}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {s.duration} •{' '}
                    <span className="inline-flex items-center gap-1">
                      <Globe className="h-3 w-3" /> {s.tz}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 sm:col-span-2">
                <div className="mt-0.5 h-8 w-8 rounded-xl bg-primary-50 dark:bg-primary-950/35 border border-primary-100 dark:border-primary-900/40 flex items-center justify-center">
                  <Video className="h-4 w-4 text-primary-700 dark:text-primary-300" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Video session
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Session mode</p>
                </div>
              </div>
            </div>

            {/* Alert strip */}
            {alert.show && (
              <div className="mt-4">
                <Alert className={`py-2.5 ${alert.className}`}>
                  <alert.icon className="h-4 w-4" />
                  <AlertDescription className="text-xs font-medium">
                    {alert.message}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Payment */}
            <div className="mt-4 rounded-xl border border-neutral-200/70 dark:border-neutral-800/70 bg-gradient-to-r from-white to-primary-50/40 dark:from-neutral-900/40 dark:to-primary-950/10 p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                  <IndianRupee className="h-4 w-4 text-neutral-700 dark:text-neutral-200" />
                </div>
                <div>
               
                  <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    ₹{booking.price}
                  </p>
                   <p className="text-xs text-neutral-600 dark:text-neutral-400">Amount</p>
                </div>
              </div>

              {!!booking.invoice && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-primary-200/70 text-primary-700 hover:bg-primary-50 dark:border-primary-800/60 dark:text-primary-300 dark:hover:bg-primary-950/20"
                  onClick={() => window.open(booking.invoice, '_blank')}
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Invoice
                </Button>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              {/* Keep your existing join routing here */}
              {booking.status === 'confirmed' && (
                <>
                  <Button
                    className={
                      'w-full sm:flex-1 rounded-xl text-white font-semibold ' +
                      'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 ' +
                      'shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all'
                    }
                    disabled={!booking.canJoin}
                    onClick={() => navigate(`/meeting/${booking.bookingId}/${booking.videoSDKRoomId}`)}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    {booking.canJoin ? 'Join session' : 'Join available soon'}
                  </Button>

                  {/* {booking.canCancel && (
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto rounded-xl border-neutral-200 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-900"
                      onClick={() => setCancelModal({ show: true, booking })}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  )} */}
                </>
              )}

              {booking.status === 'dispute_window_open' && booking.canRaiseIssue && (
                <Button
                  className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-700 hover:to-violet-800 text-white font-semibold"
                  onClick={() => navigate(`/client/raise-issue/${booking.bookingId}`)}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Raise issue
                </Button>
              )}

              {booking.status === 'disputed' && (
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-fuchsia-200 text-fuchsia-700 hover:bg-fuchsia-50 dark:border-fuchsia-900/60 dark:text-fuchsia-300 dark:hover:bg-fuchsia-950/20"
                  onClick={() => navigate(`/client/issue-status/${booking.bookingId}`)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View issue status
                </Button>
              )}

              {booking.status === 'completed' && (
                <>
                  <Button
                    variant="outline"
                    className="w-full sm:flex-1 rounded-xl border-primary-200 text-primary-700 hover:bg-primary-50 dark:border-primary-900/60 dark:text-primary-300 dark:hover:bg-primary-950/20"
                    onClick={() => navigate(`/client/session-feedback/${booking.bookingId}`)}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Leave feedback
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full sm:flex-1 rounded-xl border-neutral-200 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-900"
                    onClick={() => navigate('/browse-counselors')}
                  >
                    Book again
                  </Button>
                </>
              )}
            </div>

            <Separator className="my-4" />

            {/* Footer: support + booking id */}
            <div className="flex items-center justify-between gap-3 text-xs text-neutral-600 dark:text-neutral-400">
              <button
                className="inline-flex items-center gap-2 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                onClick={() => navigate('/contact')}
              >
                <HelpCircle className="h-4 w-4" />
                Need help
              </button>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline">Booking:</span>
                <code className="px-2 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[11px] font-mono text-neutral-800 dark:text-neutral-200">
                  {String(booking.bookingId || '').slice(-8)}
                </code>
                <button
                  className="inline-flex items-center gap-1 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                  onClick={() => copyBookingId(booking.bookingId)}
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(14,165,233,0.10),transparent_55%),radial-gradient(900px_circle_at_80%_30%,rgba(99,102,241,0.08),transparent_45%)] dark:bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(14,165,233,0.12),transparent_55%),radial-gradient(900px_circle_at_80%_30%,rgba(99,102,241,0.10),transparent_45%)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Page header */}
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
            My bookings
          </h1>
          {/* <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
            Quick clarity on who, when, status, and what you can do next.
          </p> */}
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="sticky top-0 z-10 -mx-4 px-4 sm:mx-0 sm:px-0 py-3 bg-transparent">
            <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex h-auto p-1 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800/60">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className={
                      'rounded-xl px-4 py-2.5 text-sm font-medium transition-all ' +
                      'data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary-800 ' +
                      'dark:data-[state=active]:bg-neutral-950 dark:data-[state=active]:text-primary-300'
                    }
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {tabs.map((tab) => (
            <TabsContent key={tab.key} value={tab.key} className="space-y-4">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600 dark:text-primary-400" />
                  <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
                    Loading bookings...
                  </p>
                </div>
              ) : bookings.length === 0 ? (
                <Card className="rounded-2xl border border-dashed border-neutral-300/70 dark:border-neutral-700/70 bg-white/60 dark:bg-neutral-900/40 backdrop-blur">
                  <CardContent className="py-16 text-center">
                    <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      No sessions found
                    </p>
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                      {activeTab === 'upcoming' &&
                        "You don't have any upcoming sessions scheduled."}
                      {activeTab === 'raiseIssue' &&
                        'No sessions are currently in the review window.'}
                      {activeTab === 'issuesRaised' &&
                        "You haven't raised any issues for your past sessions."}
                      {activeTab === 'completed' && "You don't have any completed sessions yet."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                  >
                    {bookings.map((booking) => (
                      <BookingCard key={booking.bookingId} booking={booking} />
                    ))}
                  </motion.div>

                  {pagination.totalPages > 1 && (
                    <div className="pt-6 flex items-center justify-between gap-4">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Showing{' '}
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {(pagination.currentPage - 1) * 10 + 1}
                        </span>{' '}
                        to{' '}
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {Math.min(pagination.currentPage * 10, pagination.totalCount)}
                        </span>{' '}
                        of{' '}
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {pagination.totalCount}
                        </span>
                      </p>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => fetchBookings(pagination.currentPage - 1)}
                          disabled={pagination.currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => fetchBookings(pagination.currentPage + 1)}
                          disabled={pagination.currentPage === pagination.totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Cancel modal */}
      <Dialog
        open={cancelModal.show}
        onOpenChange={(open) => !open && setCancelModal({ show: false, booking: null })}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Cancel session</DialogTitle>
            <DialogDescription>
              A short reason helps improve the experience for everyone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Reason *</Label>
            <Textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="E.g. schedule conflict, not feeling well, etc."
              className="resize-none rounded-xl"
              rows={4}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              disabled={cancelLoading}
              onClick={() => setCancelModal({ show: false, booking: null })}
            >
              Keep booking
            </Button>
            <Button
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
              disabled={cancelLoading || !cancelReason.trim()}
              onClick={handleCancelBooking}
            >
              {cancelLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling…
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Confirm cancel
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientDashboardMyBookings;
