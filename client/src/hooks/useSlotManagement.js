import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import { slotManagementService } from '../services/booking';
import useSmartRefresh from './useSmartRefresh';

/**
 * Enterprise Layer 3 State Hook for Counselor Calendar Slot Management.
 * Encapsulates calendar slot fetching, smart background refresh, bulk day-slot updates,
 * individual slot status toggling, custom slot generation, and confirmation dialog state.
 *
 * @returns {Object} Slot management states and action handlers.
 */
export const useSlotManagement = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [addSlotLoading, setAddSlotLoading] = useState(false);
  const [showAddSlotDialog, setShowAddSlotDialog] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    description: '',
    action: null,
    variant: 'default',
  });

  const [newSlotData, setNewSlotData] = useState({
    date: dayjs().format('YYYY-MM-DD'),
    startTime: '9:00 AM',
    endTime: '9:45 AM',
    price: '',
  });

  // Fetch all counselor availability slots
  const fetchSlots = useCallback(async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setLoading(true);
      }
      const data = await slotManagementService.getAllSlots();
      setSlots(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error.response?.status === 404) {
        setSlots([]);
      } else if (!isAutoRefresh) {
        toast.error('Failed to fetch slots');
      }
    } finally {
      if (!isAutoRefresh) {
        setLoading(false);
      }
    }
  }, []);

  // Smart polling & foreground refocus synchronization
  useSmartRefresh(fetchSlots, {
    intervalMs: 120000,
    staleTimeMs: 30000,
  });

  const showConfirmDialog = useCallback((title, description, action, variant = 'default') => {
    setConfirmDialog({
      open: true,
      title,
      description,
      action,
      variant,
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (confirmDialog.action) {
      await confirmDialog.action();
    }
    setConfirmDialog({
      open: false,
      title: '',
      description: '',
      action: null,
      variant: 'default',
    });
  }, [confirmDialog]);

  // Bulk update all slots for a given date
  const manageDaySlots = useCallback(
    async (date, status) => {
      try {
        setActionLoading(true);
        const data = await slotManagementService.manageDaySlots(
          dayjs(date).format('YYYY-MM-DD'),
          status
        );
        toast.success(data.message || 'Day slots updated successfully!');
        await fetchSlots();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update day slots');
      } finally {
        setActionLoading(false);
      }
    },
    [fetchSlots]
  );

  // Toggle single slot status
  const manageIndividualSlot = useCallback(
    async (slotId, status) => {
      try {
        setActionLoading(true);
        const data = await slotManagementService.manageIndividualSlot(slotId, status);
        toast.success(data.message || 'Slot updated successfully!');
        await fetchSlots();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to update slot');
      } finally {
        setActionLoading(false);
      }
    },
    [fetchSlots]
  );

  // Add a one-off custom slot
  const handleAddCustomSlot = useCallback(async () => {
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
      const data = await slotManagementService.addCustomSlot({
        date: newSlotData.date,
        startTime: newSlotData.startTime,
        endTime: newSlotData.endTime,
        price: Number(newSlotData.price),
      });

      toast.success(data.message || 'Slot added successfully!');
      setShowAddSlotDialog(false);
      setNewSlotData({
        date: dayjs().format('YYYY-MM-DD'),
        startTime: '9:00 AM',
        endTime: '9:45 AM',
        price: '',
      });
      await fetchSlots();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add custom slot');
    } finally {
      setAddSlotLoading(false);
    }
  }, [newSlotData, fetchSlots]);

  return {
    slots,
    setSlots,
    loading,
    actionLoading,
    confirmDialog,
    setConfirmDialog,
    showConfirmDialog,
    handleConfirm,
    manageDaySlots,
    manageIndividualSlot,
    showAddSlotDialog,
    setShowAddSlotDialog,
    newSlotData,
    setNewSlotData,
    addSlotLoading,
    handleAddCustomSlot,
    fetchSlots,
  };
};

export default useSlotManagement;
