import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Timer,
  TrendingUp,
  Shield,
  Sparkles,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '../../../config/api';
import api from '@/lib/axios';
import {
  TIME_OPTIONS_5_MIN as timeOptions,
  SLOT_DURATION_MINUTES,
  calculateEndTime,
  getTimeDifferenceInMinutes,
  isValidTimeRange,
} from '../../../constants/constants';

// shadcn/ui imports
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const DAY_SHORT_MAP = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

const getDayShort = (day) => DAY_SHORT_MAP[day] || day;

const CounselorDashboardRecurringAvailabilityManager = () => {
  const [weeklyAvailability, setWeeklyAvailability] = useState([
    { dayOfWeek: 'Monday', isAvailable: false, timeRanges: [] },
    { dayOfWeek: 'Tuesday', isAvailable: false, timeRanges: [] },
    { dayOfWeek: 'Wednesday', isAvailable: false, timeRanges: [] },
    { dayOfWeek: 'Thursday', isAvailable: false, timeRanges: [] },
    { dayOfWeek: 'Friday', isAvailable: false, timeRanges: [] },
    { dayOfWeek: 'Saturday', isAvailable: false, timeRanges: [] },
    { dayOfWeek: 'Sunday', isAvailable: false, timeRanges: [] },
  ]);

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

  const fetchPriceConstraints = useCallback(async () => {
    try {
      const response = await api.get(API_ENDPOINTS.PRICE_CONSTRAINTS);
      const { minPrice, maxPrice, experienceLevel } = response.data.data;
      setPriceConstraints({ minPrice, maxPrice, experienceLevel });
    } catch (error) {
      setPriceConstraints({ minPrice: 500, maxPrice: 5000, experienceLevel: '' });
    }
  }, []);

  const fetchExistingAvailability = useCallback(async () => {
    try {
      setInitialLoading(true);
      const response = await api.get(API_ENDPOINTS.SLOT_MANAGEMENT_MY_RECURRING);
      const data = response.data;
      if (data.availability && data.availability.length > 0) {
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

        setGlobalPrice(existingPrice);
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

  const toggleDayAvailability = useCallback((dayIndex) => {
    setWeeklyAvailability((prev) => {
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        isAvailable: !updated[dayIndex].isAvailable,
        timeRanges: !updated[dayIndex].isAvailable
          ? [{ startTime: '9:00 AM', endTime: '9:45 AM' }]
          : [],
      };
      return updated;
    });
  }, []);

  const addTimeRange = useCallback((dayIndex) => {
    setWeeklyAvailability((prev) => {
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        timeRanges: [
          ...updated[dayIndex].timeRanges,
          { startTime: '9:00 AM', endTime: '9:45 AM' },
        ],
      };
      return updated;
    });
  }, []);

  const removeTimeRange = useCallback((dayIndex, timeRangeIndex) => {
    setWeeklyAvailability((prev) => {
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        timeRanges: updated[dayIndex].timeRanges.filter((_, idx) => idx !== timeRangeIndex),
      };
      return updated;
    });
  }, []);

  const updateTimeRange = useCallback((dayIndex, timeRangeIndex, field, value) => {
    setWeeklyAvailability((prev) => {
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        timeRanges: updated[dayIndex].timeRanges.map((range, idx) => {
          if (idx !== timeRangeIndex) return range;

          let newStartTime = field === 'startTime' ? value : range.startTime;
          let newEndTime = field === 'endTime' ? value : range.endTime;

          if (field === 'startTime') {
            const diff = getTimeDifferenceInMinutes(value, newEndTime);
            if (diff <= 0 || diff > SLOT_DURATION_MINUTES) {
              newEndTime = calculateEndTime(value, SLOT_DURATION_MINUTES);
            }
          } else if (field === 'endTime') {
            const diff = getTimeDifferenceInMinutes(newStartTime, value);
            if (diff <= 0) {
              toast.error('End time must be after start time');
            } else if (diff > SLOT_DURATION_MINUTES) {
              toast.error(`Slot duration cannot be more than ${SLOT_DURATION_MINUTES} minutes`);
            }
          }

          return { startTime: newStartTime, endTime: newEndTime };
        }),
      };
      return updated;
    });
  }, []);

  const validatePriceInput = useCallback(
    (price) => {
      if (!price || price.trim() === '') {
        return { isValid: false, message: 'Price is required' };
      }
      const priceNum = Number(price);
      if (isNaN(priceNum)) {
        return { isValid: false, message: 'Price must be a number' };
      }
      if (priceNum < priceConstraints.minPrice || priceNum > priceConstraints.maxPrice) {
        return {
          isValid: false,
          message: `Price must be between ₹${priceConstraints.minPrice} - ₹${priceConstraints.maxPrice}`,
        };
      }
      return { isValid: true, message: '' };
    },
    [priceConstraints]
  );

  const handleSaveClick = useCallback(() => {
    const priceValidation = validatePriceInput(globalPrice);
    if (!priceValidation.isValid) {
      toast.error(priceValidation.message);
      return;
    }

    for (let day of weeklyAvailability) {
      if (day.isAvailable) {
        for (let timeRange of day.timeRanges) {
          const diff = getTimeDifferenceInMinutes(timeRange.startTime, timeRange.endTime);
          if (diff <= 0) {
            toast.error(`Invalid time range on ${day.dayOfWeek}: End time must be after start time`);
            return;
          }
          if (diff > SLOT_DURATION_MINUTES) {
            toast.error(
              `Slot duration on ${day.dayOfWeek} (${timeRange.startTime} - ${timeRange.endTime}) cannot exceed ${SLOT_DURATION_MINUTES} minutes`
            );
            return;
          }
        }
      }
    }
    setShowDialog(true);
  }, [globalPrice, validatePriceInput, weeklyAvailability]);

  const handleConfirmSave = useCallback(async () => {
    setShowDialog(false);
    setLoading(true);

    try {
      const weeklyAvailabilityWithPrice = weeklyAvailability.map((day) => ({
        ...day,
        price: day.isAvailable ? Number(globalPrice) : 0,
      }));

      await api.post(API_ENDPOINTS.SLOT_MANAGEMENT_SET_RECURRING, {
        weeklyAvailability: weeklyAvailabilityWithPrice,
      });

      try {
        await api.post(API_ENDPOINTS.SLOT_MANAGEMENT_GENERATE_SLOTS);
        toast.success('Availability updated successfully!', {
          description: 'Your weekly schedule is now active and slots have been generated.',
        });
      } catch (error) {
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

  if (initialLoading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent py-16">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto p-4"
        >
          <Card className="group relative bg-gradient-to-br from-white via-white to-primary-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/30 border border-neutral-200 dark:border-neutral-800 shadow-lg">
            <CardContent className="py-12 flex flex-col items-center gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-primary-600" />
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Loading availability settings...
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="relative  flex items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-50 via-primary-100 to-primary-200/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary-950/30 py-16 lg:py-20">
      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        {/* Confirmation Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-xl p-0 flex flex-col max-h-[85vh] sm:max-h-[88vh] overflow-hidden border border-neutral-200/80 dark:border-neutral-800 rounded-2xl sm:rounded-3xl shadow-2xl bg-white dark:bg-neutral-900">
            {/* Pinned Header */}
            <div className="p-5 sm:p-6 pb-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
              <div className="flex items-center gap-3.5 pr-8">
                <div className="w-11 h-11 bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-primary-500/20 ring-4 ring-primary-500/10 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-neutral-900 dark:text-white leading-tight">
                    Confirm Availability Update
                  </DialogTitle>
                  <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Please review your weekly availability and pricing before saving changes.
                  </DialogDescription>
                </div>
              </div>
            </div>

            {/* Scrollable Body - Never cuts off */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 min-h-0">
              {/* Top 3 KPI metrics */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200/80 dark:border-neutral-700/60 text-center">
                  <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
                    Days Active
                  </span>
                  <p className="text-lg font-extrabold text-neutral-900 dark:text-white mt-1">
                    {summary.availableDaysCount} <span className="text-xs font-normal text-neutral-400">/ 7</span>
                  </p>
                </div>

                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200/80 dark:border-neutral-700/60 text-center">
                  <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
                    Total Slots
                  </span>
                  <p className="text-lg font-extrabold text-neutral-900 dark:text-white mt-1">
                    {summary.totalSlots} <span className="text-xs font-normal text-neutral-400">slots</span>
                  </p>
                </div>

                <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/70 dark:border-emerald-800/50 text-center">
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                    Session Rate
                  </span>
                  <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
                    ₹{globalPrice}
                  </p>
                </div>
              </div>

              {/* Schedule Breakdown */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                    Schedule Details
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-medium px-2 py-0.5">
                    {summary.availableDays.length} day{summary.availableDays.length !== 1 ? 's' : ''} configured
                  </Badge>
                </div>

                {summary.availableDays.length > 0 ? (
                  <div className="space-y-2.5">
                    {summary.availableDays.map((day) => (
                      <div
                        key={day.dayOfWeek}
                        className="p-3.5 bg-neutral-50/80 dark:bg-neutral-800/50 rounded-xl border border-neutral-200/70 dark:border-neutral-700/60 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800/80"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-400" />
                            {day.dayOfWeek}
                          </span>
                          <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                            {day.timeRanges.length} slot{day.timeRanges.length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {day.timeRanges.map((range, idx) => (
                            <div
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 shadow-2xs"
                            >
                              <Timer className="w-3 h-3 text-primary-600 dark:text-primary-400 shrink-0" />
                              <span>{range.startTime} – {range.endTime}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 text-center bg-neutral-50/50 dark:bg-neutral-900/30">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      No available days are selected.
                    </p>
                  </div>
                )}
              </div>

              {/* Informative helper note */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-primary-50/60 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/40 text-xs text-neutral-600 dark:text-neutral-300">
                <Info className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
                <span>
                  Saving will generate recurring time slots automatically for student bookings across the next booking window.
                </span>
              </div>
            </div>

            {/* Pinned Footer - Fully visible */}
            <div className="p-4 px-6 bg-neutral-50/90 dark:bg-neutral-900/90 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                disabled={loading}
                size="sm"
                className="rounded-xl h-9 px-4 text-xs font-medium border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSave}
                disabled={loading}
                size="sm"
                className="rounded-xl h-9 px-5 text-xs font-semibold shadow-md shadow-primary-500/20 gap-1.5"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Confirm & Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Header Section */}
        <motion.div className="text-center mb-12 space-y-4" variants={containerVariants}>
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight"
            variants={fadeInUp}
          >
            <span className="text-neutral-900 dark:text-white">Weekly</span>
            <br />
            <span className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 dark:from-primary-400 dark:via-primary-300 dark:to-secondary-400 bg-clip-text text-transparent">
              Availability Setup
            </span>
          </motion.h2>

          <motion.p
            className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed"
            variants={fadeInUp}
          >
            Configure your recurring schedule and session pricing. Set your availability once and
            let clients book when it suits you both.
          </motion.p>
        </motion.div>

        {/* Important Notice Alert */}
        <motion.div variants={fadeInUp} className="mb-6">
          <Alert className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 via-amber-50/80 to-orange-50/50 dark:from-amber-950/30 dark:via-amber-950/20 dark:to-orange-950/20 shadow-md">
            <Info className="h-5 w-5 text-amber-600 dark:text-amber-500" />
            <AlertTitle className="text-amber-900 dark:text-amber-200 font-bold text-sm mb-2">
              Important: Recurring Availability Update
            </AlertTitle>
            <AlertDescription className="text-amber-800 dark:text-amber-300 text-sm leading-relaxed space-y-2">
              <p>
                Saving your weekly availability will{' '}
                <strong className="font-semibold">replace all existing unbooked slots</strong> with
                new slots generated according to your updated schedule. Booked sessions remain
                unaffected.
              </p>
              <p className="pt-1">
                If you prefer to add specific time slots while retaining your current availability,
                please use the <strong className="font-semibold">Slots Manager</strong> section
                instead.
              </p>
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Price Input Card */}
        <motion.div variants={fadeInUp} className="mb-6">
          <Card className="group relative bg-gradient-to-br from-white via-white to-primary-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/30 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 transition-all duration-500">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-500/10 to-transparent rounded-bl-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-neutral-900 dark:text-white leading-tight">
                      Session Pricing
                    </CardTitle>
                    <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mt-0.5">
                      Set Pricing
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="global-price"
                    className="text-xs font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    Price per Session
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="relative w-28">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-medium">
                        ₹
                      </span>
                      <Input
                        id="global-price"
                        type="number"
                        min={priceConstraints.minPrice}
                        max={priceConstraints.maxPrice}
                        value={globalPrice}
                        onChange={(e) => setGlobalPrice(e.target.value)}
                        className={`pl-6 h-9 text-sm ${
                          globalPrice && !validatePriceInput(globalPrice).isValid
                            ? 'border-red-500'
                            : ''
                        }`}
                        placeholder={priceConstraints.minPrice.toString()}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Range: ₹{priceConstraints.minPrice} - ₹{priceConstraints.maxPrice}
                  </p>
                  {globalPrice && !validatePriceInput(globalPrice).isValid && (
                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {validatePriceInput(globalPrice).message}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Day Selection Buttons */}
        <motion.div variants={fadeInUp} className="mb-6">
          <div className="flex flex-wrap justify-center gap-2">
            {weeklyAvailability.map((day, index) => (
              <Button
                key={day.dayOfWeek}
                size="sm"
                variant={selectedDayIndex === index ? 'default' : 'outline'}
                onClick={() => setSelectedDayIndex(index)}
                className={`relative ${
                  selectedDayIndex === index
                    ? 'bg-gradient-to-r from-primary-700 to-primary-600 text-white shadow-md'
                    : 'border-neutral-300 dark:border-neutral-700'
                }`}
              >
                <span className="font-semibold text-xs">{getDayShort(day.dayOfWeek)}</span>
                {day.isAvailable && (
                  <Badge
                    variant="secondary"
                    className="ml-1.5 h-4 min-w-4 px-1 text-xs bg-white/20"
                  >
                    {day.timeRanges.length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Selected Day Card */}
        <motion.div variants={fadeInUp} className="mb-6">
          <Card className="group relative bg-gradient-to-br from-white via-white to-primary-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/30 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 transition-all duration-500 overflow-hidden">
            {selectedDay.isAvailable && (
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-500/10 to-transparent rounded-bl-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            )}

            <CardContent className="p-5">
              {/* Day Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shadow-lg transition-all duration-300 ${
                      selectedDay.isAvailable
                        ? 'bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white group-hover:scale-110 group-hover:rotate-6'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                    }`}
                  >
                    {getDayShort(selectedDay.dayOfWeek)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                      {selectedDay.dayOfWeek}
                    </h3>
                    {selectedDay.isAvailable && (
                      <p className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                        {selectedDay.timeRanges.length} slot
                        {selectedDay.timeRanges.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
                <Switch
                  checked={selectedDay.isAvailable}
                  onCheckedChange={() => toggleDayAvailability(selectedDayIndex)}
                  aria-label={`Toggle ${selectedDay.dayOfWeek} availability`}
                  className="z-10"
                />
              </div>

              <AnimatePresence mode="wait">
                {selectedDay.isAvailable ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-2.5"
                  >
                    {selectedDay.timeRanges.map((timeRange, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          className={`flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 rounded-lg border transition-all duration-200 ${
                            !isValidTimeRange(timeRange.startTime, timeRange.endTime)
                              ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20'
                              : 'border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50'
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Timer className="w-4 h-4 text-primary-600 shrink-0" />
                            <Select
                              value={timeRange.startTime}
                              onValueChange={(val) =>
                                updateTimeRange(selectedDayIndex, idx, 'startTime', val)
                              }
                            >
                              <SelectTrigger className="h-9 text-xs flex-1 min-w-0">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <ScrollArea className="h-48">
                                  {timeOptions.map((time) => (
                                    <SelectItem key={time} value={time} className="text-xs">
                                      {time}
                                    </SelectItem>
                                  ))}
                                </ScrollArea>
                              </SelectContent>
                            </Select>
                            <span className="text-xs text-neutral-400 font-medium shrink-0">to</span>
                            <Select
                              value={timeRange.endTime}
                              onValueChange={(val) =>
                                updateTimeRange(selectedDayIndex, idx, 'endTime', val)
                              }
                            >
                              <SelectTrigger className="h-9 text-xs flex-1 min-w-0">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <ScrollArea className="h-48">
                                  {timeOptions.map((time) => (
                                    <SelectItem key={time} value={time} className="text-xs">
                                      {time}
                                    </SelectItem>
                                  ))}
                                </ScrollArea>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex justify-end sm:justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
                              onClick={() => removeTimeRange(selectedDayIndex, idx)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        {!isValidTimeRange(timeRange.startTime, timeRange.endTime) && (
                          <p className="text-[11px] text-red-500 dark:text-red-400 mt-1 pl-1 flex items-center gap-1 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            Slot duration cannot exceed {SLOT_DURATION_MINUTES} minutes and end time must be after start time.
                          </p>
                        )}
                      </motion.div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addTimeRange(selectedDayIndex)}
                      className="w-full border-dashed border-2 h-10 text-xs"
                    >
                      <Plus className="w-4 h-4" />
                      Add Time Slot
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-10"
                  >
                    <Clock className="w-10 h-10 mx-auto text-neutral-300 dark:text-neutral-700 mb-2" />
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                      This day is currently unavailable. Toggle the switch to add time slots.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary & Save */}
        <motion.div variants={fadeInUp} className="space-y-4">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-primary-50/20 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/20 border border-neutral-200/80 dark:border-neutral-800 shadow-xl shadow-neutral-200/40 dark:shadow-none hover:border-primary-400 dark:hover:border-primary-600 transition-all duration-300 rounded-2xl">
            {/* Header */}
            <CardHeader className="p-5 pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-500/25 ring-2 ring-primary-500/10">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
                      Weekly Summary
                    </CardTitle>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      Overview of your weekly counseling schedule
                    </p>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={
                    summary.availableDaysCount > 0
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60 font-semibold text-xs px-2.5 py-1 flex items-center gap-1.5'
                      : 'bg-neutral-50 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 text-xs px-2.5 py-1'
                  }
                >
                  {summary.availableDaysCount > 0 ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active Schedule
                    </>
                  ) : (
                    'No Days Configured'
                  )}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-5">
              {/* 2-Column KPI Stat Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Available Days Stat */}
                <div className="bg-neutral-50/90 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/60 rounded-xl p-4 transition-all duration-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/60">
                  <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Available Days</span>
                    <div className="w-7 h-7 rounded-lg bg-primary-100/70 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                      {summary.availableDaysCount}
                    </span>
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      of 7 days
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-600 to-primary-500 rounded-full transition-all duration-500"
                        style={{ width: `${(summary.availableDaysCount / 7) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                      <span>{Math.round((summary.availableDaysCount / 7) * 100)}% active</span>
                      <span>{7 - summary.availableDaysCount} off</span>
                    </div>
                  </div>
                </div>

                {/* Total Time Slots Stat */}
                <div className="bg-neutral-50/90 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/60 rounded-xl p-4 transition-all duration-200 hover:bg-neutral-50 dark:hover:bg-neutral-800/60">
                  <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">Total Time Slots</span>
                    <div className="w-7 h-7 rounded-lg bg-primary-100/70 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                      {summary.totalSlots}
                    </span>
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      slot{summary.totalSlots !== 1 ? 's' : ''} / week
                    </span>
                  </div>
                  {/* Hours computation */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300 bg-white/70 dark:bg-neutral-900/60 py-1.5 px-2.5 rounded-lg border border-neutral-200/50 dark:border-neutral-800">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="font-medium">
                      ~{((summary.totalSlots * SLOT_DURATION_MINUTES) / 60).toFixed(1)} hrs total counseling
                    </span>
                  </div>
                </div>
              </div>

              {/* 7-Day Week Matrix / Distribution */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Weekly Distribution
                  </span>
                  <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    Click day to configure
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {weeklyAvailability.map((day, idx) => {
                    const isSelected = selectedDayIndex === idx;
                    const isActive = day.isAvailable;
                    const slotCount = day.timeRanges.length;

                    return (
                      <button
                        key={day.dayOfWeek}
                        type="button"
                        onClick={() => setSelectedDayIndex(idx)}
                        className={`group relative flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all duration-200 border text-center ${
                          isSelected
                            ? 'ring-2 ring-primary-500 ring-offset-1 dark:ring-offset-neutral-900'
                            : ''
                        } ${
                          isActive
                            ? 'bg-gradient-to-b from-primary-50/70 to-primary-100/40 dark:from-primary-950/40 dark:to-primary-900/20 border-primary-200 dark:border-primary-800/70 text-primary-950 dark:text-primary-100 shadow-xs'
                            : 'bg-neutral-50/60 dark:bg-neutral-800/30 border-neutral-200/70 dark:border-neutral-800 text-neutral-400 dark:text-neutral-500 hover:border-neutral-300 dark:hover:border-neutral-700'
                        }`}
                      >
                        <span className={`text-[11px] sm:text-xs font-bold ${isActive ? 'text-primary-700 dark:text-primary-300' : 'text-neutral-500 dark:text-neutral-400'}`}>
                          {getDayShort(day.dayOfWeek)}
                        </span>
                        
                        <div className="mt-1 flex items-center justify-center">
                          {isActive ? (
                            <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-primary-600 text-white dark:bg-primary-500 shadow-xs">
                              {slotCount}
                            </span>
                          ) : (
                            <span className="text-[10px] text-neutral-400 dark:text-neutral-600 font-medium">
                              —
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Days Detailed Pills */}
              {summary.availableDays.length > 0 ? (
                <div className="bg-neutral-50/60 dark:bg-neutral-800/30 rounded-xl p-3 border border-neutral-200/70 dark:border-neutral-800/70 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Active Days & Slot Allocation
                    </span>
                    <span className="text-[11px] font-normal text-neutral-500 dark:text-neutral-400">
                      {summary.availableDays.length} day{summary.availableDays.length !== 1 ? 's' : ''} configured
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {summary.availableDays.map((day) => {
                      const dayIdx = weeklyAvailability.findIndex((d) => d.dayOfWeek === day.dayOfWeek);
                      const isCurrent = selectedDayIndex === dayIdx;
                      return (
                        <button
                          key={day.dayOfWeek}
                          type="button"
                          onClick={() => setSelectedDayIndex(dayIdx)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                            isCurrent
                              ? 'bg-primary-600 text-white shadow-xs ring-1 ring-primary-400'
                              : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-700'
                          }`}
                        >
                          <span>{day.dayOfWeek}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isCurrent
                              ? 'bg-white/20 text-white'
                              : 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400'
                          }`}>
                            {day.timeRanges.length} slot{day.timeRanges.length !== 1 ? 's' : ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800 text-center bg-neutral-50/50 dark:bg-neutral-900/30">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    No active days configured. Toggle days on above to build your recurring schedule.
                  </p>
                </div>
              )}

              {/* Revenue projection notice if price is set */}
              {globalPrice && !isNaN(Number(globalPrice)) && Number(globalPrice) > 0 && summary.totalSlots > 0 && (
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/10 border border-emerald-200/70 dark:border-emerald-800/40 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-500 text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
                      ₹
                    </div>
                    <div>
                      <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                        Max Weekly Potential: ₹{(summary.totalSlots * Number(globalPrice)).toLocaleString('en-IN')}
                      </span>
                      <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80">
                        ({summary.totalSlots} slots × ₹{globalPrice}/session)
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-[10px] bg-white/60 dark:bg-neutral-900/60">
                    Est. Revenue
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            onClick={handleSaveClick}
            disabled={loading}
            size="lg"
            className="w-full h-12 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all font-semibold text-sm rounded-xl gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            Save Availability & Generate Slots
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default CounselorDashboardRecurringAvailabilityManager;
