import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Video,
  X,
  Edit,
  Receipt,
  AlertTriangle,
  Loader2,
  Download,
  ChevronLeft,
  ChevronRight,
  MapPin,
  BadgeCheck,
  MessageSquare,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

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
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const ClientDashboardMyBookings = () => {
  const navigate = useNavigate()
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
    // { key: 'cancelled', label: 'Cancelled', icon: X },
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: {
        variant: 'default',
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      },
      completed: {
        variant: 'secondary',
        className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      },
      cancelled: {
        variant: 'destructive',
        className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      },
      dispute_window_open: {
        variant: 'default',
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      },
      disputed: {
        variant: 'default',
        className: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
      },
    };

    const config = statusConfig[status] || statusConfig.confirmed;

    return (
      <Badge variant={config.variant} className={config.className}>
        {status?.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const renderBookingCard = (booking) => {
    return (
      <motion.div key={booking.bookingId} variants={fadeInUp} initial="hidden" animate="visible">
        <Card className="group hover:shadow-lg hover:shadow-primary-500/5 dark:hover:shadow-primary-500/10 transition-all duration-300 hover:scale-[1.01] border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-4 sm:p-6">
            {/* Top Section */}
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
              <Avatar className="h-12 w-12 sm:h-14 sm:w-14 border-2 border-primary-500 dark:border-primary-600 shadow-lg">
                <AvatarImage src={booking.counselorPhoto} alt={booking.counselorName} />
                <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-700 text-white font-semibold">
                  <User className="h-5 w-5 sm:h-6 sm:w-6" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    {booking.counselorName}
                    <BadgeCheck className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  </h3>
                  {getStatusBadge(booking.status)}
                </div>

                {booking.specialization && (
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                    {booking.specialization}
                  </p>
                )}

                {/* Session Info - Responsive Stack */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="font-medium">
                      {dayjs.utc(booking.startTime).tz(TIMEZONE).format('MMM DD, YYYY')}
                    </span>
                  </div>

                  <Separator orientation="vertical" className="h-5 hidden sm:block" />

                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                      <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="font-medium">
                      {dayjs.utc(booking.startTime).tz(TIMEZONE).format('hh:mm A')} -{' '}
                      {dayjs.utc(booking.endTime).tz(TIMEZONE).format('hh:mm A')}
                    </span>
                  </div>

                  <Separator orientation="vertical" className="h-5 hidden sm:block" />

                  <div className="flex items-center gap-1.5">
                    <span className="text-base sm:text-lg font-bold text-primary-600 dark:text-primary-400">
                      ₹{booking.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Actions - Responsive Grid */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-2">
              {booking.canJoin && booking.videoSDKRoomId && (
                <Button
                  onClick={() => {
                    window.open(
                      `${import.meta.env.VITE_FRONTEND_URL}/meeting/${booking.bookingId}/${booking.videoSDKRoomId}`,
                      'noopener,noreferrer'
                    );
                  }}
                  className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all"
                  size="sm"
                >
                  <Video className="mr-2 h-4 w-4" />
                  Join Session
                </Button>
              )}

              {/* {booking.canCancel && (
                <Button
                  variant="outline"
                  onClick={() => setCancelModal({ show: true, booking })}
                  className="w-full sm:w-auto border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  size="sm"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              )} */}
              {booking.status === 'dispute_window_open' && booking.canRaiseIssue && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/client/dashboard/bookings/raiseIssue/${booking.bookingId}`)}
                  className="w-full sm:w-auto border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  size="sm"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Raise Issue
                </Button>
              )}

              {/* <Button
                variant="outline"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = booking.invoice;
                  link.setAttribute('download', `invoice-${booking.bookingId}.pdf`);
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                }}
                className="w-full sm:w-auto border-neutral-300 dark:border-neutral-700"
                size="sm"
              >
                Invoice
              </Button> */}
            </div>

            {/* Cancellation Deadline */}
            {/* {booking.cancellationDeadline && booking.canCancel && (
              <Alert className="mt-4 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-xs text-amber-800 dark:text-amber-400">
                  Cancel by: {booking.cancellationDeadline}
                </AlertDescription>
              </Alert>
            )} */}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 bg-gradient-to-br from-neutral-50 via-primary-50/30 to-primary-100/20 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary-950/30 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-1 sm:mb-2">
          My Bookings
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
          Manage your counseling sessions
        </p>
      </div>

      {/* Tabs - FULLY RESPONSIVE */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Scrollable Tabs for Mobile */}

        <TabsList className="inline-flex flex-wrap w-full sm:w-auto h-auto p-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm data-[state=active]:bg-primary-600 data-[state=active]:text-white whitespace-nowrap"
              >
                <IconComponent className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                {pagination.totalCount > 0 && activeTab === tab.key && (
                  <Badge
                    variant="secondary"
                    className="ml-1 px-1.5 py-0 text-[10px] sm:text-xs h-5"
                  >
                    {pagination.totalCount}
                  </Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 sm:mt-6">
          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20">
              <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary-600 dark:text-primary-400 mb-4" />
              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                Loading bookings...
              </p>
            </div>
          ) : bookings.length === 0 ? (
            <Card className="border-neutral-200 dark:border-neutral-800">
              <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 mb-4">
                  <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-neutral-400" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white mb-2 text-center">
                  No {activeTab.replace('-', ' ')} bookings found
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 text-center max-w-md px-4">
                  {activeTab === 'upcoming' && "You don't have any upcoming sessions scheduled."}
                  {activeTab === 'raiseIssue' && 'No sessions are currently in the review window.'}
                  {activeTab === 'issuesRaised' &&
                    "You haven't raised any issues for your past sessions."}
                  {activeTab === 'completed' && "You don't have any completed sessions yet."}
                  {activeTab === 'cancelled' && "You don't have any cancelled sessions."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <AnimatePresence mode="wait">{bookings.map(renderBookingCard)}</AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Pagination - Responsive */}
      {pagination.totalPages > 1 && (
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              {/* Mobile Pagination */}
              <div className="flex gap-2 sm:hidden w-full">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === 1}
                  onClick={() => fetchBookings(pagination.currentPage - 1)}
                  className="flex-1"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => fetchBookings(pagination.currentPage + 1)}
                  className="flex-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              {/* Desktop Pagination */}
              <div className="hidden sm:flex items-center justify-between w-full">
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  Showing{' '}
                  <span className="font-semibold">{(pagination.currentPage - 1) * 10 + 1}</span> to{' '}
                  <span className="font-semibold">
                    {Math.min(pagination.currentPage * 10, pagination.totalCount)}
                  </span>{' '}
                  of <span className="font-semibold">{pagination.totalCount}</span> results
                </p>

                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === pagination.currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => fetchBookings(page)}
                      className={
                        page === pagination.currentPage ? 'bg-primary-600 hover:bg-primary-700' : ''
                      }
                    >
                      {page}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Modal - Responsive */}
      <Dialog
        open={cancelModal.show}
        onOpenChange={(open) => !open && setCancelModal({ show: false, booking: null })}
      >
        <DialogContent className="sm:max-w-md max-w-[95vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
              Cancel Booking
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Are you sure you want to cancel your session with{' '}
              <strong>{cancelModal.booking?.counselorName}</strong>?
            </DialogDescription>
          </DialogHeader>

          <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-xs sm:text-sm text-amber-800 dark:text-amber-400">
              Cancellation must be made at least 24 hours before the session. Refunds will be
              processed within 5-7 business days.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="cancel-reason" className="text-xs sm:text-sm">
              Reason for cancellation *
            </Label>
            <Textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a reason for cancellation..."
              rows={4}
              className="resize-none text-xs sm:text-sm"
            />
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setCancelModal({ show: false, booking: null })}
              className="w-full sm:w-auto"
              size="sm"
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={cancelLoading || !cancelReason.trim()}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
              size="sm"
            >
              {cancelLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientDashboardMyBookings;
