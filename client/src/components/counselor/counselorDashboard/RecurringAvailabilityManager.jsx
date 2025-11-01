import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL, API_ENDPOINTS } from '../../../config/api';

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

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const RecurringAvailabilityComponent = () => {
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

  useEffect(() => {
    fetchPriceConstraints();
    fetchExistingAvailability();
  }, []);

  const fetchPriceConstraints = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PRICE_CONSTRAINTS}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        credentials: 'include',
      });
      if (response.ok) {
        const result = await response.json();
        const { minPrice, maxPrice, experienceLevel } = result.data;
        setPriceConstraints({ minPrice, maxPrice, experienceLevel });
      } else {
        setPriceConstraints({ minPrice: 500, maxPrice: 5000, experienceLevel: '' });
      }
    } catch (error) {
      setPriceConstraints({ minPrice: 500, maxPrice: 5000, experienceLevel: '' });
    }
  };

  const fetchExistingAvailability = async () => {
    try {
      setInitialLoading(true);
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SLOT_MANAGEMENT_MY_RECURRING}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
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
          const updatedAvailability = weeklyAvailability.map((day) => ({
            ...day,
            isAvailable: availabilityMap[day.dayOfWeek]?.isAvailable || false,
            timeRanges: availabilityMap[day.dayOfWeek]?.timeRanges || [],
          }));
          setWeeklyAvailability(updatedAvailability);
        }
      }
    } catch (error) {
      toast.error('Failed to load availability data');
    } finally {
      setInitialLoading(false);
    }
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let minute = 0; minute < 60; minute += 30) {
      times.push(`12:${minute.toString().padStart(2, '0')} AM`);
    }
    for (let hour = 1; hour <= 11; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        times.push(`${hour}:${minute.toString().padStart(2, '0')} AM`);
      }
    }
    for (let minute = 0; minute < 60; minute += 30) {
      times.push(`12:${minute.toString().padStart(2, '0')} PM`);
    }
    for (let hour = 1; hour <= 11; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        times.push(`${hour}:${minute.toString().padStart(2, '0')} PM`);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  const toggleDayAvailability = (dayIndex) => {
    setWeeklyAvailability((prev) => {
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        isAvailable: !updated[dayIndex].isAvailable,
        timeRanges: !updated[dayIndex].isAvailable 
          ? [{ startTime: '9:00 AM', endTime: '10:00 AM' }] 
          : []
      };
      return updated;
    });
  };

  const addTimeRange = (dayIndex) => {
    setWeeklyAvailability((prev) => {
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        timeRanges: [...updated[dayIndex].timeRanges, { startTime: '9:00 AM', endTime: '10:00 AM' }]
      };
      return updated;
    });
  };

  const removeTimeRange = (dayIndex, timeRangeIndex) => {
    setWeeklyAvailability((prev) => {
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        timeRanges: updated[dayIndex].timeRanges.filter((_, idx) => idx !== timeRangeIndex)
      };
      return updated;
    });
  };

  const updateTimeRange = (dayIndex, timeRangeIndex, field, value) => {
    setWeeklyAvailability((prev) => {
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        timeRanges: updated[dayIndex].timeRanges.map((range, idx) =>
          idx === timeRangeIndex ? { ...range, [field]: value } : range
        )
      };
      return updated;
    });
  };

  const isValidTimeRange = (startTime, endTime) => {
    const convertTo24Hour = (time12) => {
      const [time, period] = time12.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let hours24 = hours;
      if (period === 'AM' && hours === 12) hours24 = 0;
      else if (period === 'PM' && hours !== 12) hours24 = hours + 12;
      return hours24 * 60 + minutes;
    };
    return convertTo24Hour(endTime) > convertTo24Hour(startTime);
  };

  const validatePriceInput = (price) => {
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
  };

  const handleSaveClick = () => {
    const priceValidation = validatePriceInput(globalPrice);
    if (!priceValidation.isValid) {
      toast.error(priceValidation.message);
      return;
    }

    for (let day of weeklyAvailability) {
      if (day.isAvailable) {
        for (let timeRange of day.timeRanges) {
          if (!isValidTimeRange(timeRange.startTime, timeRange.endTime)) {
            toast.error(`Invalid time range on ${day.dayOfWeek}`);
            return;
          }
        }
      }
    }
    setShowDialog(true);
  };

  const handleConfirmSave = async () => {
    setShowDialog(false);
    setLoading(true);

    try {
      const weeklyAvailabilityWithPrice = weeklyAvailability.map((day) => ({
        ...day,
        price: day.isAvailable ? Number(globalPrice) : 0,
      }));

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SLOT_MANAGEMENT_SET_RECURRING}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
        body: JSON.stringify({ weeklyAvailability: weeklyAvailabilityWithPrice }),
      });

      const data = await response.json();

      if (response.ok) {
        try {
          await fetch(`${API_BASE_URL}${API_ENDPOINTS.SLOT_MANAGEMENT_GENERATE_SLOTS}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            credentials: 'include',
          });
          toast.success('Availability updated successfully!', {
            description: 'Your weekly schedule is now active and slots have been generated.',
          });
        } catch (error) {
          toast.success('Availability updated successfully!');
        }
      } else {
        toast.error(data.message || 'Failed to update availability');
      }
    } catch (error) {
      toast.error('Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  const getDayShort = (day) => {
    return { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' }[day];
  };

  const getSummary = () => {
    const availableDays = weeklyAvailability.filter((d) => d.isAvailable);
    const totalSlots = availableDays.reduce((sum, d) => sum + d.timeRanges.length, 0);
    return { availableDaysCount: availableDays.length, totalSlots, availableDays };
  };

  if (initialLoading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent py-16">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="max-w-4xl mx-auto p-4">
          <Card className="group relative bg-gradient-to-br from-white via-white to-primary-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/30 border border-neutral-200 dark:border-neutral-800 shadow-lg">
            <CardContent className="py-12 flex flex-col items-center gap-3">
              <Loader2 className="w-7 h-7 animate-spin text-primary-600" />
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Loading availability settings...</p>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    );
  }

  const summary = getSummary();
  const selectedDay = weeklyAvailability[selectedDayIndex];

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
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                </div>
                <DialogTitle className="text-lg">Confirm Availability Update</DialogTitle>
              </div>
              <DialogDescription className="text-sm">Review your weekly schedule before saving changes</DialogDescription>
            </DialogHeader>

            <Card className="bg-neutral-50 dark:bg-neutral-900 border">
              <CardContent className="pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Available Days</span>
                  <Badge variant="secondary" className="text-xs">{summary.availableDaysCount} / 7</Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Total Slots</span>
                  <Badge variant="secondary" className="text-xs">{summary.totalSlots}</Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Session Price</span>
                  <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">
                    ₹{globalPrice}
                  </Badge>
                </div>
                
                {summary.availableDays.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Schedule Details</span>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {summary.availableDays.map((day) => (
                          <div key={day.dayOfWeek} className="p-2 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
                            <div className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 mb-1">{day.dayOfWeek}</div>
                            <ul className="space-y-0.5">
                              {day.timeRanges.map((range, idx) => (
                                <li key={idx} className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                                  <Timer className="w-3 h-3 text-primary-600" />
                                  {range.startTime} - {range.endTime}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setShowDialog(false)} disabled={loading} size="sm">
                Cancel
              </Button>
              <Button onClick={handleConfirmSave} disabled={loading} size="sm">
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Confirm & Save
              </Button>
            </DialogFooter>
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
            Configure your recurring schedule and session pricing. Set your availability once and let clients book when it suits you both.
          </motion.p>
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
                  <Label htmlFor="global-price" className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Price per Session
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="relative w-28">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-medium">₹</span>
                      <Input
                        id="global-price"
                        type="number"
                        min={priceConstraints.minPrice}
                        max={priceConstraints.maxPrice}
                        value={globalPrice}
                        onChange={(e) => setGlobalPrice(e.target.value)}
                        className={`pl-6 h-9 text-sm ${
                          globalPrice && !validatePriceInput(globalPrice).isValid ? 'border-red-500' : ''
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
                  <Badge variant="secondary" className="ml-1.5 h-4 min-w-4 px-1 text-xs bg-white/20">
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
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shadow-lg transition-all duration-300 ${
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
                        {selectedDay.timeRanges.length} slot{selectedDay.timeRanges.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
                <Switch
                  checked={selectedDay.isAvailable}
                  onCheckedChange={() => toggleDayAvailability(selectedDayIndex)}
                  aria-label={`Toggle ${selectedDay.dayOfWeek} availability`}
                  className ="z-10"
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
                        <div className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all duration-200 ${
                            !isValidTimeRange(timeRange.startTime, timeRange.endTime)
                              ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20'
                              : 'border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50'
                          }`}
                        >
                          <Timer className="w-4 h-4 text-primary-600 shrink-0" />
                          <Select
                            value={timeRange.startTime}
                            onValueChange={(val) => updateTimeRange(selectedDayIndex, idx, 'startTime', val)}
                          >
                            <SelectTrigger className="h-9 text-xs">
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
                          <span className="text-xs text-neutral-400 font-medium">to</span>
                          <Select
                            value={timeRange.endTime}
                            onValueChange={(val) => updateTimeRange(selectedDayIndex, idx, 'endTime', val)}
                          >
                            <SelectTrigger className="h-9 text-xs">
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            onClick={() => removeTimeRange(selectedDayIndex, idx)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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
          <Card className="group relative bg-gradient-to-br from-white via-white to-primary-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/30 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 transition-all duration-500">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-base font-bold text-neutral-900 dark:text-white">Weekly Summary</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Available Days</span>
                <Badge variant="secondary" className="font-semibold text-xs">
                  {summary.availableDaysCount} of 7
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Total Time Slots</span>
                <Badge variant="secondary" className="font-semibold text-xs">
                  {summary.totalSlots} slot{summary.totalSlots !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              {summary.availableDays.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <span className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Selected Days</span>
                    <div className="flex flex-wrap gap-1.5">
                      {summary.availableDays.map((day) => (
                        <Badge key={day.dayOfWeek} variant="outline" className="font-semibold text-xs">
                          {getDayShort(day.dayOfWeek)} ({day.timeRanges.length})
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Button
            onClick={handleSaveClick}
            disabled={loading}
            size="lg"
            className="w-full shadow-md"
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

export default RecurringAvailabilityComponent;
