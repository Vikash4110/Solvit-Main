import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { paymentService } from '../services/payment';

const STALE_ATTEMPT_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes
const UNMOUNT_CLEANUP_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Enterprise Layer 3 Hook for Razorpay Payment & Checkout.
 * Manages Razorpay script injection, idempotency key generation, beforeunload protection,
 * state machine transitions, error recovery, and payment verification.
 */
export const usePaymentCheckout = () => {
  const navigate = useNavigate();
  const [bookingLoading, setBookingLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [currentIdempotencyKey, setCurrentIdempotencyKey] = useState(null);

  // Keep ref to avoid stale state in callbacks
  const idempotencyKeyRef = useRef(currentIdempotencyKey);
  useEffect(() => {
    idempotencyKeyRef.current = currentIdempotencyKey;
  }, [currentIdempotencyKey]);

  // ==========================================
  // 1. DYNAMICALLY LOAD RAZORPAY SCRIPT
  // ==========================================
  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

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
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      } catch (err) {
        console.error('Razorpay script cleanup error:', err);
      }
    };
  }, []);

  // ==========================================
  // 2. PREVENT ACCIDENTAL PAGE CLOSE DURING PAYMENT
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
  // 3. CLEANUP OLD ATTEMPTS ON UNMOUNT
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
              sessionStorage.removeItem('current_booking_attempt');
            }
          } catch (error) {
            console.error('Booking attempt cleanup error:', error);
          }
        }
      }
    };
  }, [bookingLoading, isRazorpayOpen]);

  // ==========================================
  // 4. CHECK RECENT BOOKING STATUS (RECOVERY)
  // ==========================================
  const checkBookingStatus = useCallback(
    async (options = {}) => {
      const { onConfirmed, onNotFound, currentUser } = options;
      try {
        const data = await paymentService.checkRecentPaymentStatus();
        if (data?.success && data.data?.recentBooking) {
          toast.success('Your booking was successful!');
          setCurrentIdempotencyKey(null);
          sessionStorage.removeItem('current_booking_attempt');

          if (onConfirmed) {
            onConfirmed(data.data.recentBooking);
          } else {
            if (currentUser?.role === 'counselor') {
              navigate('/counselor/dashboard');
            } else {
              navigate('/client/dashboard/bookings');
            }
          }
          return true;
        } else {
          if (onNotFound) {
            onNotFound();
          } else {
            toast.info('No recent booking found. You can try booking again.', { duration: 5000 });
          }
          setCurrentIdempotencyKey(null);
          sessionStorage.removeItem('current_booking_attempt');
          return false;
        }
      } catch (error) {
        console.error('Booking status check error:', error);
        toast.error('Unable to check booking status. Please refresh the page.');
        return false;
      }
    },
    [navigate]
  );

  // ==========================================
  // 5. VERIFY PAYMENT (SERVER HMAC SIGNATURE)
  // ==========================================
  const verifyPayment = useCallback(
    async (paymentData, callbacks = {}) => {
      const { onBookingSuccess, onSlotsRefresh, currentUser, selectedSlotId, userData } = callbacks;

      try {
        let idempotencyKey = idempotencyKeyRef.current;

        if (!idempotencyKey) {
          const storedAttempt = sessionStorage.getItem('current_booking_attempt');
          if (storedAttempt) {
            try {
              const parsed = JSON.parse(storedAttempt);
              if (parsed.slotId === paymentData.slotId) {
                idempotencyKey = parsed.key;
              }
            } catch (e) {
              console.error('Error parsing stored attempt in verifyPayment:', e);
            }
          }

          if (!idempotencyKey) {
            console.error('No idempotency key found for verification');
            if (userData && paymentData.slotId) {
              idempotencyKey = `${userData._id}_${paymentData.slotId}_${Date.now()}_${uuidv4()}`;
            } else {
              toast.error('Unable to verify payment. Please contact support with your payment ID.');
              setBookingLoading(false);
              return;
            }
          }
        }

        let data;
        try {
          data = await paymentService.verifyPayment(paymentData, idempotencyKey);
        } catch (err) {
          const status = err.response?.status;
          const errData = err.response?.data || {};

          // 400 Bad Request - Invalid signature
          if (status === 400) {
            toast.error(errData.message || 'Payment verification failed. Please try again.', {
              duration: 6000,
            });
            setCurrentIdempotencyKey(null);
            sessionStorage.removeItem('current_booking_attempt');
            if (callbacks.onCloseModal) callbacks.onCloseModal();
            setBookingLoading(false);
            return;
          }

          // 409 Conflict - Request already processing
          if (status === 409) {
            toast.info(errData.message || 'Verification in progress. Please wait...', {
              duration: 3000,
            });
            setTimeout(() => {
              checkBookingStatus({
                onConfirmed: onBookingSuccess,
                onNotFound: onSlotsRefresh,
                currentUser,
              });
            }, 3000);
            return;
          }

          // Refund handling
          const errorMessage = errData.message || 'Payment verification unsuccessful';
          if (errData.data?.refundInfo?.refunded) {
            toast.error(errorMessage, {
              duration: 8000,
              description: 'Your payment has been refunded automatically.',
            });
          } else if (errData.data?.refundInfo?.pending) {
            toast.error(errorMessage, {
              duration: 8000,
              description: 'Refund will be processed within 24-48 hours.',
            });
          } else {
            toast.error(errorMessage, { duration: 6000 });
          }

          setCurrentIdempotencyKey(null);
          sessionStorage.removeItem('current_booking_attempt');
          if (onSlotsRefresh) onSlotsRefresh();
          if (callbacks.onCloseModal) callbacks.onCloseModal();
          return;
        }

        // Success outcome
        if (data && data.success) {
          const booking = data.data?.booking;

          setCurrentIdempotencyKey(null);
          sessionStorage.removeItem('current_booking_attempt');

          if (data.data?._cached) {
            toast.info('Returning cached booking confirmation');
          } else if (data.data?._duplicate) {
            toast.info('This booking was already confirmed');
          } else {
            toast.success('Payment completed! Session booked successfully.', { duration: 4000 });
          }

          if (onBookingSuccess) {
            onBookingSuccess({ booking, slotId: selectedSlotId || paymentData.slotId });
          }

          if (callbacks.onCloseModal) callbacks.onCloseModal();

          setTimeout(() => {
            if (currentUser?.role === 'counselor') {
              navigate('/counselor/dashboard');
            } else {
              navigate('/client/dashboard/bookings');
            }
          }, 1500);
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast.error(
          'Unable to verify payment. If money was deducted, it will be refunded automatically.',
          { duration: 8000 }
        );
        if (onSlotsRefresh) onSlotsRefresh();
      } finally {
        setBookingLoading(false);
        setIsRazorpayOpen(false);
      }
    },
    [checkBookingStatus, navigate]
  );

  // ==========================================
  // 6. INITIATE PAYMENT (ORDER CREATION + RAZORPAY LAUNCH)
  // ==========================================
  const initiatePayment = useCallback(
    async (params, isRetry = false) => {
      const {
        selectedSlot,
        counselor,
        selectedDate,
        amount,
        couponCode,
        userData,
        accessToken,
        isSelfBooking,
        isOnline,
        formatDateToString,
        onBookingSuccess,
        onFreeBookingSuccess,
        onSlotsRefresh,
        onCloseModal,
        currentUser,
      } = params;

      if (!selectedSlot) return;

      if (isSelfBooking) {
        toast.error('You cannot book a session with yourself.');
        return;
      }

      if (!razorpayLoaded) {
        toast.error('Payment service is loading. Please try again shortly.');
        return;
      }

      if (isOnline === false) {
        toast.error('No internet connection. Please check your network and try again.');
        return;
      }

      try {
        setBookingLoading(true);

        if (!userData || !accessToken) {
          toast.info('Login or register to proceed with the payment for the session', {
            duration: 5000,
          });
          navigate('/login', {
            state: {
              redirectTo: `/book-counselor/${counselor?._id}`,
              message: 'Login or register to proceed with the payment for the session',
            },
          });
          setBookingLoading(false);
          return;
        }

        // Establish or retrieve idempotency key
        let idempotencyKey = idempotencyKeyRef.current;

        if (!idempotencyKey) {
          const storedAttempt = sessionStorage.getItem('current_booking_attempt');
          if (storedAttempt) {
            try {
              const parsed = JSON.parse(storedAttempt);
              if (parsed.slotId === selectedSlot._id) {
                idempotencyKey = parsed.key;
                setCurrentIdempotencyKey(idempotencyKey);
              }
            } catch (e) {
              console.error('Error parsing stored booking attempt:', e);
            }
          }

          if (!idempotencyKey) {
            idempotencyKey = `${userData._id}_${selectedSlot._id}_${Date.now()}_${uuidv4()}`;
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

        // Fetch Razorpay public key
        const key = await paymentService.getRazorpayKey();

        // Create order via Layer 2 service
        let orderData;
        try {
          orderData = await paymentService.createOrder(
            {
              amount,
              clientId: userData._id,
              slotId: selectedSlot._id,
              couponCode,
            },
            idempotencyKey
          );
        } catch (err) {
          const status = err.response?.status;
          const errData = err.response?.data || {};

          if (status === 409) {
            toast.info(errData.message || 'Your request is being processed. Please wait...', {
              duration: 3000,
            });
            setBookingLoading(false);
            return;
          }

          if (status === 503 && errData.data?.retryable) {
            toast.error(errData.message);
            toast.info('Retrying automatically...', { duration: 2000 });
            setTimeout(() => {
              initiatePayment(params, true);
            }, errData.data?.retryAfter || 5000);
            return;
          }

          toast.error(errData.message || 'Unable to create payment order');
          setBookingLoading(false);
          return;
        }

        // Check if this is a 100% free promotional booking bypass
        if (orderData?.success && orderData.data?.isFree) {
          setBookingLoading(false);
          if (onCloseModal) onCloseModal();
          sessionStorage.removeItem('current_booking_attempt');
          sessionStorage.removeItem('current_idempotency_key');
          toast.success('Free session booked successfully!');

          if (onFreeBookingSuccess) {
            onFreeBookingSuccess(orderData);
          } else {
            navigate('/client/dashboard/myBookings', {
              state: { successMessage: 'Your free session has been confirmed successfully!' },
            });
          }
          return;
        }

        if (!orderData?.success || !orderData.data || !orderData.data.order) {
          toast.error('Unable to create payment order');
          setBookingLoading(false);
          return;
        }

        // Handle cached responses or retry feedback
        if (orderData.data._cached || orderData.message?.includes('cached')) {
          toast.info('Resuming previous payment attempt...');
        } else if (isRetry) {
          toast.success('Retry successful. Proceeding with payment...');
        }

        setIsRazorpayOpen(true);

        setTimeout(() => {
          const formattedSessionDate =
            typeof formatDateToString === 'function' && selectedDate
              ? formatDateToString(selectedDate)
              : String(selectedDate || '');

          const options = {
            key,
            amount: orderData.data.order.amount,
            currency: 'INR',
            name: 'Solvit',
            description: `Therapy Session with ${counselor?.fullName || 'Counselor'}`,
            order_id: orderData.data.order.id,
            handler: async (response) => {
              setIsRazorpayOpen(false);
              await verifyPayment(
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  clientId: userData._id,
                  slotId: selectedSlot._id,
                },
                {
                  onBookingSuccess,
                  onSlotsRefresh,
                  onCloseModal,
                  currentUser,
                  selectedSlotId: selectedSlot._id,
                  userData,
                }
              );
            },
            prefill: {
              name: userData.fullName || '',
              email: userData.email || '',
              contact: userData.phone || '9999999999',
            },
            notes: {
              counselor: counselor?.fullName || '',
              session_date: formattedSessionDate,
              idempotencyKey,
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
        if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
          toast.error('Network error. Please check your connection and try again.');
        } else {
          toast.error('Unable to initiate payment. Please try again.');
        }
        setBookingLoading(false);
      }
    },
    [razorpayLoaded, navigate, verifyPayment]
  );

  return {
    bookingLoading,
    razorpayLoaded,
    isRazorpayOpen,
    currentIdempotencyKey,
    setCurrentIdempotencyKey,
    initiatePayment,
    verifyPayment,
    checkBookingStatus,
  };
};

export default usePaymentCheckout;
