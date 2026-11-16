import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import bookingService from '../services/booking';
import useSmartRefresh from './useSmartRefresh';

/**
 * Enterprise Layer 3 State Hook for Counselor Availability & Slot Booking.
 * Encapsulates practitioner profile retrieval, active slot synchronization,
 * payment-in-progress slot protection, and background refresh scheduling.
 *
 * @param {Object} params - Hook parameters.
 * @param {string} params.counselorId - MongoDB ID of the counselor.
 * @param {boolean} [params.bookingLoading=false] - Whether a checkout transaction is active.
 * @param {boolean} [params.isRazorpayOpen=false] - Whether the Razorpay payment modal is currently visible.
 * @returns {Object} Counselor slot booking state and control methods.
 */
export const useCounselorBooking = ({
  counselorId,
  bookingLoading = false,
  isRazorpayOpen = false,
} = {}) => {
  const [counselor, setCounselor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCounselorData = useCallback(
    async (skipLoading = false) => {
      if (!counselorId) return;
      try {
        if (!skipLoading) {
          setLoading(true);
        }

        const data = await bookingService.getCounselorSlots(counselorId);
        setCounselor(data.counselor || null);

        // Guard against race condition: never overwrite slot states while user is actively paying
        if (!bookingLoading && !isRazorpayOpen) {
          setSlots(data.slots || []);
        }
        setError(null);
      } catch (err) {
        console.error('Counselor booking slot fetch error:', err);
        setError(err);
        if (!skipLoading) {
          toast.error('Unable to retrieve counselor information');
        }
      } finally {
        if (!skipLoading) {
          setLoading(false);
        }
      }
    },
    [counselorId, bookingLoading, isRazorpayOpen]
  );

  // Tab-aware active background refresh (2-min interval, 30s stale time)
  useSmartRefresh(fetchCounselorData, {
    intervalMs: 120000,
    staleTimeMs: 30000,
    deps: [counselorId],
  });

  // Mark a specific slot as booked in local state upon confirmation
  const markSlotBooked = useCallback((slotId) => {
    if (!slotId) return;
    setSlots((prev) =>
      prev.map((slot) =>
        slot._id === slotId ? { ...slot, status: 'booked', isBooked: true } : slot
      )
    );
  }, []);

  return {
    counselor,
    setCounselor,
    slots,
    setSlots,
    markSlotBooked,
    loading,
    error,
    fetchCounselorData,
  };
};

export default useCounselorBooking;
