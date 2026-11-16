import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { slotManagementService } from '../services/booking';

export const INITIAL_WEEKLY_AVAILABILITY = [
  { dayOfWeek: 'Monday', isAvailable: false, timeRanges: [] },
  { dayOfWeek: 'Tuesday', isAvailable: false, timeRanges: [] },
  { dayOfWeek: 'Wednesday', isAvailable: false, timeRanges: [] },
  { dayOfWeek: 'Thursday', isAvailable: false, timeRanges: [] },
  { dayOfWeek: 'Friday', isAvailable: false, timeRanges: [] },
  { dayOfWeek: 'Saturday', isAvailable: false, timeRanges: [] },
  { dayOfWeek: 'Sunday', isAvailable: false, timeRanges: [] },
];

/**
 * Enterprise Layer 3 State Hook for Counselor Weekly Recurring Availability.
 * Encapsulates platform price constraints validation, recurring template management,
 * batch week slot generation, and schedule persistence.
 *
 * @returns {Object} Recurring availability state and mutation handlers.
 */
export const useRecurringAvailability = () => {
  const [weeklyAvailability, setWeeklyAvailability] = useState(INITIAL_WEEKLY_AVAILABILITY);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [globalPrice, setGlobalPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [priceConstraints, setPriceConstraints] = useState({
    minPrice: 0,
    maxPrice: 0,
    experienceLevel: '',
  });

  // Fetch counselor price bounds enforced by platform
  const fetchPriceConstraints = useCallback(async () => {
    try {
      const data = await slotManagementService.getPriceConstraints();
      const { minPrice, maxPrice, experienceLevel } = data || {};
      setPriceConstraints({
        minPrice: minPrice || 500,
        maxPrice: maxPrice || 5000,
        experienceLevel: experienceLevel || '',
      });
    } catch (error) {
      setPriceConstraints({ minPrice: 500, maxPrice: 5000, experienceLevel: '' });
    }
  }, []);

  // Fetch existing saved recurring schedule
  const fetchExistingAvailability = useCallback(async () => {
    try {
      setInitialLoading(true);
      const data = await slotManagementService.getMyRecurring();
      if (data?.availability && data.availability.length > 0) {
        const availabilityMap = {};
        let existingPrice = '';

        data.availability.forEach((dayData) => {
          availabilityMap[dayData.dayOfWeek] = {
            isAvailable: dayData.isAvailable,
            timeRanges: dayData.timeRanges || [],
          };
          if (dayData.isAvailable && dayData.price && !existingPrice) {
            existingPrice = dayData.price.toString();
          }
        });

        if (existingPrice) {
          setGlobalPrice(existingPrice);
        }

        setWeeklyAvailability((prev) =>
          prev.map((day) => ({
            ...day,
            isAvailable: availabilityMap[day.dayOfWeek]?.isAvailable || false,
            timeRanges: availabilityMap[day.dayOfWeek]?.timeRanges || [],
          }))
        );
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Failed to load availability data');
      }
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPriceConstraints();
    fetchExistingAvailability();
  }, [fetchPriceConstraints, fetchExistingAvailability]);

  // Validate price input boundaries
  const validatePriceInput = useCallback(
    (price) => {
      if (!price || (typeof price === 'string' && price.trim() === '')) {
        return { isValid: false, message: 'Price is required' };
      }
      const priceNum = Number(price);
      if (isNaN(priceNum)) {
        return { isValid: false, message: 'Price must be a number' };
      }
      if (priceConstraints.minPrice && priceNum < priceConstraints.minPrice) {
        return {
          isValid: false,
          message: `Price cannot be below minimum ₹${priceConstraints.minPrice}`,
        };
      }
      if (priceConstraints.maxPrice && priceNum > priceConstraints.maxPrice) {
        return {
          isValid: false,
          message: `Price cannot exceed maximum ₹${priceConstraints.maxPrice}`,
        };
      }
      return { isValid: true, message: '' };
    },
    [priceConstraints]
  );

  // Validate and prompt save dialog
  const handleSaveClick = useCallback(() => {
    const hasAnyAvailableDay = weeklyAvailability.some((d) => d.isAvailable);
    if (!hasAnyAvailableDay) {
      toast.error('Please mark at least one day as available before saving');
      return;
    }

    const priceValidation = validatePriceInput(globalPrice);
    if (!priceValidation.isValid) {
      toast.error(priceValidation.message);
      return;
    }

    for (const day of weeklyAvailability) {
      if (day.isAvailable) {
        if (!day.timeRanges || day.timeRanges.length === 0) {
          toast.error(`${day.dayOfWeek} is marked available but has no time slots configured`);
          return;
        }
      }
    }

    setShowDialog(true);
  }, [globalPrice, validatePriceInput, weeklyAvailability]);

  // Confirm schedule persistence and slot materialization
  const handleConfirmSave = useCallback(async () => {
    setShowDialog(false);
    setLoading(true);

    try {
      const weeklyAvailabilityWithPrice = weeklyAvailability.map((day) => ({
        ...day,
        price: day.isAvailable ? Number(globalPrice) : 0,
      }));

      await slotManagementService.setRecurring({
        weeklyAvailability: weeklyAvailabilityWithPrice,
      });

      try {
        await slotManagementService.generateActualSlots();
        toast.success('Availability updated successfully!', {
          description: 'Your weekly schedule is now active and slots have been generated.',
        });
      } catch (err) {
        console.warn('Slot generation notice:', err);
        toast.success('Availability updated successfully!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update availability');
    } finally {
      setLoading(false);
    }
  }, [globalPrice, weeklyAvailability]);

  const summary = useMemo(() => {
    const availableDays = weeklyAvailability.filter((d) => d.isAvailable);
    const totalSlots = availableDays.reduce((sum, d) => sum + d.timeRanges.length, 0);
    return { availableDaysCount: availableDays.length, totalSlots, availableDays };
  }, [weeklyAvailability]);

  const selectedDay = weeklyAvailability[selectedDayIndex] || weeklyAvailability[0];

  return {
    weeklyAvailability,
    setWeeklyAvailability,
    selectedDayIndex,
    setSelectedDayIndex,
    selectedDay,
    globalPrice,
    setGlobalPrice,
    loading,
    initialLoading,
    showDialog,
    setShowDialog,
    priceConstraints,
    summary,
    handleSaveClick,
    handleConfirmSave,
    validatePriceInput,
    fetchPriceConstraints,
    fetchExistingAvailability,
  };
};

export default useRecurringAvailability;
