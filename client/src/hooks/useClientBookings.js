import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import bookingService from '../services/booking';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export const EARLY_JOIN_MINUTES = 10;

/**
 * Pure helper - recompute canJoin from the booking's scheduled slot times.
 * @param {Object} booking - Booking entity.
 * @returns {boolean} Whether client is inside allowed join window.
 */
export const computeCanJoin = (booking) => {
  if (!booking?.videoSDKRoomId || !booking?.startTime || !booking?.endTime) return false;
  if (booking.status !== 'confirmed') return false;

  const now = dayjs().utc();
  const start = dayjs.utc(booking.startTime);
  const end = dayjs.utc(booking.endTime);

  if (!start.isValid() || !end.isValid()) return false;

  return now.isSameOrAfter(start.subtract(EARLY_JOIN_MINUTES, 'minute')) && now.isBefore(end);
};

/**
 * Enterprise Layer 3 State Hook for Client Dashboard Appointments & Sessions.
 * Encapsulates booking lifecycle, join-window polling timers, cancellation modal state,
 * and session navigation.
 *
 * @param {Object} [options] - Initial configuration options.
 * @param {string} [options.initialTab='upcoming'] - Default active dashboard tab.
 * @returns {Object} Client appointment states and action dispatchers.
 */
export const useClientBookings = ({ initialTab = 'upcoming' } = {}) => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });

  const [cancelModal, setCancelModal] = useState({ show: false, booking: null });
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const [guidelinesState, setGuidelinesState] = useState({ show: false, booking: null });

  const timerRef = useRef(null);

  // Fetch client bookings for the active tab and page
  const fetchBookings = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);

        const data = await bookingService.getClientBookings({
          filter: activeTab,
          page: page.toString(),
          perPage: '10',
        });

        if (data.success) {
          const enriched = (data.data?.bookings || []).map((b) => ({
            ...b,
            canJoin: computeCanJoin(b),
          }));
          setBookings(enriched);
          if (data.data?.pagination) {
            setPagination(data.data.pagination);
          }
        } else {
          toast.error(data.message || 'Failed to load bookings');
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
        if (error.response?.status !== 401) {
          toast.error(error.response?.data?.message || 'Failed to load bookings');
        }
      } finally {
        setLoading(false);
      }
    },
    [activeTab]
  );

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Live timer: recompute canJoin every 30s for the 'upcoming' tab
  useEffect(() => {
    if (activeTab !== 'upcoming') return;

    timerRef.current = setInterval(() => {
      setBookings((prev) =>
        prev.map((b) => ({
          ...b,
          canJoin: computeCanJoin(b),
        }))
      );
    }, 30_000);

    return () => clearInterval(timerRef.current);
  }, [activeTab]);

  // Join session handler - checks window validity and opens guidelines modal
  const handleJoinSession = useCallback((booking) => {
    if (!computeCanJoin(booking)) {
      toast.error('The join window for this session is not open.');
      return;
    }
    setGuidelinesState({ show: true, booking });
  }, []);

  // Proceed from guidelines modal directly into meeting room
  const handleProceedToSession = useCallback(
    (bookingId, videoSDKRoomId) => {
      setGuidelinesState({ show: false, booking: null });
      navigate(`/meeting/${bookingId}/${videoSDKRoomId}`);
    },
    [navigate]
  );

  // Submit appointment cancellation with client reason
  const handleCancelBooking = useCallback(async () => {
    if (!cancelModal.booking || !cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    try {
      setCancelLoading(true);

      const data = await bookingService.cancelBooking(cancelModal.booking.bookingId, cancelReason);

      if (data.success) {
        toast.success(data.message || 'Booking cancelled successfully');
        setCancelModal({ show: false, booking: null });
        setCancelReason('');
        fetchBookings(pagination.currentPage || 1);
      } else {
        toast.error(data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Cancel booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelLoading(false);
    }
  }, [cancelModal.booking, cancelReason, fetchBookings, pagination.currentPage]);

  return {
    activeTab,
    setActiveTab,
    bookings,
    setBookings,
    loading,
    pagination,
    cancelModal,
    setCancelModal,
    cancelReason,
    setCancelReason,
    cancelLoading,
    guidelinesState,
    setGuidelinesState,
    fetchBookings,
    handleJoinSession,
    handleProceedToSession,
    handleCancelBooking,
    computeCanJoin,
  };
};

export default useClientBookings;
