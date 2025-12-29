import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid'; // ✅ NEW: npm install uuid
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  Video,
  Loader2,
  Shield,
  Star,
  Languages,
  ChevronLeft,
  ChevronRight,
  Award,
  CheckCircle,
  CreditCard,
  AlertCircle,
  Info,
  GraduationCap,
  Briefcase,
  Heart,
  Users,
  Sparkles,
  Wifi,
  WifiOff, // ✅ NEW
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { TIMEZONE } from '../../constants/constants';

// Initialize dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

// ==========================================
// ✅ CONFIGURATION CONSTANTS
// ==========================================
const MINIMUM_BOOKING_WINDOW_MINUTES = 30;
const STALE_ATTEMPT_THRESHOLD_MS = 15 * 60 * 1000;
const UNMOUNT_CLEANUP_THRESHOLD_MS = 5 * 60 * 1000;

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const BookCounselorCalendar = () => {
  const { counselorId } = useParams();
  const navigate = useNavigate();

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [counselor, setCounselor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookingLoading, setBookingLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // ✅ NEW: Idempotency & resilience state
  const [currentIdempotencyKey, setCurrentIdempotencyKey] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkSpeed, setNetworkSpeed] = useState(null);

  // ==========================================
  // ✅ NETWORK STATUS DETECTION
  // ==========================================
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('No internet connection', { duration: Infinity });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.connection) {
      setNetworkSpeed(navigator.connection.effectiveType);
      navigator.connection.addEventListener('change', () => {
        setNetworkSpeed(navigator.connection.effectiveType);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ==========================================
  // ✅ PREVENT ACCIDENTAL PAGE CLOSE DURING PAYMENT
  // ==========================================
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (bookingLoading || isRazorpayOpen) {
        e.preventDefault();
        e.returnValue = 'Payment is in progress. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [bookingLoading, isRazorpayOpen]);

  // ==========================================
  // ✅ RECOVER FROM PAGE REFRESH DURING PAYMENT
  // ==========================================
  useEffect(() => {
    const checkForStaleBooking = () => {
      const storedAttempt = sessionStorage.getItem('current_booking_attempt');
      if (storedAttempt) {
        try {
          const parsed = JSON.parse(storedAttempt);
          const attemptAge = Date.now() - parsed.timestamp;

          if (attemptAge > STALE_ATTEMPT_THRESHOLD_MS) {
            console.log('Clearing stale booking attempt');
            sessionStorage.removeItem('current_booking_attempt');
            setCurrentIdempotencyKey(null);
          } else if (parsed.slotId) {
            console.log('Found recent booking attempt, checking status...');
            checkBookingStatus(parsed.slotId);
          }
        } catch (error) {
          console.error('Error parsing stored attempt:', error);
          sessionStorage.removeItem('current_booking_attempt');
        }
      }
    };

    checkForStaleBooking();
  }, []); // Run only on mount

  // ==========================================
  // ✅ CLEANUP ON UNMOUNT
  // ==========================================
  useEffect(() => {
    return () => {
      if (!bookingLoading && !isRazorpayOpen) {
        const storedAttempt = sessionStorage.getItem('current_booking_attempt');
        if (storedAttempt) {
          try {
            const parsed = JSON.parse(storedAttempt);
            const attemptAge = Date.now() - parsed.timestamp;

            if (attemptAge > UNMOUNT_CLEANUP_THRESHOLD_MS) {
              console.log('Clearing old attempt on unmount');
              sessionStorage.removeItem('current_booking_attempt');
            }
          } catch (error) {
            console.error('Cleanup error:', error);
          }
        }
      }
    };
  }, [bookingLoading, isRazorpayOpen]);

  // ==========================================
  // LOAD RAZORPAY SCRIPT
  // ==========================================
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      toast.error('Payment service failed to load. Please refresh the page.');
    };
    document.body.appendChild(script);
    
    return () => {
      try {
        document.body.removeChild(script);
      } catch (e) {
        // Script already removed
      }
    };
  }, []);

  // ==========================================
  // FETCH COUNSELOR DATA WITH AUTO-REFRESH
  // ==========================================
  useEffect(() => {
    let intervalId;
    const alignAndStart = () => {
      fetchCounselorData();
      const temp = dayjs().tz(TIMEZONE).second();
      const delay = (60 - temp) * 1000;
      setTimeout(() => {
        fetchCounselorData(true); // ✅ Skip loading on auto-refresh
        intervalId = setInterval(() => fetchCounselorData(true), 60000);
      }, delay);
    };
    alignAndStart();
    return () => clearInterval(intervalId);
  }, [counselorId]);

  // ==========================================
  // ✅ FETCH COUNSELOR DATA (RACE CONDITION FIX)
  // ==========================================
  const fetchCounselorData = async (skipLoading = false) => {
    try {
      if (!skipLoading) {
        setLoading(true);
      }

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.BOOKING_COUNSELOR_SLOTS}/${counselorId}/slots`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('clientAccessToken')}` },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCounselor(data.counselor);

        // ✅ Don't update slots if payment is in progress
        if (!bookingLoading && !isRazorpayOpen) {
          setSlots(data.slots || []);
        }
      } else {
        toast.error('Unable to retrieve counselor information');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      if (!skipLoading) {
        toast.error('Unable to retrieve counselor information');
      }
    } finally {
      if (!skipLoading) {
        setLoading(false);
      }
    }
  };

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================
  const getAvailableDates = (slotsArray) => {
    const today = dayjs().tz(TIMEZONE);
    return slotsArray
      .filter((slot) => slot.status === 'available' && !slot.isBooked)
      .map((slot) => dayjs(slot.startTime).tz(TIMEZONE).format('YYYY-MM-DD'))
      .filter((date, i, arr) => arr.indexOf(date) === i)
      .filter((date) => dayjs(date).isSameOrAfter(today, 'day'))
      .sort();
  };

  const availableDates = getAvailableDates(slots);

  const formatDateToString = (date) => {
    if (!date) return null;
    return dayjs(date).format('YYYY-MM-DD');
  };

  const getSlotsForDate = (date) => {
    const dateStr = formatDateToString(date);
    return slots
      .filter((slot) => {
        const slotDate = dayjs(slot.startTime).tz(TIMEZONE).format('YYYY-MM-DD');
        return slotDate === dateStr && slot.status === 'available' && !slot.isBooked;
      })
      .sort((a, b) => dayjs(a.startTime).diff(dayjs(b.startTime)));
  };

  const selectedDateSlots = getSlotsForDate(selectedDate);

  const getSlotPrice = (slot) => slot.totalPriceAfterPlatformFee;

  const getClientData = () =>
    localStorage.getItem('client') ? JSON.parse(localStorage.getItem('client')) : null;

  // ==========================================
  // ✅ OPEN BOOKING MODAL (WITH VALIDATION + IDEMPOTENCY)
  // ==========================================
  const openBookingModal = (slot) => {
    // Validate booking window
    const now = dayjs().tz(TIMEZONE);
    const slotStart = dayjs(slot.startTime).tz(TIMEZONE);
    const minutesUntil = slotStart.diff(now, 'minutes');

    if (minutesUntil < 0) {
      toast.error('This slot has already started. Please select a future time slot.');
      return;
    }

    if (minutesUntil < MINIMUM_BOOKING_WINDOW_MINUTES) {
      toast.error(
        `This slot starts in ${minutesUntil} minutes. Please book at least ${MINIMUM_BOOKING_WINDOW_MINUTES} minutes in advance.`,
        { duration: 5000 }
      );
      return;
    }

    setSelectedSlot(slot);

    // ✅ Generate idempotency key
    const clientData = getClientData();
    if (clientData) {
      const idempotencyKey = `${clientData._id}_${slot._id}_${Date.now()}_${uuidv4()}`;
      setCurrentIdempotencyKey(idempotencyKey);
      sessionStorage.setItem(
        'current_booking_attempt',
        JSON.stringify({
          key: idempotencyKey,
          slotId: slot._id,
          timestamp: Date.now(),
        })
      );
    }

    setShowBookingModal(true);
  };

  // ==========================================
  // CLOSE BOOKING MODAL
  // ==========================================
  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedSlot(null);
    // Don't clear idempotency key - user might retry
  };

  // ==========================================
  // ✅ INITIATE PAYMENT (FULL ERROR HANDLING + IDEMPOTENCY)
  // ==========================================
  const initiatePayment = async (isRetry = false) => {
    if (!selectedSlot) return;

    if (!razorpayLoaded) {
      toast.error('Payment service is loading. Please try again shortly.');
      return;
    }

    // Check network status
    if (!isOnline) {
      toast.error('No internet connection. Please check your network and try again.');
      return;
    }

    try {
      setBookingLoading(true);

      const clientData = getClientData();
      if (!clientData || !localStorage.getItem('clientAccessToken')) {
        toast.error('Please log in again to proceed.');
        setBookingLoading(false);
        return;
      }

      const amount = getSlotPrice(selectedSlot);

      // ✅ Use existing idempotency key or recover from sessionStorage
      let idempotencyKey = currentIdempotencyKey;

      if (!idempotencyKey) {
        const storedAttempt = sessionStorage.getItem('current_booking_attempt');
        if (storedAttempt) {
          const parsed = JSON.parse(storedAttempt);
          if (parsed.slotId === selectedSlot._id) {
            idempotencyKey = parsed.key;
            setCurrentIdempotencyKey(idempotencyKey);
          }
        }

        if (!idempotencyKey) {
          idempotencyKey = `${clientData._id}_${selectedSlot._id}_${Date.now()}_${uuidv4()}`;
          setCurrentIdempotencyKey(idempotencyKey);
          sessionStorage.setItem(
            'current_booking_attempt',
            JSON.stringify({
              key: idempotencyKey,
              slotId: selectedSlot._id,
              timestamp: Date.now(),
            })
          );
        }
      }

      // Get Razorpay key
      const keyResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PAYMENT_GET_KEY}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('clientAccessToken')}`,
        },
        credentials: 'include',
      });

      if (!keyResponse.ok) throw new Error('Failed to retrieve payment key');
      const keyData = await keyResponse.json();

      // ✅ Create order with idempotency key
      const orderResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PAYMENT_CHECKOUT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('clientAccessToken')}`,
          'Idempotency-Key': idempotencyKey, // ✅ CRITICAL
        },
        credentials: 'include',
        body: JSON.stringify({ amount, clientId: clientData._id, slotId: selectedSlot._id }),
      });

      const orderData = await orderResponse.json();

      // ✅ Handle specific error cases
      if (!orderResponse.ok) {
        // 409 Conflict - Request already processing
        if (orderResponse.status === 409) {
          toast.info(orderData.message || 'Your request is being processed. Please wait...', {
            duration: 3000,
          });
          setBookingLoading(false);
          return;
        }

        // 503 Service Unavailable - Gateway timeout (retryable)
        if (orderResponse.status === 503 && orderData.data?.retryable) {
          toast.error(orderData.message);
          toast.info('Retrying automatically...', { duration: 2000 });
          setTimeout(() => {
            initiatePayment(true); // Retry with same idempotency key
          }, orderData.data.retryAfter || 5000);
          return;
        }

        // Other errors
        toast.error(orderData.message || 'Unable to create payment order');
        setBookingLoading(false);
        return;
      }

      if (!orderData.success || !orderData.data || !orderData.data.order) {
        toast.error('Unable to create payment order');
        setBookingLoading(false);
        return;
      }

      // Handle cached response
      if (orderData.data._cached || orderData.message?.includes('cached')) {
        toast.info('Resuming previous payment attempt...');
      } else if (isRetry) {
        toast.success('Retry successful. Proceeding with payment...');
      }

      setIsRazorpayOpen(true);

      setTimeout(() => {
        const options = {
          key: keyData.data.key,
          amount: orderData.data.order.amount,
          currency: 'INR',
          name: 'Solvit',
          description: `Therapy Session with ${counselor.fullName}`,
          order_id: orderData.data.order.id,
          handler: async (response) => {
            setIsRazorpayOpen(false);
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              clientId: clientData._id,
              slotId: selectedSlot._id,
            });
          },
          prefill: {
            name: clientData.fullName,
            email: clientData.email,
            contact: clientData.phone || '9999999999',
          },
          notes: {
            counselor: counselor.fullName,
            session_date: formatDateToString(selectedDate),
            idempotencyKey: idempotencyKey,
          },
          theme: { color: '#1C3C63' },
          modal: {
            ondismiss: () => {
              setIsRazorpayOpen(false);
              setBookingLoading(false);
              toast.info('Payment cancelled. You can try again anytime.');
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();

        razorpay.on('payment.failed', (response) => {
          setIsRazorpayOpen(false);
          const errorMsg = response.error?.description || 'Payment unsuccessful';
          toast.error(errorMsg, { duration: 5000 });
          setBookingLoading(false);
        });
      }, 100);
    } catch (error) {
      console.error('Payment initiation error:', error);
      if (error.message.includes('fetch') || error.message.includes('network')) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error('Unable to initiate payment. Please try again.');
      }
      setBookingLoading(false);
    }
  };

  // ==========================================
  // ✅ VERIFY PAYMENT (COMPREHENSIVE ERROR HANDLING)
  // ==========================================
  const verifyPayment = async (paymentData) => {
    try {
      // ✅ Use same idempotency key
      let idempotencyKey = currentIdempotencyKey;

      if (!idempotencyKey) {
        const storedAttempt = sessionStorage.getItem('current_booking_attempt');
        if (storedAttempt) {
          const parsed = JSON.parse(storedAttempt);
          if (parsed.slotId === paymentData.slotId) {
            idempotencyKey = parsed.key;
          }
        }

        if (!idempotencyKey) {
          console.error('No idempotency key found for verification');
          const clientData = getClientData();
          if (clientData && paymentData.slotId) {
            idempotencyKey = `${clientData._id}_${paymentData.slotId}_${Date.now()}_${uuidv4()}`;
          } else {
            toast.error('Unable to verify payment. Please contact support with your payment ID.');
            setBookingLoading(false);
            return;
          }
        }
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PAYMENT_VERIFICATION}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('clientAccessToken')}`,
          'Idempotency-Key': idempotencyKey, // ✅ CRITICAL
        },
        credentials: 'include',
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      // ✅ Success cases
      if (response.ok && data.success) {
        const booking = data.data.booking;

        // Clear idempotency key - booking successful
        setCurrentIdempotencyKey(null);
        sessionStorage.removeItem('current_booking_attempt');

        // Handle cached/duplicate responses
        if (data.data._cached) {
          toast.info('Returning cached booking confirmation');
        } else if (data.data._duplicate) {
          toast.info('This booking was already confirmed');
        } else {
          toast.success('Payment completed! Session booked successfully.', { duration: 4000 });
        }

        // Update slot UI immediately
        setSlots((prev) =>
          prev.map((slot) =>
            slot._id === selectedSlot._id ? { ...slot, status: 'booked', isBooked: true } : slot
          )
        );

        // Close modal
        setShowBookingModal(false);
        setSelectedSlot(null);

        // Navigate to success page
        setTimeout(() => {
          navigate(`/session-success/${booking._id}`);
        }, 1500);
        return;
      }

      // ✅ Handle 400 Bad Request (Invalid signature)
      if (response.status === 400) {
        toast.error(data.message || 'Payment verification failed. Please try again.', {
          duration: 6000,
        });

        // Clear this attempt - it's invalid
        setCurrentIdempotencyKey(null);
        sessionStorage.removeItem('current_booking_attempt');
        setShowBookingModal(false);
        setBookingLoading(false);
        return;
      }

      // ✅ 409 Conflict - Request already processing
      if (response.status === 409) {
        toast.info(data.message || 'Verification in progress. Please wait...', {
          duration: 3000,
        });

        // Check status after a delay
        setTimeout(() => {
          checkBookingStatus(paymentData.slotId);
        }, 3000);
        return;
      }

      // ✅ Payment verification failed with refund info
      const errorMessage = data.message || 'Payment verification unsuccessful';

      if (data.data?.refundInfo?.refunded) {
        toast.error(errorMessage, {
          duration: 8000,
          description: 'Your payment has been refunded automatically.',
        });
      } else if (data.data?.refundInfo?.pending) {
        toast.error(errorMessage, {
          duration: 8000,
          description: 'Refund will be processed within 24-48 hours.',
        });
      } else {
        toast.error(errorMessage, { duration: 6000 });
      }

      // Clear this booking attempt
      setCurrentIdempotencyKey(null);
      sessionStorage.removeItem('current_booking_attempt');

      // Refresh slots
      fetchCounselorData();

      // Close modal
      setShowBookingModal(false);
      setSelectedSlot(null);
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error(
        'Unable to verify payment. If money was deducted, it will be refunded automatically.',
        { duration: 8000 }
      );

      // Refresh slots
      fetchCounselorData();
    } finally {
      setBookingLoading(false);
      setIsRazorpayOpen(false);
    }
  };

  // ==========================================
  // ✅ CHECK BOOKING STATUS (FOR RECOVERY)
  // ==========================================
  const checkBookingStatus = async (slotId) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PAYMENT_CHECK_RECENT}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('clientAccessToken')}`,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success && data.data.recentBooking) {
        toast.success('Your booking was successful!');

        // Clear attempt
        setCurrentIdempotencyKey(null);
        sessionStorage.removeItem('current_booking_attempt');

        // Navigate to success page
        navigate(`/session-success/${data.data.recentBooking._id}`);
      } else {
        toast.info('No recent booking found. You can try booking again.', {
          duration: 5000,
        });

        // Clear attempt and refresh
        setCurrentIdempotencyKey(null);
        sessionStorage.removeItem('current_booking_attempt');
        fetchCounselorData();
      }
    } catch (error) {
      console.error('Status check error:', error);
      toast.error('Unable to check booking status. Please refresh the page.');
    }
  };

  // Disable dates that don't have available slots
  const disabledDays = (date) => {
    const dateStr = formatDateToString(date);
    const isPast = dayjs(date).isBefore(dayjs().tz(TIMEZONE), 'day');
    return isPast || !availableDates.includes(dateStr);
  };

  // ==========================================
  // LOADING SKELETON
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen bg-transparent py-20 lg:py-28 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <Skeleton className="h-96 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-[600px] w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR STATE
  // ==========================================
  if (!counselor) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <Card className="max-w-md w-full shadow-2xl">
            <CardContent className="pt-6 text-center space-y-4">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
              <h3 className="text-xl font-semibold">Counselor Not Found</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                We couldn't locate this counselor's profile. Please try again later.
              </p>
              <Button onClick={() => navigate('/browse-counselors')} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Browse
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ==========================================
  // MAIN RENDER
  // ==========================================
  return (
    <div className="relative min-h-screen bg-transparent overflow-hidden">
      {/* ✅ Network Status Indicator */}
      {!isOnline && (
        <div className="fixed top-4 right-4 z-50">
          <Alert variant="destructive" className="shadow-lg">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>No internet connection</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/2 w-72 h-72 bg-primary-400/10 dark:bg-primary-600/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-24 right-10 w-96 h-96 bg-primary-500/10 dark:bg-primary-700/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '500ms' }}
        />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Counselors
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        {/* Mobile Tabs */}
        <div className="lg:hidden mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 h-12 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md border border-primary-200/50 dark:border-primary-800/50 p-1 rounded-xl">
              <TabsTrigger
                value="overview"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-700 data-[state=active]:to-primary-600 data-[state=active]:text-white font-semibold transition-all duration-300 gap-2"
              >
                <Users className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="availability"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary-700 data-[state=active]:to-primary-600 data-[state=active]:text-white font-semibold transition-all duration-300 gap-2"
              >
                <CalendarIcon className="w-4 h-4" />
                Book Session
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <ProfileCard counselor={counselor} imgError={imgError} setImgError={setImgError} />
              <AboutCard counselor={counselor} />
              <SpecializationsCard counselor={counselor} />
              <LanguagesCard counselor={counselor} />
              <EducationCard counselor={counselor} />
            </TabsContent>

            <TabsContent value="availability" className="space-y-4">
              <CalendarCard
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                availableDates={availableDates}
                disabledDays={disabledDays}
                selectedDateSlots={selectedDateSlots}
                getSlotPrice={getSlotPrice}
                openBookingModal={openBookingModal}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop Layout */}
        <motion.div
          className="hidden lg:grid lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Left Column - Profile */}
          <div className="space-y-6">
            <ProfileCard counselor={counselor} imgError={imgError} setImgError={setImgError} />
            <AboutCard counselor={counselor} />
            <SpecializationsCard counselor={counselor} />
            <LanguagesCard counselor={counselor} />
            <EducationCard counselor={counselor} />
          </div>

          {/* Middle & Right Columns - Calendar */}
          <div className="lg:col-span-2">
            <CalendarCard
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              availableDates={availableDates}
              disabledDays={disabledDays}
              selectedDateSlots={selectedDateSlots}
              getSlotPrice={getSlotPrice}
              openBookingModal={openBookingModal}
            />
          </div>
        </motion.div>
      </div>

      {/* Booking Confirmation Modal */}
      <BookingModal
        show={showBookingModal}
        onClose={closeBookingModal}
        selectedSlot={selectedSlot}
        counselor={counselor}
        getSlotPrice={getSlotPrice}
        initiatePayment={initiatePayment}
        bookingLoading={bookingLoading}
        isRazorpayOpen={isRazorpayOpen}
        selectedDate={selectedDate}
        razorpayLoaded={razorpayLoaded}
        isOnline={isOnline}
      />

      {/* Sticky Bottom CTA (Mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-200 dark:border-neutral-800 p-4 z-30 shadow-lg">
        <Button
          className="w-full gap-2 h-12 text-base bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          size="lg"
          onClick={() => {
            setActiveTab('availability');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <CalendarIcon className="w-5 h-5" />
          Book Your Session
        </Button>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENT: PROFILE CARD
// ==========================================
const ProfileCard = ({ counselor, imgError, setImgError }) => (
  <motion.div variants={cardVariants}>
    <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-primary-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/30 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 hover:scale-[1.02] transition-all duration-500">
      <CardContent className="pt-6 relative pb-6">
        <div className="flex flex-col items-center text-center space-y-4 flex-wrap">
          <Avatar className="ring-4 ring-background shadow-2xl group-hover:scale-110 transition-transform duration-300" size="2xl">
            <AvatarImage
              src={!imgError ? counselor.profilePicture : undefined}
              alt={counselor.fullName}
              onError={() => setImgError(true)}
            />
            <AvatarFallback className="text-4xl bg-gradient-to-br from-primary-700 to-primary-600 text-white font-bold">
              {counselor.fullName.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-2 w-full">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 dark:from-primary-400 dark:via-primary-300 dark:to-secondary-400 bg-clip-text text-transparent">
                {counselor.fullName}
              </h1>
            </div>
          </div>

          <Separator className="w-full" />

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 w-full pt-2">
            <div className="text-center p-3 rounded-lg bg-primary-50 dark:bg-primary-900/30 transition-all duration-300 hover:bg-primary-100 dark:hover:bg-primary-800/30">
              <div className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                {counselor.experienceYears}+
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">Years Exp.</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-primary-50 dark:bg-primary-900/30 transition-all duration-300 hover:bg-primary-100 dark:hover:bg-primary-800/30">
              <div className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                <Star className="w-6 h-6 inline fill-amber-500 text-amber-500" />
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">Top Rated</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-primary-50 dark:bg-primary-900/30 transition-all duration-300 hover:bg-primary-100 dark:hover:bg-primary-800/30">
              <div className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                <Video className="w-6 h-6 inline" />
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">Video Call</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// ==========================================
// COMPONENT: ABOUT CARD
// ==========================================
const AboutCard = ({ counselor }) => {
  if (!counselor.application?.professionalSummary) return null;

  return (
    <motion.div variants={cardVariants}>
      <Card className="group relative h-full bg-gradient-to-br from-white via-white to-primary-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/30 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 hover:scale-[1.02] transition-all duration-500">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500/10 to-transparent rounded-bl-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="relative pb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <Heart className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl font-bold text-neutral-900 dark:text-white leading-tight">
            About Me
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {counselor.application.professionalSummary}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ==========================================
// COMPONENT: SPECIALIZATIONS CARD
// ==========================================
const SpecializationsCard = ({ counselor }) => {
  if (!counselor.specialization) return null;

  const specs = Array.isArray(counselor.specialization)
    ? counselor.specialization
    : [counselor.specialization];

  return (
    <motion.div variants={cardVariants}>
      <Card className="group relative h-full bg-gradient-to-br from-white via-white to-primary-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/30 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 hover:scale-[1.02] transition-all duration-500">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500/10 to-transparent rounded-bl-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="relative pb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <Sparkles className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl font-bold text-neutral-900 dark:text-white leading-tight">
            I Can Help You With
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {specs.map((spec, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="gap-2 px-3 py-1.5 text-sm border-primary-300 dark:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                {spec}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ==========================================
// COMPONENT: LANGUAGES CARD
// ==========================================
const LanguagesCard = ({ counselor }) => {
  if (!counselor.application?.languages || counselor.application.languages.length === 0)
    return null;

  return (
    <motion.div variants={cardVariants}>
      <Card className="group relative h-full bg-gradient-to-br from-white via-white to-primary-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/30 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 hover:scale-[1.02] transition-all duration-500">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500/10 to-transparent rounded-bl-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="relative pb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <Languages className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl font-bold text-neutral-900 dark:text-white leading-tight">
            Languages I Speak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {counselor.application.languages[0].map((lang, idx) => (
              <Badge
                key={idx}
                className="gap-2 px-4 py-2 text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-300 dark:border-primary-700 hover:bg-primary-200 dark:hover:bg-primary-800/30 transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {lang}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ==========================================
// COMPONENT: EDUCATION CARD
// ==========================================
const EducationCard = ({ counselor }) => {
  const hasEducation =
    counselor.application?.education?.graduation ||
    counselor.application?.education?.postGraduation;

  if (!hasEducation && !counselor.experienceLevel) return null;

  return (
    <motion.div variants={cardVariants}>
      <Card className="group relative h-full bg-gradient-to-br from-white via-white to-primary-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/30 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 hover:scale-[1.02] transition-all duration-500">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-500/10 to-transparent rounded-bl-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="relative pb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <GraduationCap className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl font-bold text-neutral-900 dark:text-white leading-tight">
            Professional Background
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Experience Level */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/20 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="bg-primary-100 dark:bg-primary-900/50 p-3 rounded-full">
                <Briefcase className="w-6 h-6 text-primary-700 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                  {counselor.experienceYears}+ Years
                </p>
              </div>
            </div>
          </div>

          {/* Education */}
          {hasEducation && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                <p className="font-semibold text-sm text-neutral-900 dark:text-white">Education</p>
              </div>
              {counselor.application?.education?.graduation && (
                <div className="pl-4 border-l-2 border-primary-300 dark:border-primary-700">
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    {counselor.application.education.graduation.degree}
                  </p>
                </div>
              )}
              {counselor.application?.education?.postGraduation && (
                <div className="pl-4 border-l-2 border-primary-300 dark:border-primary-700">
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    {counselor.application.education.postGraduation.degree}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ==========================================
// COMPONENT: CALENDAR CARD
// ==========================================
const CalendarCard = ({
  selectedDate,
  setSelectedDate,
  availableDates,
  disabledDays,
  selectedDateSlots,
  getSlotPrice,
  openBookingModal,
}) => {
  const hasSlotsDates = availableDates.map((dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return new Date(year, month - 1, day).toLocaleDateString();
  });

  return (
    <motion.div variants={cardVariants}>
      <Card className="sticky top-24 shadow-2xl bg-gradient-to-br from-white via-white to-primary-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/30 border border-neutral-200 dark:border-neutral-800">
        <CardHeader className="bg-gradient-to-r from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-800/20">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary-700 dark:text-primary-400" />
            Book Your Session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          {/* Calendar Component */}
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={disabledDays}
              hasSlotsDates={hasSlotsDates}
              variant="elevated"
              className="rounded-lg"
              initialFocus
            />
          </div>

          <Separator />

          {/* Selected Date Slots */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                {dayjs(selectedDate).format('dddd, MMMM D')}
              </p>
              <Badge variant="outline" className="gap-1 border-primary-300 dark:border-primary-700">
                <Clock className="w-3 h-3" />
                {selectedDateSlots.length} available
              </Badge>
            </div>

            <div className="max-h-[320px] overflow-y-auto space-y-3 pr-2">
              {selectedDateSlots.length > 0 ? (
                selectedDateSlots.map((slot, idx) => (
                  <motion.div
                    key={slot._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="p-4 rounded-lg border-2 border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-white to-primary-50/50 dark:from-neutral-900 dark:to-primary-900/20 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-lg hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        <span className="font-semibold text-sm text-neutral-900 dark:text-white">
                          {dayjs(slot.startTime).tz(TIMEZONE).format('hh:mm A')}
                        </span>
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">-</span>
                        <span className="font-semibold text-sm text-neutral-900 dark:text-white">
                          {dayjs(slot.endTime).tz(TIMEZONE).format('hh:mm A')}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        45 mins
                      </Badge>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                          ₹{getSlotPrice(slot)}
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          per session
                        </p>
                      </div>
                      <Button
                        onClick={() => openBookingModal(slot)}
                        size="sm"
                        className="gap-2 bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                      >
                        <Video className="w-4 h-4" />
                        Book Now
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-neutral-600 dark:text-neutral-400">
                  <CalendarIcon className="w-16 h-16 mx-auto mb-3 opacity-20" />
                  <p className="font-medium">No slots available</p>
                  <p className="text-xs">Please select another date</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ==========================================
// COMPONENT: BOOKING MODAL
// ==========================================
const BookingModal = ({
  show,
  onClose,
  selectedSlot,
  counselor,
  getSlotPrice,
  initiatePayment,
  bookingLoading,
  isRazorpayOpen,
  selectedDate,
  razorpayLoaded,
  isOnline,
}) => (
  <Dialog open={show} onOpenChange={onClose}>
    <DialogContent className={clsx('max-w-md', isRazorpayOpen && 'z-[2147483646]')}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl">
          <CheckCircle className="w-6 h-6 text-primary-600" />
          Confirm Booking
        </DialogTitle>
        <DialogDescription>Review your session details before payment</DialogDescription>
      </DialogHeader>

      {selectedSlot && counselor && (
        <div className="space-y-4 py-4">
          {/* Counselor Info */}
          <div className="flex items-start gap-4 p-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
            <Avatar className="w-16 h-16 ring-2 ring-primary-200 dark:ring-primary-800">
              <AvatarImage src={counselor.profilePicture} alt={counselor.fullName} />
              <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-primary-700 to-primary-600 text-white">
                {counselor.fullName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-base text-neutral-900 dark:text-white">
                {counselor.fullName}
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {Array.isArray(counselor.specialization)
                  ? counselor.specialization.join(', ')
                  : counselor.specialization}
              </p>
              <Badge className="mt-1 gap-1 text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
                <Shield className="w-3 h-3" />
                Verified
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Session Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Date
              </span>
              <span className="font-semibold text-sm text-neutral-900 dark:text-white">
                {dayjs(selectedSlot.startTime).tz(TIMEZONE).format('ddd, MMM D, YYYY')}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time
              </span>
              <span className="font-semibold text-sm text-neutral-900 dark:text-white">
                {dayjs(selectedSlot.startTime).tz(TIMEZONE).format('hh:mm A')} -{' '}
                {dayjs(selectedSlot.endTime).tz(TIMEZONE).format('hh:mm A')}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                <Video className="w-4 h-4" />
                Duration
              </span>
              <span className="font-semibold text-sm text-neutral-900 dark:text-white">
                45 minutes
              </span>
            </div>
          </div>

          <Separator />

          {/* Payment Summary */}
          <div className="bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-800/20 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Amount</span>
              <span className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                ₹{getSlotPrice(selectedSlot)}
              </span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Inclusive of all taxes
            </p>
          </div>

          {/* Info Alert */}
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription className="text-sm">
              You can join the session 5-10 minutes before the scheduled time
            </AlertDescription>
          </Alert>
        </div>
      )}

      <DialogFooter className="gap-2">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={bookingLoading || isRazorpayOpen}
        >
          Cancel
        </Button>
        <Button
          onClick={() => initiatePayment(false)}
          disabled={bookingLoading || !razorpayLoaded || !isOnline}
          className="bg-gradient-to-r from-primary-700 to-primary-600 hover:from-primary-800 hover:to-primary-700"
        >
          {bookingLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Proceed to Payment
            </>
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default BookCounselorCalendar;
