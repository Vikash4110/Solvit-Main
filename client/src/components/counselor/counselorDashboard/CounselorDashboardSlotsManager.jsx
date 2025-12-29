import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Clock,
  Filter,
  Trash2,
  Loader2,
  CircleCheck,
  CircleAlert,
  CalendarDays,
  Settings,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus, // NEW: Added for Add Custom Slot button
} from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS } from '../../../config/api';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { TIMEZONE ,SLOT_DURATION_MINUTES } from '../../../constants/constants';
import { toast } from 'sonner';

// shadcn/ui imports
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label'; // NEW: Added for form labels
import { Input } from '@/components/ui/input'; // NEW: Added for form inputs
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
// NEW: Added Dialog imports for Add Custom Slot
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);

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

const CounselorDashboardSlotsManager = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs().tz(TIMEZONE));
  const [filterStatus, setFilterStatus] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    action: null,
    variant: 'default',
  });

  // NEW: Add Custom Slot state
  const [showAddSlotDialog, setShowAddSlotDialog] = useState(false);
  const [addSlotLoading, setAddSlotLoading] = useState(false);
  const [newSlotData, setNewSlotData] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    startTime: '9:00 AM',
    endTime: '9:45 AM',
    price: '',
  });

  useEffect(() => {
    const alignAndStart = () => {
      fetchSlots();
      const temp = dayjs().tz(TIMEZONE).second();
      const delay = (60 - temp) * 1000;

      setTimeout(() => {
        fetchSlots();
        const intervalId = setInterval(fetchSlots, 60000);
        return () => clearInterval(intervalId);
      }, delay);
    };

    alignAndStart();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SLOT_MANAGEMENT_GET_ALL}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSlots(data.slots || []);
      } else {
        toast.error('Failed to fetch slots');
      }
    } catch (error) {
      toast.error('Failed to fetch slots');
    } finally {
      setLoading(false);
    }
  };

  const showConfirmDialog = (title, description, action, variant = 'default') => {
    setConfirmDialog({
      open: true,
      title,
      description,
      action,
      variant,
    });
  };

  const handleConfirm = async () => {
    if (confirmDialog.action) {
      await confirmDialog.action();
    }
    setConfirmDialog({ open: false, title: '', description: '', action: null, variant: 'default' });
  };

  const manageDaySlots = async (date, status) => {
    try {
      setActionLoading(true);
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SLOT_MANAGEMENT_MANAGE_DAY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
        body: JSON.stringify({ date: dayjs(date).format('YYYY-MM-DD'), status }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || 'Day slots updated successfully!');
        await fetchSlots();
      } else {
        toast.error(data.message || 'Failed to update day slots');
      }
    } catch (error) {
      toast.error('Failed to update day slots');
    } finally {
      setActionLoading(false);
    }
  };

  const manageIndividualSlot = async (slotId, status) => {
    try {
      setActionLoading(true);
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.SLOT_MANAGEMENT_MANAGE_INDIVIDUAL}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          credentials: 'include',
          body: JSON.stringify({ slotId, status }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || 'Slot updated successfully!');
        await fetchSlots();
      } else {
        toast.error(data.message || 'Failed to update slot');
      }
    } catch (error) {
      toast.error('Failed to update slot');
    } finally {
      setActionLoading(false);
    }
  };

  // NEW: Add Custom Slot Handlers
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

  const handleAddCustomSlot = async () => {
    if (!newSlotData.date || !newSlotData.startTime || !newSlotData.endTime || !newSlotData.price) {
      toast.error('Please fill all fields');
      return;
    }

    if (Number(newSlotData.price) <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    setAddSlotLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SLOT_MANAGEMENT_ADD_CUSTOM}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          date: newSlotData.date,
          startTime: newSlotData.startTime,
          endTime: newSlotData.endTime,
          price: Number(newSlotData.price),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Slot added successfully!');
        setShowAddSlotDialog(false);
        setNewSlotData({
          date: dayjs().format('YYYY-MM-DD'),
          startTime: '9:00 AM',
          endTime: '9:45 AM', // Updated
          price: '',
        });
        await fetchSlots();

        const addedSlotDate = dayjs(newSlotData.date);
        setSelectedDate(addedSlotDate);
      } else {
        toast.error(data.message || 'Failed to add slot');
      }
    } catch (error) {
      console.error('Error adding slot:', error);
      toast.error('Failed to add slot. Please try again');
    } finally {
      setAddSlotLoading(false);
    }
  };

  const handleCloseAddSlotDialog = () => {
    setShowAddSlotDialog(false);
    setNewSlotData({
      date: dayjs().format('YYYY-MM-DD'),
      startTime: '9:00 AM',
      endTime: '9:45 AM', // Updated to match +45 minutes
      price: '',
    });
  };

  const getSlotsForDate = (date) => {
    const targetDateString = dayjs(date).format('YYYY-MM-DD');
    return slots.filter((slot) => {
      const slotDateString = dayjs(slot.startTime).tz(TIMEZONE).format('YYYY-MM-DD');
      return slotDateString === targetDateString;
    });
  };

  const getFilteredSlots = (daySlots) => {
    if (filterStatus === 'all') return daySlots;
    const statusMap = {
      available: daySlots.filter((s) => s.status === 'available'),
      booked: daySlots.filter((s) => s.status === 'booked'),
      unavailable: daySlots.filter((s) => s.status === 'unavailable'),
    };
    return statusMap[filterStatus] || daySlots;
  };

  const getSlotStatus = (slot) => {
    if (slot.status === 'booked') return 'booked';
    if (slot.status === 'unavailable') return 'unavailable';
    if (slot.status === 'available') return 'available';
    return 'available';
  };

  const getStatusConfig = (status) => {
    const configs = {
      available: { icon: CircleCheck, label: 'Available' },
      booked: { icon: CalendarDays, label: 'Booked' },
      unavailable: { icon: CircleAlert, label: 'Unavailable' },
    };
    return configs[status] || configs.available;
  };

  const dayHasBookedSlots = (date) => getSlotsForDate(date).some((s) => s.status === 'booked');

  const getDatesWithSlots = () => {
    const uniqueDates = new Set();
    slots.forEach((slot) => {
      const dateStr = dayjs(slot.startTime).tz(TIMEZONE).format('YYYY-MM-DD');
      const date = dayjs(dateStr).toDate();
      uniqueDates.add(date.toLocaleDateString());
    });
    return Array.from(uniqueDates);
  };
  // NEW: Helper function to calculate end time (start time + slotDuration minutes ( for now it is 45 minutes))
  const calculateEndTime = (startTime) => {
    // Parse the start time
    const [time, period] = startTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);

    // Convert to 24-hour format
    let hours24 = hours;
    if (period === 'PM' && hours !== 12) {
      hours24 = hours + 12;
    } else if (period === 'AM' && hours === 12) {
      hours24 = 0;
    }

    // Add Slot Duration
    let totalMinutes = hours24 * 60 + minutes + SLOT_DURATION_MINUTES;

    // Convert back to hours and minute
    let newHours = Math.floor(totalMinutes / 60) % 24;
    let newMinutes = totalMinutes % 60;

    // Convert back to 12-hour format
    const newPeriod = newHours >= 12 ? 'PM' : 'AM';
    if (newHours > 12) {
      newHours = newHours - 12;
    } else if (newHours === 0) {
      newHours = 12;
    }

    // Format the result
    return `${newHours}:${newMinutes.toString().padStart(2, '0')} ${newPeriod}`;
  };

  const selectedDateSlots = getFilteredSlots(getSlotsForDate(selectedDate));

  if (loading) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-50 via-primary-100 to-primary-200/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary-950/30 py-16">
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
                Loading your slots...
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-50 via-primary-100 to-primary-200/30 dark:from-neutral-950 dark:via-neutral-900 dark:to-primary-950/30 py-16 lg:py-20">
      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div className="text-center mb-12 space-y-4" variants={containerVariants}>
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight"
            variants={fadeInUp}
          >
            <span className="text-neutral-900 dark:text-white">My Available</span>
            <br />
            <span className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 dark:from-primary-400 dark:via-primary-300 dark:to-secondary-400 bg-clip-text text-transparent">
              Slots Calendar
            </span>
          </motion.h2>

          <motion.p
            className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed"
            variants={fadeInUp}
          >
            View and manage your counseling session slots. Dates with available slots are
            highlighted.
          </motion.p>
        </motion.div>

        {/* NEW: Add Custom Slot Button */}
        <motion.div variants={fadeInUp} className="mb-6 flex justify-center">
          <Button onClick={() => setShowAddSlotDialog(true)} size="lg" className="shadow-md">
            <Plus className="w-5 h-5 mr-2" />
            Add Custom Slot
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Section */}
          <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Card className="group relative bg-gradient-to-br from-white via-white to-primary-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/30 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <CircleCheck className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      Available
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                    {slots.filter((s) => s.status === 'available').length}
                  </p>
                </CardContent>
              </Card>

              <Card className="group relative bg-gradient-to-br from-white via-white to-primary-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/30 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <CalendarDays className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      Booked
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                    {slots.filter((s) => s.status === 'booked').length}
                  </p>
                </CardContent>
              </Card>

              <Card className="group relative bg-gradient-to-br from-white via-white to-primary-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/30 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <CircleAlert className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      Unavailable
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                    {slots.filter((s) => s.status === 'unavailable').length}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Calendar Card */}
            <Card className="group relative bg-gradient-to-br from-white via-white to-primary-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/30 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-500/10 to-transparent rounded-bl-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <CalendarIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">Select Date</CardTitle>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                        Highlighted dates have slots
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-full sm:w-40 h-9 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                        <Filter className="w-4 h-4 mr-2 text-primary-600" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
                        <SelectItem value="all">All Slots</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="booked">Booked</SelectItem>
                        <SelectItem value="unavailable">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      onClick={() => setSelectedDate(dayjs().tz(TIMEZONE))}
                      className="bg-primary-600 hover:bg-primary-700 text-white"
                    >
                      Today
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex justify-center pb-6">
                <Calendar
                  mode="single"
                  selected={selectedDate.toDate()}
                  onSelect={(date) => date && setSelectedDate(dayjs(date).tz(TIMEZONE))}
                  hasSlotsDates={getDatesWithSlots()}
                  variant="elevated"
                  className="rounded-xl"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div variants={fadeInUp} className="space-y-6">
            <Card className="group relative bg-gradient-to-br from-white via-white to-primary-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/30 border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-500/10 to-transparent rounded-bl-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 flex items-center justify-center shadow-lg">
                      <CalendarDays className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold">
                        {selectedDate.format('dddd')}
                      </CardTitle>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {selectedDate.format('MMMM D, YYYY')}
                      </p>
                    </div>
                  </div>
                  {selectedDateSlots.length > 0 && !dayHasBookedSlots(selectedDate) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-2 border-primary-200 dark:border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                        >
                          <Settings className="w-3.5 h-3.5 text-primary-600" />
                          Manage Day
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-56 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                      >
                        <DropdownMenuLabel className="text-primary-700 dark:text-primary-400">
                          Day Actions
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-800" />
                        <DropdownMenuItem
                          onClick={() =>
                            showConfirmDialog(
                              'Set All Available',
                              `Are you sure you want to set all slots on ${selectedDate.format('MMMM D, YYYY')} as available?`,
                              () => manageDaySlots(selectedDate, 'available'),
                              'default'
                            )
                          }
                          disabled={actionLoading}
                          className="cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                          <span>Set All Available</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            showConfirmDialog(
                              'Set All Unavailable',
                              `Are you sure you want to set all slots on ${selectedDate.format('MMMM D, YYYY')} as unavailable?`,
                              () => manageDaySlots(selectedDate, 'unavailable'),
                              'default'
                            )
                          }
                          disabled={actionLoading}
                          className="cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20"
                        >
                          <XCircle className="w-4 h-4 mr-2 text-orange-600" />
                          <span>Set All Unavailable</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-800" />
                        <DropdownMenuItem
                          onClick={() =>
                            showConfirmDialog(
                              'Delete All Slots',
                              `Are you sure you want to delete all slots on ${selectedDate.format('MMMM D, YYYY')}? This action cannot be undone.`,
                              () => manageDaySlots(selectedDate, 'delete'),
                              'destructive'
                            )
                          }
                          disabled={actionLoading}
                          className="cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          <span>Delete All Slots</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 px-4 pb-4">
                <ScrollArea className="h-[500px] pr-3">
                  <AnimatePresence mode="wait">
                    {selectedDateSlots.length > 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3"
                      >
                        {selectedDateSlots.map((slot) => {
                          const config = getStatusConfig(getSlotStatus(slot));
                          const Icon = config.icon;
                          return (
                            <motion.div
                              key={slot._id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              transition={{ duration: 0.2 }}
                              className="p-4 bg-white/50 dark:bg-neutral-900/50 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-primary-400 dark:hover:border-primary-600 transition-all duration-300"
                            >
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex items-start gap-3 flex-1">
                                  <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                                    <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Clock className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                                      <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                        {dayjs(slot.startTime).tz(TIMEZONE).format('hh:mm A')} -{' '}
                                        {dayjs(slot.endTime).tz(TIMEZONE).format('hh:mm A')}
                                      </span>
                                    </div>
                                    <Badge
                                      variant="secondary"
                                      className="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 text-xs"
                                    >
                                      {config.label}
                                    </Badge>
                                    {slot.basePrice && (
                                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
                                        Price: ₹{slot.basePrice}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {slot.status !== 'booked' && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full h-8 gap-2 border-primary-200 dark:border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                                    >
                                      <Settings className="w-3.5 h-3.5 text-primary-600" />
                                      Manage Slot
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-52 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                                  >
                                    <DropdownMenuLabel className="text-primary-700 dark:text-primary-400">
                                      Slot Actions
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-800" />
                                    <DropdownMenuItem
                                      onClick={() =>
                                        showConfirmDialog(
                                          'Set Slot Available',
                                          `Set this slot (${dayjs(slot.startTime).tz(TIMEZONE).format('hh:mm A')} - ${dayjs(slot.endTime).tz(TIMEZONE).format('hh:mm A')}) as available?`,
                                          () => manageIndividualSlot(slot._id, 'available'),
                                          'default'
                                        )
                                      }
                                      disabled={actionLoading}
                                      className="cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-green-600" />
                                      <span>Set Available</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        showConfirmDialog(
                                          'Set Slot Unavailable',
                                          `Set this slot (${dayjs(slot.startTime).tz(TIMEZONE).format('hh:mm A')} - ${dayjs(slot.endTime).tz(TIMEZONE).format('hh:mm A')}) as unavailable?`,
                                          () => manageIndividualSlot(slot._id, 'unavailable'),
                                          'default'
                                        )
                                      }
                                      disabled={actionLoading}
                                      className="cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20"
                                    >
                                      <XCircle className="w-3.5 h-3.5 mr-2 text-orange-600" />
                                      <span>Set Unavailable</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-800" />
                                    <DropdownMenuItem
                                      onClick={() =>
                                        showConfirmDialog(
                                          'Delete Slot',
                                          `Are you sure you want to delete this slot (${dayjs(slot.startTime).tz(TIMEZONE).format('hh:mm A')} - ${dayjs(slot.endTime).tz(TIMEZONE).format('hh:mm A')})? This action cannot be undone.`,
                                          () => manageIndividualSlot(slot._id, 'delete'),
                                          'destructive'
                                        )
                                      }
                                      disabled={actionLoading}
                                      className="cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 mr-2" />
                                      <span>Delete Slot</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                      >
                        <div className="w-16 h-16 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
                          <Clock className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                        </div>
                        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                          No slots for this date
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          Select a different date to view available slots
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => !open && setConfirmDialog({ ...confirmDialog, open: false })}
      >
        <AlertDialogContent className="bg-gradient-to-br from-white via-white to-primary-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/30 border border-neutral-200 dark:border-neutral-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-primary-800 dark:text-primary-200">
              {confirmDialog.variant === 'destructive' ? (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              ) : (
                <Settings className="w-5 h-5 text-primary-600" />
              )}
              {confirmDialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-600 dark:text-neutral-400">
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              disabled={actionLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={actionLoading}
              className={
                confirmDialog.variant === 'destructive'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-primary-600 hover:bg-primary-700 text-white'
              }
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* NEW: Add Custom Slot Dialog */}
      <Dialog open={showAddSlotDialog} onOpenChange={setShowAddSlotDialog}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-white via-white to-primary-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-primary-950/30 border border-neutral-200 dark:border-neutral-800">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary-600 dark:text-primary-500" />
              </div>
              <DialogTitle className="text-lg">Add Custom Slot</DialogTitle>
            </div>
            <DialogDescription className="text-sm">
              Create a one-time slot for a specific date and time without modifying your recurring
              availability.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Date Input */}
            <div className="space-y-2">
              <Label htmlFor="slot-date" className="text-sm font-medium">
                Date
              </Label>
              <Input
                id="slot-date"
                type="date"
                min={dayjs().format('YYYY-MM-DD')}
                value={newSlotData.date}
                onChange={(e) => setNewSlotData({ ...newSlotData, date: e.target.value })}
                className="w-full"
              />
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="start-time" className="text-sm font-medium">
                  Start Time
                </Label>
                <Select
                  value={newSlotData.startTime}
                  onValueChange={(val) => {
                    const calculatedEndTime = calculateEndTime(val);
                    setNewSlotData({
                      ...newSlotData,
                      startTime: val,
                      endTime: calculatedEndTime,
                    });
                  }}
                >
                  <SelectTrigger id="start-time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-48">
                      {timeOptions.map((time) => (
                        <SelectItem key={time} value={time} className="text-sm">
                          {time}
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-time" className="text-sm font-medium text-neutral-500">
                  End Time
                  <span className="text-xs ml-1.5 text-neutral-400">(Auto-calculated)</span>
                </Label>
                <Select value={newSlotData.endTime} disabled>
                  <SelectTrigger
                    id="end-time"
                    className="bg-neutral-50 dark:bg-neutral-800/50 cursor-not-allowed opacity-75"
                  >
                    <SelectValue />
                  </SelectTrigger>
                </Select>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Duration: {
                    SLOT_DURATION_MINUTES
                  }minutes
                </p>
              </div>
            </div>

            {/* Price Input */}
            <div className="space-y-2">
              <Label htmlFor="slot-price" className="text-sm font-medium">
                Price (₹)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">
                  ₹
                </span>
                <Input
                  id="slot-price"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Enter price"
                  value={newSlotData.price}
                  onChange={(e) => setNewSlotData({ ...newSlotData, price: e.target.value })}
                  className="pl-6"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCloseAddSlotDialog} disabled={addSlotLoading}>
              Cancel
            </Button>
            <Button onClick={handleAddCustomSlot} disabled={addSlotLoading}>
              {addSlotLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Add Slot
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CounselorDashboardSlotsManager;
