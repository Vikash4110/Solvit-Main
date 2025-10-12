import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  X,
  Loader2,
  User,
  Shield,
  Star,
  Languages,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Award,
  BookOpen,
  Heart,
  Stethoscope,
  CheckCircle,
  CreditCard,
  MessageCircle,
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

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const BookCounselorCalendar = () => {
  const { counselorId } = useParams();
  const navigate = useNavigate();

  // State management
  const [counselor, setCounselor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs().tz(TIMEZONE).format('YYYY-MM-DD'));
  const [currentMonth, setCurrentMonth] = useState(dayjs().tz(TIMEZONE));
  const [bookingLoading, setBookingLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [imgError, setImgError] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => console.error('Failed to load Razorpay script');
    document.body.appendChild(script);
    return () => document.body.removeChild(script);
  }, []);

  // Fetch counselor data
  useEffect(() => {
    let intervalId;
    const alignAndStart = () => {
      fetchCounselorData();
      const temp = dayjs().tz(TIMEZONE).second();
      const delay = (60 - temp) * 1000;
      setTimeout(() => {
        fetchCounselorData();
        intervalId = setInterval(fetchCounselorData, 60000);
      }, delay);
    };
    alignAndStart();
    return () => clearInterval(intervalId);
  }, [counselorId]);

  const fetchCounselorData = async () => {
    try {
      setLoading(true);
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
        setSlots(data.slots || []);
      } else {
        toast.error('Unable to retrieve counselor information');
      }
    } catch {
      toast.error('Unable to retrieve counselor information');
    } finally {
      setLoading(false);
    }
  };

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

  const getSlotsForDate = (date) =>
    slots
      .filter((slot) => {
        const slotDate = dayjs(slot.startTime).tz(TIMEZONE).format('YYYY-MM-DD');
        return slotDate === date && slot.status === 'available' && !slot.isBooked;
      })
      .sort((a, b) => dayjs(a.startTime).diff(dayjs(b.startTime)));

  const selectedDateSlots = getSlotsForDate(selectedDate);
  const getSlotPrice = (slot) => slot.totalPriceAfterPlatformFee;
  const getClientData = () =>
    localStorage.getItem('client') ? JSON.parse(localStorage.getItem('client')) : null;

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) =>
      direction === 'next' ? prev.add(1, 'month') : prev.subtract(1, 'month')
    );
  };

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
        return;
      }

      const amount = getSlotPrice(selectedSlot);

      // Get payment key
      const keyResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PAYMENT_GET_KEY}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${localStorage.getItem('clientAccessToken')}` },
        credentials: 'include',
      });

      if (!keyResponse.ok) throw new Error('Failed to retrieve payment key');
      const keyData = await keyResponse.json();
      if (!keyData.data || !keyData.data.key) throw new Error('Invalid payment key response');

      // Create order
      const orderResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PAYMENT_CHECKOUT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('clientAccessToken')}`,
        },
        credentials: 'include',
        body: JSON.stringify({ amount, clientId: clientData._id, slotId: selectedSlot._id }),
      });

      const orderData = await orderResponse.json();
      if (!orderData.success || !orderData.data || !orderData.data.order) {
        toast.error('Unable to create payment order');
        setBookingLoading(false);
        return;
      }

      // CRITICAL FIX: Close the dialog BEFORE opening Razorpay
      setShowBookingModal(false);

      // Small delay to ensure dialog closes completely
      setTimeout(() => {
        const options = {
          key: keyData.data.key,
          amount: orderData.data.order.amount,
          currency: 'INR',
          name: 'Solvit',
          description: `Therapy Session with ${counselor.fullName}`,
          order_id: orderData.data.order.id,
          handler: async (response) =>
            await verifyPayment({
              ...response,
              clientId: clientData._id,
              slotId: selectedSlot._id,
            }),
          prefill: {
            name: clientData.fullName,
            email: clientData.email,
            contact: clientData.phone || '9999999999',
          },
          notes: { counselor: counselor.fullName, session_date: selectedDate },
          theme: { color: '#1C3C63' },
          modal: {
            ondismiss: () => {
              setBookingLoading(false);
              // Re-open booking modal if user cancels payment
              setShowBookingModal(true);
              toast('Payment cancelled');
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
        razorpay.on('payment.failed', (response) => {
          toast.error('Payment unsuccessful. Please try again.');
          setBookingLoading(false);
          // Re-open booking modal on failure
          setShowBookingModal(true);
        });
      }, 300); // 300ms delay for smooth transition
    } catch {
      toast.error('Unable to initiate payment. Please try again.');
      setBookingLoading(false);
    }
  };

  const verifyPayment = async (paymentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PAYMENT_VERIFICATION}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('clientAccessToken')}`,
        },
        credentials: 'include',
        body: JSON.stringify(paymentData),
      });
      const data = await response.json();
      if (data.success) {
        const booking = data.data.booking;
        toast.success('Payment completed! Session booked successfully.');
        setSlots((prev) =>
          prev.map((slot) =>
            slot._id === selectedSlot._id ? { ...slot, status: 'booked', isBooked: true } : slot
          )
        );
        // Keep modal closed on success
        closeBookingModal();
        setTimeout(() => navigate(`/session-success/${booking._id}`), 2000);
      } else {
        toast.error(data.message || 'Payment verification unsuccessful');
        // Re-open booking modal on verification failure
        setShowBookingModal(true);
      }
    } catch {
      toast.error('Unable to verify payment');
      // Re-open booking modal on error
      setShowBookingModal(true);
    } finally {
      setBookingLoading(false);
    }
  };

  const openBookingModal = (slot) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedSlot(null);
  };

  // Enhanced Calendar rendering with beautiful styling
  const renderCalendar = () => {
    const days = [];
    const totalDays = currentMonth.daysInMonth();

    for (let i = 1; i <= totalDays; i++) {
      const dateStr = currentMonth.format('YYYY-MM') + '-' + (i < 10 ? '0' + i : i);
      days.push({
        date: i,
        isCurrentMonth: true,
        isAvailable: availableDates.includes(dateStr),
      });
    }

    const startDay = currentMonth.startOf('month').day();
    const emptyStart = Array(startDay).fill(null);

    return (
      <motion.div {...fadeInUp}>
        <Card
          variant="elevated"
          className="shadow-2xl border-primary-300/60 hover:border-primary-500/60"
        >
          {/* Calendar Header */}
          <CardHeader variant="primary">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => navigateMonth('prev')}
                className="hover:bg-white/80"
              >
                <ChevronLeft className="h-4 w-4 text-neutral-600" />
              </Button>

              <div className="text-center">
                <CardTitle variant="gradient" className="text-xl">
                  {currentMonth.format('MMMM YYYY')}
                </CardTitle>
                <p className="text-sm text-neutral-600 font-medium mt-1">
                  Choose your appointment date
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => navigateMonth('next')}
                className="hover:bg-white/80"
              >
                <ChevronRight className="h-4 w-4 text-neutral-600" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-4 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                <div
                  key={i}
                  className="text-center py-3 text-sm font-semibold text-neutral-500 tracking-wide"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-4">
              {emptyStart.map((_, idx) => (
                <div key={`empty-${idx}`} className="h-12" />
              ))}
              {days.map(({ date, isAvailable }, idx) => {
                const dateStr =
                  currentMonth.format('YYYY-MM') + '-' + (date < 10 ? '0' + date : date);
                const isSelected = dateStr === selectedDate;
                const isToday = dateStr === dayjs().tz(TIMEZONE).format('YYYY-MM-DD');

                return (
                  <motion.div
                    key={idx}
                    whileHover={isAvailable ? { scale: 1.05 } : {}}
                    whileTap={isAvailable ? { scale: 0.95 } : {}}
                  >
                    <Button
                      onClick={() => isAvailable && setSelectedDate(dateStr)}
                      disabled={!isAvailable}
                      variant="ghost"
                      size="iconSm"
                      className={clsx(
                        'relative text-sm font-semibold rounded-xl',
                        isSelected &&
                          'bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg ring-4 ring-primary-200/50 hover:bg-gradient-to-br hover:from-primary-600 hover:to-primary-700',

                        isAvailable &&
                          !isSelected &&
                          'bg-white/60 text-primary-700 hover:bg-primary-50 border border-primary-200/50 shadow-sm',
                        !isAvailable && 'bg-transparent text-neutral-300 cursor-not-allowed',
                        isToday &&
                          !isSelected &&
                          'ring-2 ring-coral-400/60 bg-coral-50/80 text-coral-700'
                      )}
                      aria-current={isSelected ? 'date' : undefined}
                      aria-disabled={!isAvailable}
                    >
                      {date}
                      {isAvailable && !isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-0.5 right-2.5 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 shadow-sm"
                        />
                      )}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 flex justify-center items-center p-4">
        <motion.div {...fadeInUp}>
          <Card variant="glass" className="max-w-md p-8 text-center shadow-2xl">
            <div className="relative mb-6 inline-block">
              <motion.div
                className="w-16 h-16 border-4 border-neutral-200 border-t-primary-700 rounded-full mx-auto"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <CardTitle variant="gradient" className="text-2xl mb-2">
              Loading Therapist Profile
            </CardTitle>
            <p className="text-neutral-600 font-medium">Preparing your healing journey...</p>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Counselor not found
  if (!counselor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 flex justify-center items-center p-4">
        <motion.div {...fadeInUp}>
          <Card variant="glass" className="max-w-lg p-12 text-center shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <User className="h-10 w-10 text-neutral-400" />
            </div>
            <CardTitle variant="gradient" className="text-3xl mb-4">
              Therapist Not Available
            </CardTitle>
            <p className="text-neutral-600 leading-relaxed font-medium">
              We couldn't locate this therapist's profile. Please try again later or contact our
              support team.
            </p>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-neutral-200/50 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <Button
            onClick={() => navigate(-1)}
            variant="secondary"
            className="shadow-md"
            aria-label="Back to Therapists"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Therapists
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Counselor Profile - Left */}
          <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="lg:col-span-4">
            <div className="sticky top-28">
              <Card
                className="shadow-2xl border-primary-300/60 hover:border-primary-500/60"
                variant="elevated"
              >
                <div className="h-4 bg-gradient-to-r from-primary-600 via-primary-800 to-primary-600"></div>

                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className="relative inline-block mb-6">
                      <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                        <Avatar className="w-32 h-32 border-4 border-white shadow-2xl mx-auto ring-4 ring-primary-200/60">
                          {!imgError && counselor.profilePicture ? (
                            <AvatarImage
                              src={counselor.profilePicture}
                              alt="Therapist profile"
                              onError={() => setImgError(true)}
                            />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 text-2xl font-bold">
                              <User className="w-16 h-16" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </motion.div>

                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="absolute -bottom-2 -right-2 rounded-full bg-gradient-to-r from-success-500 to-success-600 w-10 h-10 flex items-center justify-center shadow-lg ring-4 ring-white"
                      >
                        <CheckCircle className="w-5 h-5 text-white" />
                      </motion.div>
                    </div>

                    <CardTitle variant="gradient" className="text-3xl mb-2 tracking-tight">
                      {counselor.fullName}
                    </CardTitle>
                    <p className="text-neutral-600 mb-2 text-lg font-medium">
                      {counselor.specialization}
                    </p>
                    <p className="text-neutral-500 text-sm font-medium flex items-center justify-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Licensed Professional Counselor
                    </p>

                    {/* Enhanced Badges */}
                    <div className="flex flex-wrap justify-center gap-3 mb-8 mt-6">
                      <Badge variant="warning" size="default">
                        <Star className="w-3 h-3 mr-1 fill-current" /> 4.8 Rating
                      </Badge>
                      <Badge variant="blue" size="default">
                        <Award className="w-3 h-3 mr-1" /> 5+ Years
                      </Badge>
                      {counselor.application?.languages && (
                        <Badge variant="outline" size="default">
                          <Languages className="w-3 h-3 mr-1" />
                          {counselor.application.languages.join(', ')}
                        </Badge>
                      )}
                    </div>

                    {/* Service Features */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="text-center p-4 bg-gradient-to-br from-primary-50/80 to-primary-100/40 rounded-2xl backdrop-blur-sm border border-primary-200/30">
                        <Video className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-primary-700">Video Sessions</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-coral-50/80 to-coral-100/40 rounded-2xl backdrop-blur-sm border border-coral-200/30">
                        <MessageCircle className="w-6 h-6 text-coral-600 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-coral-700">Chat Support</p>
                      </div>
                    </div>
                  </div>

                  {counselor.application?.professionalSummary && (
                    <Card
                      variant="subtle"
                      className="bg-gradient-to-br from-neutral-50/80 to-neutral-100/40 border-neutral-200/50 backdrop-blur-sm"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <BookOpen className="w-5 h-5 text-primary-600" />
                          <CardTitle variant="small">About Your Therapist</CardTitle>
                        </div>
                        <p className="text-sm text-neutral-700 leading-relaxed font-medium">
                          {counselor.application.professionalSummary}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Time Slots - Middle - CUSTOM SCROLLBAR */}
          <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="lg:col-span-5">
            <Card
              variant="elevated"
              className="shadow-2xl border-primary-300/60 hover:border-primary-500/60 h-[calc(100vh-12rem)] flex flex-col"
            >
              {/* Fixed Header */}
              <CardHeader variant="primary" className="flex-shrink-0">
                <CardTitle variant="large" className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary-600" />
                  </div>
                  Available Session Times
                </CardTitle>
                {selectedDate && (
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="w-4 h-4 text-neutral-500" />
                    <p className="text-neutral-600 font-medium">
                      {dayjs(selectedDate).format('dddd, MMMM D, YYYY')} •{' '}
                      {selectedDateSlots.length} sessions available
                    </p>
                  </div>
                )}
              </CardHeader>

              {/* Scrollable Content Area with Custom Scrollbar */}
              <div className="flex-1 overflow-hidden">
                <CardContent className="h-full overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  <AnimatePresence mode="wait">
                    {selectedDate ? (
                      selectedDateSlots.length > 0 ? (
                        selectedDateSlots.map((slot, idx) => (
                          <motion.div
                            key={slot._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                          >
                            <Card
                              variant="elevated"
                              className="hover:shadow-2xl border-primary-300/60 hover:border-primary-500/60 cursor-pointer group"
                            >
                              <CardContent className="p-4">
                                <div className="flex justify-between items-center mb-6">
                                  <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-md">
                                      <Clock className="w-7 h-7 text-primary-600" />
                                    </div>
                                    <div>
                                      <h4 className="text-2xl font-bold bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent">
                                        {dayjs(slot.startTime).tz(TIMEZONE).format('h:mm A')}
                                      </h4>
                                      <p className="text-neutral-600 font-medium flex items-center gap-1">
                                        <Video className="w-4 h-4" />
                                        45 minutes session
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-3xl font-bold bg-gradient-to-r from-primary-700 to-primary-600 bg-clip-text text-transparent">
                                      ₹{getSlotPrice(slot)}
                                    </p>
                                    <p className="text-sm text-neutral-600 font-medium">
                                      per session
                                    </p>
                                  </div>
                                </div>

                                {/* Blue Book Session Button */}
                                <Button
                                  onClick={() => openBookingModal(slot)}
                                  variant="default"
                                  className="w-full group-hover:scale-[1.02] shadow-lg hover:shadow-xl"
                                  size="lg"
                                >
                                  <Heart className="w-5 h-5 mr-2" />
                                  Book This Session
                                  <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))
                      ) : (
                        <motion.div
                          {...fadeInUp}
                          className="flex items-center justify-center h-full"
                        >
                          <Card variant="subtle" className="p-12 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                              <Calendar className="w-10 h-10 text-neutral-400" />
                            </div>
                            <CardTitle variant="small" className="text-xl mb-2 text-neutral-600">
                              No Sessions Available
                            </CardTitle>
                            <p className="text-neutral-500 font-medium">
                              Please choose another date for your appointment
                            </p>
                          </Card>
                        </motion.div>
                      )
                    ) : (
                      <motion.div {...fadeInUp} className="flex items-center justify-center h-full">
                        <Card variant="primary" className="p-12 text-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Calendar className="w-10 h-10 text-primary-600" />
                          </div>
                          <CardTitle variant="gradient" className="text-xl mb-2">
                            Select a Date
                          </CardTitle>
                          <p className="text-neutral-600 font-medium">
                            Choose your preferred appointment date from the calendar
                          </p>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </div>
            </Card>
          </motion.div>

          {/* Calendar - Right */}
          <motion.div {...fadeInUp} transition={{ delay: 0.3 }} className="lg:col-span-3">
            <div className="sticky top-28">{renderCalendar()}</div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Booking Modal - CUSTOM SCROLLBAR & MATCHING DESIGN */}
      <Dialog open={showBookingModal} onOpenChange={closeBookingModal}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Gradient Header Bar - Matching Main Component */}
          <div className="h-3 bg-gradient-to-r from-primary-600 via-primary-800 to-primary-600"></div>

          {/* Compact Header */}
          <DialogHeader className="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-transparent via-primary-50/20 to-transparent border-b border-neutral-200/30">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center shadow-md ring-2 ring-primary-100/50">
                <CheckCircle className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary-800 to-primary-600 bg-clip-text text-transparent tracking-tight">
                  Confirm Your Session
                </DialogTitle>
                <DialogDescription className="text-neutral-600 font-medium text-sm">
                  Review and complete booking
                </DialogDescription>
              </div>
            </motion.div>
          </DialogHeader>

          {/* Custom Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
            <div className="h-full overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
              {selectedSlot && (
                <>
                  {/* Compact Session Info Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Card
                      variant="elevated"
                      className="shadow-lg border-primary-300/60 hover:border-primary-500/60 hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      <CardHeader
                        variant="primary"
                        className="bg-gradient-to-r from-primary-50/30 to-primary-100/20 border-b border-primary-200/30 px-5 py-3"
                      >
                        <CardTitle
                          variant="gradient"
                          className="flex items-center gap-2 text-lg font-bold"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center shadow-sm">
                            <Stethoscope className="w-4 h-4 text-primary-600" />
                          </div>
                          Session Details
                          <Badge variant="success" className="ml-auto text-xs">
                            <Video className="w-3 h-3 mr-1" />
                            Online
                          </Badge>
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Left Side - Compact Session Details */}
                          <div>
                            <h5 className="font-semibold text-primary-700 mb-3 flex items-center gap-1 text-sm">
                              <div className="w-4 h-4 bg-gradient-to-br from-primary-100 to-primary-200 rounded flex items-center justify-center">
                                <User className="w-2.5 h-2.5 text-primary-600" />
                              </div>
                              Appointment Info
                            </h5>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 p-2 bg-gradient-to-br from-neutral-50 to-neutral-100/60 rounded-lg border border-neutral-200/50">
                                <div className="w-6 h-6 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                                  <User className="w-3 h-3 text-primary-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs text-neutral-500 font-medium">Therapist</p>
                                  <p className="text-sm font-bold text-primary-700 truncate">
                                    {counselor.fullName}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 p-2 bg-gradient-to-br from-neutral-50 to-neutral-100/60 rounded-lg border border-neutral-200/50">
                                <div className="w-6 h-6 bg-gradient-to-br from-coral-100 to-coral-200 rounded-lg flex items-center justify-center">
                                  <Calendar className="w-3 h-3 text-coral-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs text-neutral-500 font-medium">Date</p>
                                  <p className="text-sm font-bold text-primary-700">
                                    {dayjs(selectedDate).format('MMM D, YYYY')}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 p-2 bg-gradient-to-br from-neutral-50 to-neutral-100/60 rounded-lg border border-neutral-200/50">
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                                  <Clock className="w-3 h-3 text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs text-neutral-500 font-medium">Time</p>
                                  <p className="text-sm font-bold text-primary-700">
                                    {dayjs(selectedSlot.startTime).tz(TIMEZONE).format('h:mm A')} •
                                    45 min
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right Side - Compact Features */}
                          <div>
                            <h5 className="font-semibold text-primary-700 mb-3 flex items-center gap-1 text-sm">
                              <div className="w-4 h-4 bg-gradient-to-br from-coral-100 to-coral-200 rounded flex items-center justify-center">
                                <Heart className="w-2.5 h-2.5 text-coral-600" />
                              </div>
                              What's Included
                            </h5>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 p-2 bg-gradient-to-br from-primary-50/80 to-primary-100/50 rounded-lg border border-primary-200/30">
                                <div className="w-6 h-6 bg-gradient-to-br from-success-100 to-success-200 rounded-lg flex items-center justify-center">
                                  <CheckCircle className="w-3 h-3 text-success-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-neutral-700">
                                    HD Video Session
                                  </p>
                                  <p className="text-xs text-neutral-600">Crystal clear quality</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 p-2 bg-gradient-to-br from-primary-50/80 to-primary-100/50 rounded-lg border border-primary-200/30">
                                <div className="w-6 h-6 bg-gradient-to-br from-success-100 to-success-200 rounded-lg flex items-center justify-center">
                                  <CheckCircle className="w-3 h-3 text-success-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-neutral-700">
                                    Session Recording
                                  </p>
                                  <p className="text-xs text-neutral-600">For reference</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 p-2 bg-gradient-to-br from-primary-50/80 to-primary-100/50 rounded-lg border border-primary-200/30">
                                <div className="w-6 h-6 bg-gradient-to-br from-success-100 to-success-200 rounded-lg flex items-center justify-center">
                                  <CheckCircle className="w-3 h-3 text-success-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-neutral-700">
                                    24/7 Support
                                  </p>
                                  <p className="text-xs text-neutral-600">Always available</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Compact Pricing Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Card className="bg-gradient-to-r from-primary-700 to-primary-800 text-white shadow-xl border-0 overflow-hidden relative">
                      {/* Background Effects */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-12 -mt-12"></div>

                      <CardContent className="p-5 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md">
                              <CreditCard className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-white/80 font-medium text-xs uppercase tracking-wide">
                                Total Amount
                              </p>
                              <p className="text-2xl font-bold text-white">
                                ₹{getSlotPrice(selectedSlot)}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <Badge
                              variant="glass"
                              className="bg-white/20 text-white border-white/30 mb-1 text-xs"
                            >
                              <Shield className="w-3 h-3 mr-1" />
                              Secure
                            </Badge>
                            <p className="text-white/80 text-xs">All taxes included</p>
                          </div>
                        </div>

                        {/* Compact Payment Methods */}
                        <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                          <p className="text-white/90 font-medium text-xs mb-2 uppercase tracking-wide">
                            Payment Options
                          </p>
                          <div className="flex items-center justify-center gap-4">
                            <div className="flex items-center gap-1 p-1.5 bg-white/10 rounded">
                              <CreditCard className="w-3 h-3 text-white/80" />
                              <span className="text-white/80 text-xs">Cards</span>
                            </div>
                            <div className="flex items-center gap-1 p-1.5 bg-white/10 rounded">
                              <Phone className="w-3 h-3 text-white/80" />
                              <span className="text-white/80 text-xs">UPI</span>
                            </div>
                            <div className="flex items-center gap-1 p-1.5 bg-white/10 rounded">
                              <Shield className="w-3 h-3 text-white/80" />
                              <span className="text-white/80 text-xs">Banking</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </>
              )}
            </div>
          </div>

          {/* Compact Footer */}
          <DialogFooter className="flex-shrink-0 border-t border-neutral-200/50 bg-gradient-to-t from-neutral-50/30 to-transparent backdrop-blur-sm px-6 py-4">
            <div className="w-full space-y-3">
              {/* Compact Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="flex gap-3"
              >
                <Button
                  onClick={closeBookingModal}
                  variant="outline"
                  className="flex-1 border-2 border-neutral-300/80 bg-white/80 hover:bg-white text-neutral-700 font-medium shadow-md hover:shadow-lg transition-all duration-300"
                  size="default"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>

                <Button
                  onClick={initiatePayment}
                  disabled={bookingLoading || !razorpayLoaded}
                  variant="default"
                  className="flex-2 font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900"
                  size="default"
                >
                  {bookingLoading || !razorpayLoaded ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      <span className="hidden sm:inline">Processing...</span>
                      <span className="sm:hidden">Wait...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Pay </span>
                      <span className="sm:hidden">Pay Now</span>
                    </>
                  )}
                </Button>
              </motion.div>

              {/* Compact Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="flex items-center justify-center gap-3 pt-2 border-t border-neutral-200/30"
              >
                <div className="flex items-center gap-1 p-1.5 bg-white/60 backdrop-blur-sm rounded shadow-sm">
                  <Shield className="w-3 h-3 text-success-500" />
                  <span className="text-xs text-neutral-700 font-medium">SSL</span>
                </div>
                <div className="flex items-center gap-1 p-1.5 bg-white/60 backdrop-blur-sm rounded shadow-sm">
                  <CheckCircle className="w-3 h-3 text-success-500" />
                  <span className="text-xs text-neutral-700 font-medium">HIPAA</span>
                </div>
                <div className="flex items-center gap-1 p-1.5 bg-white/60 backdrop-blur-sm rounded shadow-sm">
                  <Heart className="w-3 h-3 text-coral-500" />
                  <span className="text-xs text-neutral-700 font-medium">Private</span>
                </div>
              </motion.div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookCounselorCalendar;
