
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  X,
  Loader2,
  User,
  Shield,
  Star,
  Languages,
  ChevronLeft,
  ChevronRight,
  Award,
  BookOpen,
  Heart,
  CheckCircle,
  CreditCard,
  MessageCircle,
  Phone,
  Mail,
  AlertCircle,
  Info,
  Home,
  FileText,
  Sparkles,
} from 'lucide-react';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';

// Utils & Config
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import { TIMEZONE } from '../../constants/constants';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { cn } from '@/lib/utils';

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

// ===============================================
// ANIMATION VARIANTS (Inspired by OurServices)
// ===============================================
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

// ===============================================
// MAIN COMPONENT
// ===============================================
const BookCounselorCalendar = () => {
  const { counselorId } = useParams();
  const navigate = useNavigate();

  // ============= STATE MANAGEMENT =============
  const [counselor, setCounselor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    dayjs().tz(TIMEZONE).format('YYYY-MM-DD')
  );
  const [currentMonth, setCurrentMonth] = useState(dayjs().tz(TIMEZONE));
  const [bookingLoading, setBookingLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [imgError, setImgError] = useState(false);

  // New booking flow states
  const [sessionType, setSessionType] = useState('online'); // 'online' or 'offline'
  const [selectedDuration, setSelectedDuration] = useState(45); // 30, 45, 60
  const [clientNote, setClientNote] = useState('');

  // ============= RAZORPAY SCRIPT LOADING =============
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      toast.error('Payment service unavailable. Please refresh the page.');
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // ============= DATA FETCHING =============
  useEffect(() => {
    let intervalId;

    const alignAndStart = () => {
      fetchCounselorData();
      const currentSecond = dayjs().tz(TIMEZONE).second();
      const delay = (60 - currentSecond) * 1000;

      setTimeout(() => {
        fetchCounselorData();
        intervalId = setInterval(fetchCounselorData, 60000);
      }, delay);
    };

    alignAndStart();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [counselorId]);

  const fetchCounselorData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.BOOKING_COUNSELOR_SLOTS}/${counselorId}/slots`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('clientAccessToken')}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCounselor(data.counselor);
        setSlots(data.slots || []);
      } else {
        toast.error('Unable to retrieve counselor information');
        navigate('/browse-counselors');
      }
    } catch (error) {
      console.error('Error fetching counselor data:', error);
      toast.error('Unable to retrieve counselor information');
    } finally {
      setLoading(false);
    }
  };

  // ============= MEMOIZED UTILITIES =============
  const getAvailableDates = useMemo(() => {
    const today = dayjs().tz(TIMEZONE);
    return slots
      .filter((slot) => slot.status === 'available' && !slot.isBooked)
      .map((slot) => dayjs(slot.startTime).tz(TIMEZONE).format('YYYY-MM-DD'))
      .filter((date, i, arr) => arr.indexOf(date) === i)
      .filter((date) => dayjs(date).isSameOrAfter(today, 'day'))
      .sort();
  }, [slots]);

  const getSlotsForDate = useCallback(
    (date) => {
      return slots
        .filter((slot) => {
          const slotDate = dayjs(slot.startTime).tz(TIMEZONE).format('YYYY-MM-DD');
          return slotDate === date && slot.status === 'available' && !slot.isBooked;
        })
        .sort((a, b) => dayjs(a.startTime).diff(dayjs(b.startTime)));
    },
    [slots]
  );

  const selectedDateSlots = useMemo(
    () => getSlotsForDate(selectedDate),
    [selectedDate, getSlotsForDate]
  );

  const getSlotPrice = useCallback((slot) => slot.totalPriceAfterPlatformFee, []);

  const getClientData = useCallback(() => {
    const client = localStorage.getItem('client');
    return client ? JSON.parse(client) : null;
  }, []);

  const navigateMonth = useCallback((direction) => {
    setCurrentMonth((prev) =>
      direction === 'next' ? prev.add(1, 'month') : prev.subtract(1, 'month')
    );
  }, []);

  // ============= PAYMENT HANDLING =============
  const initiatePayment = async () => {
    if (!selectedSlot) return;

    if (!razorpayLoaded) {
      toast.error('Payment service is loading. Please try again shortly.');
      return;
    }

    try {
      setBookingLoading(true);
      const clientData = getClientData();

      if (!clientData || !localStorage.getItem('clientAccessToken')) {
        toast.error('Please log in again to proceed.');
        setBookingLoading(false);
        navigate('/login');
        return;
      }

      const amount = getSlotPrice(selectedSlot);

      // Get Razorpay key
      const keyResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PAYMENT_GET_KEY}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('clientAccessToken')}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!keyResponse.ok) throw new Error('Failed to retrieve payment key');

      const { key } = await keyResponse.json();

      // Create order
      const orderResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PAYMENT_CHECKOUT}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('clientAccessToken')}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ amount }),
      });

      if (!orderResponse.ok) throw new Error('Failed to create payment order');

      const order = await orderResponse.json();

      // Razorpay options
      const options = {
        key,
        amount: order.amount,
        currency: 'INR',
        name: 'Solvit - Mental Health Platform',
        description: `Booking with ${counselor.fullName}`,
        order_id: order.id,
        handler: async (response) => {
          await verifyPayment(response);
        },
        prefill: {
          name: clientData.fullName,
          email: clientData.email,
          contact: clientData.phoneNumber || '',
        },
        theme: {
          color: '#1c3c63', // Primary color
        },
        modal: {
          ondismiss: () => {
            setBookingLoading(false);
            toast.info('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setBookingLoading(false);
    }
  };

  const verifyPayment = async (paymentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PAYMENT_VERIFY}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('clientAccessToken')}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_signature: paymentData.razorpay_signature,
          slotId: selectedSlot._id,
          counselorId,
          sessionType,
          clientNote,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Booking confirmed! Check your email for details.');
        setShowBookingModal(false);
        setSelectedSlot(null);
        navigate('/client/dashboard');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Failed to verify payment. Contact support if amount was deducted.');
    } finally {
      setBookingLoading(false);
    }
  };

  // ============= CALENDAR UTILITIES =============
  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfMonth = currentMonth.startOf('month').day();
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const dayNumber = i - firstDayOfMonth + 1;
    if (dayNumber > 0 && dayNumber <= daysInMonth) {
      return currentMonth.date(dayNumber).format('YYYY-MM-DD');
    }
    return null;
  });

  // ===============================================
  // RENDER: LOADING STATE
  // ===============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary-950/20 flex items-center justify-center">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-12 w-72 h-72 bg-primary-400/10 dark:bg-primary-600/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-24 right-10 w-96 h-96 bg-secondary-400/10 dark:bg-secondary-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '500ms' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center relative z-10"
        >
          <Loader2 className="w-12 h-12 text-primary-600 dark:text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-neutral-600 dark:text-neutral-400 font-medium">
            Loading counselor information...
          </p>
        </motion.div>
      </div>
    );
  }

  // ===============================================
  // RENDER: MAIN COMPONENT
  // ===============================================
  return (
    <div className="min-h-screen pt-16 relative overflow-hidden bg-transparent mt-[80px]">
    
      {/* Background Decorative Elements (from OurServices) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-12 w-72 h-72 bg-primary-400/10 dark:bg-primary-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-24 right-10 w-96 h-96 bg-secondary-400/10 dark:bg-secondary-600/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '500ms' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary-200/20 dark:bg-primary-800/10 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div {...fadeInUp} className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="group hover:bg-primary-50 dark:hover:bg-primary-900/20"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Counselors
          </Button>
        </motion.div>

        {/* Page Title */}
        <motion.div {...fadeInUp} className="text-center mb-12 space-y-4">
          <Badge
            variant="outline"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-white/10 backdrop-blur-md text-primary-700 dark:text-primary-300 border border-primary-200/50 dark:border-primary-800/50 rounded-full shadow-lg hover:bg-white/20 dark:hover:bg-white/5 transition-all duration-300 hover:scale-105"
          >
            <Sparkles className="w-4 h-4" aria-hidden="true" />
            <span>Book Your Session</span>
          </Badge>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight">
            <span className="text-neutral-900 dark:text-white">Schedule Time With </span>
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 dark:from-primary-400 dark:via-primary-300 dark:to-secondary-400 bg-clip-text text-transparent">
              {counselor?.fullName}
            </span>
          </h1>

          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Choose a convenient date and time for your counseling session
          </p>
        </motion.div>

        {/* Main Grid Layout: 3 Columns (Desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* LEFT COLUMN: Counselor Summary (3 cols) */}
          <motion.div {...fadeInUp} className="lg:col-span-3">
            <Card className="sticky top-24 overflow-hidden border-2 border-neutral-200 dark:border-neutral-800 shadow-xl hover:shadow-2xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 transition-all duration-500">
              {/* Profile Header with Gradient */}
              <div className="relative h-24 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTZjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bS0xNiAwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wLTE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0tMTYgMGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
              </div>

              <CardContent className="relative -mt-12 pt-0 pb-6 px-6">
                {/* Avatar */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-white dark:border-neutral-900 shadow-2xl ring-2 ring-primary-200 dark:ring-primary-800">
                      {!imgError && counselor?.profilePicture ? (
                        <AvatarImage
                          src={counselor.profilePicture}
                          alt={counselor.fullName}
                          onError={() => setImgError(true)}
                          className="object-cover"
                        />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-600 text-white text-2xl font-bold">
                          {counselor?.fullName?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    {/* Verified Badge */}
                    <div className="absolute -bottom-1 -right-1 bg-success-600 text-white rounded-full p-1 shadow-lg ring-2 ring-white dark:ring-neutral-900">
                      <Shield className="w-4 h-4" aria-label="Verified counselor" />
                    </div>
                  </div>
                </div>

                {/* Name & Specialization */}
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">
                    {counselor?.fullName}
                  </h2>
                  <p className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                    {counselor?.specialization}
                  </p>
                </div>

                {/* Rating */}
                {counselor?.rating && (
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="flex items-center gap-1 bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-full border border-primary-200 dark:border-primary-800">
                      <Star className="w-4 h-4 fill-primary-500 text-primary-500" />
                      <span className="text-sm font-bold text-neutral-900 dark:text-white">
                        {counselor.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        (320 reviews)
                      </span>
                    </div>
                  </div>
                )}

                <Separator className="my-4" />

                {/* Info Grid */}
                <div className="space-y-3">
                  {/* Experience */}
                  {counselor?.experienceYears && (
                    <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                        <Award className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                          Experience
                        </p>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                          {counselor.experienceYears}+ years
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {counselor?.application?.languages?.length > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                        <Languages className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                          Languages
                        </p>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                          {counselor.application.languages.join(', ')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Session Format */}
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                      <Video className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        Session Format
                      </p>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                        Online & Offline
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Short Bio */}
                {counselor?.application?.bio && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      About
                    </p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-3">
                      {counselor.application.bio}
                    </p>
                  </div>
                )}

                {/* View Full Profile Link */}
                <Button
                  variant="ghost"
                  className="w-full mt-4 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                  onClick={() => navigate(`/counselor/${counselorId}`)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Full Profile
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* MIDDLE COLUMN: Calendar & Time Slots (6 cols) */}
          <motion.div {...fadeInUp} className="lg:col-span-6 space-y-6">
            
            {/* Calendar Card */}
            <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-xl hover:shadow-2xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 transition-all duration-500 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary-50/80 to-primary-100/40 dark:from-primary-950/50 dark:to-primary-900/30 border-b border-primary-200/30 dark:border-primary-800/30">
                <CardTitle className="text-2xl bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  Select a Date
                </CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">
                  Choose a date to view available time slots
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateMonth('prev')}
                    disabled={currentMonth.isSame(dayjs().tz(TIMEZONE), 'month')}
                    className="hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:scale-110 transition-all duration-300"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>

                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                    {currentMonth.format('MMMM YYYY')}
                  </h3>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateMonth('next')}
                    className="hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:scale-110 transition-all duration-300"
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Weekday Headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-semibold text-neutral-600 dark:text-neutral-400 py-2"
                    >
                      {day}
                    </div>
                  ))}

                  {/* Calendar Days */}
                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const isAvailable = getAvailableDates.includes(date);
                    const isSelected = date === selectedDate;
                    const isToday = date === dayjs().tz(TIMEZONE).format('YYYY-MM-DD');
                    const isPast = dayjs(date).isBefore(dayjs().tz(TIMEZONE), 'day');

                    return (
                      <motion.button
                        key={date}
                        whileHover={isAvailable ? { scale: 1.05 } : {}}
                        whileTap={isAvailable ? { scale: 0.95 } : {}}
                        onClick={() => isAvailable && setSelectedDate(date)}
                        disabled={!isAvailable}
                        className={cn(
                          'aspect-square rounded-xl text-sm font-semibold transition-all duration-300',
                          'flex items-center justify-center relative',
                          isSelected &&
                            'bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg ring-2 ring-primary-300 dark:ring-primary-700 hover:shadow-xl',
                          !isSelected &&
                            isAvailable &&
                            'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 border-2 border-primary-200 dark:border-primary-800',
                          !isAvailable &&
                            !isPast &&
                            'text-neutral-400 dark:text-neutral-600 cursor-not-allowed',
                          isPast && 'text-neutral-300 dark:text-neutral-700 cursor-not-allowed',
                          isToday &&
                            !isSelected &&
                            'ring-2 ring-coral-400 dark:ring-coral-500'
                        )}
                        aria-label={`Select ${dayjs(date).format('MMMM D, YYYY')}`}
                        aria-pressed={isSelected}
                        aria-disabled={!isAvailable}
                      >
                        {dayjs(date).format('D')}
                        {isAvailable && !isSelected && (
                          <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded bg-primary-600"></div>
                    <span className="text-neutral-600 dark:text-neutral-400">Selected</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-200 dark:border-primary-800"></div>
                    <span className="text-neutral-600 dark:text-neutral-400">Available</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded ring-2 ring-coral-400"></div>
                    <span className="text-neutral-600 dark:text-neutral-400">Today</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time Slots Card */}
            <Card className="border-2 border-neutral-200 dark:border-neutral-800 shadow-xl hover:shadow-2xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 transition-all duration-500 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary-50/80 to-primary-100/40 dark:from-primary-950/50 dark:to-primary-900/30 border-b border-primary-200/30 dark:border-primary-800/30">
                <CardTitle className="text-2xl bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent flex items-center gap-2">
                  <Clock className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  Available Time Slots
                </CardTitle>
                <CardDescription className="text-neutral-600 dark:text-neutral-400">
                  {dayjs(selectedDate).format('dddd, MMMM D, YYYY')}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                {selectedDateSlots.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-neutral-400 dark:text-neutral-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                      No available slots
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                      Please select another date to find available time slots
                    </p>
                  </motion.div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                    >
                      {selectedDateSlots.map((slot) => {
                        const startTime = dayjs(slot.startTime).tz(TIMEZONE);
                        const endTime = dayjs(slot.endTime).tz(TIMEZONE);
                        const price = getSlotPrice(slot);

                        return (
                          <motion.div
                            key={slot._id}
                            variants={fadeInUp}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <button
                              onClick={() => {
                                setSelectedSlot(slot);
                                setShowBookingModal(true);
                              }}
                              className="w-full p-4 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 hover:border-primary-400 dark:hover:border-primary-600 rounded-xl transition-all duration-300 hover:shadow-lg group"
                              aria-label={`Book slot at ${startTime.format('h:mm A')}`}
                            >
                              <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                  <span className="font-bold text-neutral-900 dark:text-white text-lg">
                                    {startTime.format('h:mm A')}
                                  </span>
                                </div>
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                  {slot.duration} min
                                </span>
                                <Badge variant="secondary" className="text-xs font-bold bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400">
                                  ₹{price}
                                </Badge>
                              </div>
                            </button>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* RIGHT COLUMN: Session Summary & Payment (3 cols) */}
          <motion.div {...fadeInUp} className="lg:col-span-3">
            <Card className="sticky top-24 border-2 border-neutral-200 dark:border-neutral-800 shadow-xl hover:shadow-2xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 transition-all duration-500 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary-50/80 to-primary-100/40 dark:from-primary-950/50 dark:to-primary-900/30 border-b border-primary-200/30 dark:border-primary-800/30">
                <CardTitle className="text-xl bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent">
                  Booking Summary
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                {/* Session Info */}
                {selectedSlot ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                        <CalendarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">Date</p>
                          <p className="font-semibold text-neutral-900 dark:text-white text-sm">
                            {dayjs(selectedSlot.startTime).tz(TIMEZONE).format('dddd, MMM D')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                        <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">Time</p>
                          <p className="font-semibold text-neutral-900 dark:text-white text-sm">
                            {dayjs(selectedSlot.startTime).tz(TIMEZONE).format('h:mm A')} - {dayjs(selectedSlot.endTime).tz(TIMEZONE).format('h:mm A')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                        <Video className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">Duration</p>
                          <p className="font-semibold text-neutral-900 dark:text-white text-sm">
                            {selectedSlot.duration} minutes
                          </p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Session Type Selection */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-neutral-900 dark:text-white">
                        Session Mode
                      </Label>
                      <RadioGroup value={sessionType} onValueChange={setSessionType}>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 p-3 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-primary-400 dark:hover:border-primary-600 transition-colors cursor-pointer">
                            <RadioGroupItem value="online" id="online" />
                            <Label htmlFor="online" className="flex items-center gap-2 cursor-pointer flex-1">
                              <Video className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                              <div>
                                <p className="font-medium text-neutral-900 dark:text-white">Online</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">Video call session</p>
                              </div>
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2 p-3 border-2 border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-primary-400 dark:hover:border-primary-600 transition-colors cursor-pointer">
                            <RadioGroupItem value="offline" id="offline" />
                            <Label htmlFor="offline" className="flex items-center gap-2 cursor-pointer flex-1">
                              <MapPin className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                              <div>
                                <p className="font-medium text-neutral-900 dark:text-white">In-Person</p>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">Visit counselor's office</p>
                              </div>
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>

                      {sessionType === 'offline' && counselor?.application?.clinicAddress && (
                        <Alert className="mt-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                          <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <AlertDescription className="text-xs text-blue-900 dark:text-blue-100">
                            <strong>Location:</strong> {counselor.application.clinicAddress}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <Separator />

                    {/* Price Breakdown */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-neutral-900 dark:text-white">
                        Price Breakdown
                      </Label>
                      <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-lg space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-600 dark:text-neutral-400">Session Fee</span>
                          <span className="font-semibold text-neutral-900 dark:text-white">
                            ₹{selectedSlot.basePrice}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-600 dark:text-neutral-400">Platform Fee</span>
                          <span className="font-semibold text-neutral-900 dark:text-white">
                            ₹{selectedSlot.platformFee}
                          </span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-neutral-900 dark:text-white">Total</span>
                          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            ₹{getSlotPrice(selectedSlot)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Optional Note */}
                    <div className="space-y-3">
                      <Label htmlFor="client-note" className="text-sm font-semibold text-neutral-900 dark:text-white">
                        Message to Counselor (Optional)
                      </Label>
                      <Textarea
                        id="client-note"
                        placeholder="E.g., I'd like to focus on coping with exam stress..."
                        value={clientNote}
                        onChange={(e) => setClientNote(e.target.value)}
                        maxLength={200}
                        className="resize-none h-20 text-sm"
                      />
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 text-right">
                        {clientNote.length}/200 characters
                      </p>
                    </div>

                    <Separator />

                    {/* Trust Indicators */}
                    <Alert className="bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800">
                      <CheckCircle className="w-4 h-4 text-success-600 dark:text-success-400" />
                      <AlertDescription className="text-xs text-success-900 dark:text-success-100">
                        Your payment is <strong>secured & encrypted</strong>
                      </AlertDescription>
                    </Alert>

                    {/* Cancellation Policy Accordion */}
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="policy" className="border-neutral-200 dark:border-neutral-800">
                        <AccordionTrigger className="text-sm font-medium text-neutral-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                          <div className="flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            Cancellation Policy
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-xs text-neutral-600 dark:text-neutral-400 space-y-2">
                          <p>• Free cancellation up to 24 hours before your session</p>
                          <p>• 50% refund if cancelled 12-24 hours before</p>
                          <p>• No refund for cancellations within 12 hours</p>
                          <p>• Reschedule anytime with 6+ hours notice</p>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {/* Book Now Button */}
                    <Button
                      onClick={() => setShowBookingModal(true)}
                      className="w-full h-12 text-base font-bold bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      Proceed to Payment
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarIcon className="w-8 h-8 text-neutral-400 dark:text-neutral-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                      Select a Time Slot
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                      Choose a date and time to see booking details
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* =============================================== */}
      {/* BOOKING CONFIRMATION MODAL */}
      {/* =============================================== */}
      <AnimatePresence>
        {showBookingModal && selectedSlot && (
          <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-2xl bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent">
                  Confirm Your Booking
                </DialogTitle>
                <DialogDescription>
                  Review your booking details before proceeding to payment
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="max-h-[60vh]">
                <div className="space-y-4 py-4 pr-4">
                  {/* Counselor Info */}
                  <div className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                    <Avatar className="w-16 h-16 border-2 border-primary-200 dark:border-primary-800">
                      {!imgError && counselor?.profilePicture ? (
                        <AvatarImage src={counselor.profilePicture} alt={counselor.fullName} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-600 text-white text-xl font-bold">
                          {counselor?.fullName?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-bold text-neutral-900 dark:text-white">
                        {counselor?.fullName}
                      </p>
                      <p className="text-sm text-primary-600 dark:text-primary-400">
                        {counselor?.specialization}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Booking Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <CalendarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Date</p>
                        <p className="font-semibold text-neutral-900 dark:text-white">
                          {dayjs(selectedSlot.startTime).tz(TIMEZONE).format('dddd, MMMM D, YYYY')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Time</p>
                        <p className="font-semibold text-neutral-900 dark:text-white">
                          {dayjs(selectedSlot.startTime).tz(TIMEZONE).format('h:mm A')} -{' '}
                          {dayjs(selectedSlot.endTime).tz(TIMEZONE).format('h:mm A')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        {sessionType === 'online' ? (
                          <Video className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        ) : (
                          <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Mode</p>
                        <p className="font-semibold text-neutral-900 dark:text-white">
                          {sessionType === 'online' ? 'Online Video Call' : 'In-Person Session'} ({selectedSlot.duration} min)
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600 dark:text-neutral-400">Session Fee</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        ₹{selectedSlot.basePrice}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600 dark:text-neutral-400">Platform Fee</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        ₹{selectedSlot.platformFee}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900 dark:text-white">Total</span>
                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        ₹{getSlotPrice(selectedSlot)}
                      </span>
                    </div>
                  </div>

                  {/* Info Message */}
                  <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <AlertDescription className="text-xs text-blue-900 dark:text-blue-100">
                      You'll receive a confirmation email with the {sessionType === 'online' ? 'video call link' : 'session details'} after successful payment.
                    </AlertDescription>
                  </Alert>
                </div>
              </ScrollArea>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowBookingModal(false);
                  }}
                  disabled={bookingLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={initiatePayment}
                  disabled={bookingLoading || !razorpayLoaded}
                  className="bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700"
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay ₹{getSlotPrice(selectedSlot)}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Sticky Bottom Bar for Mobile */}
      {selectedSlot && (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white dark:bg-neutral-900 border-t-2 border-neutral-200 dark:border-neutral-800 shadow-2xl z-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Total Amount</p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                ₹{getSlotPrice(selectedSlot)}
              </p>
            </div>
            <Button
              onClick={() => setShowBookingModal(true)}
              className="flex-1 max-w-[200px] h-12 text-base font-bold bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 text-white rounded-xl shadow-lg"
            >
              Confirm Booking
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookCounselorCalendar;
