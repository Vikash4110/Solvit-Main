import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, Filter, Eye, Users, CheckCircle, XCircle, AlertCircle, Settings, Trash2, MoreVertical } from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';

const CounselorSlots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('month');
  const [showDayActions, setShowDayActions] = useState(false);
  const [showSlotActions, setShowSlotActions] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SLOT_MANAGEMENT_GET_ALL}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        setSlots(data.slots || []);
      }
    } catch (error) {
      console.error('Failed to fetch slots:', error);
    } finally {
      setLoading(false);
    }
  };

  // Day-level slot management
  const manageDaySlots = async (date, status) => {
    try {
      setActionLoading(true);
      setMessage({ type: '', text: '' });

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SLOT_MANAGEMENT_MANAGE_DAY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: "include",
        body: JSON.stringify({ 
          date: formatDate(date), 
          status 
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Day slots updated successfully!' });
        await fetchSlots(); // Refresh slots
        setShowDayActions(false);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update day slots' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update day slots' });
    } finally {
      setActionLoading(false);
    }
  };

  // Individual slot management
  const manageIndividualSlot = async (slotId, status) => {
    try {
      setActionLoading(true);
      setMessage({ type: '', text: '' });

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SLOT_MANAGEMENT_MANAGE_INDIVIDUAL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: "include",
        body: JSON.stringify({ 
          slotId, 
          status 
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Slot updated successfully!' });
        await fetchSlots(); // Refresh slots
        setShowSlotActions({});
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update slot' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update slot' });
    } finally {
      setActionLoading(false);
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const getSlotsForDate = (date) => {
    const targetDateString = formatDate(date);
    return slots.filter(slot => {
      const slotDate = new Date(slot.date);
      const slotDateString = formatDate(slotDate);
      return slotDateString === targetDateString;
    });
  };

  const getFilteredSlots = (daySlots) => {
    if (filterStatus === 'all') return daySlots;
    return daySlots.filter(slot => slot.status === filterStatus);
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  // Status styling
  const getStatusConfig = (status) => {
    const configs = {
      available: {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
        label: 'Available'
      },
      booked: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Users,
        label: 'Booked'
      },
      cancelled: {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
        label: 'Cancelled'
      },
      unavailable: {
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: AlertCircle,
        label: 'Unavailable'
      }
    };
    return configs[status] || configs.available;
  };

  // Check if day has any booked slots
  const dayHasBookedSlots = (date) => {
    const daySlots = getSlotsForDate(date);
    return daySlots.some(slot => slot.isBooked);
  };

  // Render calendar days
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = new Date();

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-100"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const daySlots = getSlotsForDate(date);
      const filteredSlots = getFilteredSlots(daySlots);
      const isToday = isSameDay(date, today);
      const isSelected = selectedDate && isSameDay(date, selectedDate);

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-24 border border-gray-100 p-1 cursor-pointer hover:bg-gray-50 transition-colors ${
            isToday ? 'bg-blue-50 border-blue-200' : ''
          } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {filteredSlots.slice(0, 2).map((slot, index) => {
              const statusConfig = getStatusConfig(slot.status);
              return (
                <div
                  key={index}
                  className={`text-xs px-1 py-0.5 rounded truncate ${statusConfig.color}`}
                  title={`${slot.startTime} - ${slot.endTime} (${statusConfig.label})`}
                >
                  {slot.startTime}
                </div>
              );
            })}
            {filteredSlots.length > 2 && (
              <div className="text-xs text-gray-500 px-1">
                +{filteredSlots.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const selectedDateSlots = selectedDate ? getFilteredSlots(getSlotsForDate(selectedDate)) : [];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading your slots...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">My Available Slots</h1>
        </div>
        <p className="text-gray-600">View and manage your counseling session slots</p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Calendar Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-xl font-semibold">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <button
                    onClick={goToNextMonth}
                    className="p-2 hover:bg-blue-500 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={goToToday}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-400 rounded-lg transition-colors text-sm font-medium"
                >
                  Today
                </button>
              </div>

              <div className="flex items-center gap-4">
                <Filter className="w-4 h-4" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-blue-500 text-white border border-blue-400 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value="all">All Slots</option>
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
              <div className="grid grid-cols-7 gap-0 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 border-b">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
                {renderCalendarDays()}
              </div>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Available</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {slots.filter(s => s.status === 'available').length}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Booked</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {slots.filter(s => s.status === 'booked').length}
              </p>
            </div>
          </div>

          {/* Selected Date Details */}
          {selectedDate && (
            <div className="bg-white rounded-lg shadow-lg border overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-600" />
                    <h3 className="font-semibold text-gray-800">
                      {selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                  </div>

                  {/* Day Actions Dropdown */}
                  {selectedDateSlots.length > 0 && (
                    <div className="relative">
                      <button
                        onClick={() => setShowDayActions(!showDayActions)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Manage day slots"
                      >
                        <Settings className="w-4 h-4 text-gray-600" />
                      </button>

                      {showDayActions && (
                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                          <div className="p-2">
                            <p className="text-xs text-gray-500 mb-2 px-2">Manage all slots for this day:</p>
                            
                            {!dayHasBookedSlots(selectedDate) ? (
                              <>
                                <button
                                  onClick={() => manageDaySlots(selectedDate, 'available')}
                                  disabled={actionLoading}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-green-50 text-green-700 rounded transition-colors disabled:opacity-50"
                                >
                                  <CheckCircle className="w-4 h-4 inline mr-2" />
                                  Set All Available
                                </button>
                                <button
                                  onClick={() => manageDaySlots(selectedDate, 'unavailable')}
                                  disabled={actionLoading}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-700 rounded transition-colors disabled:opacity-50"
                                >
                                  <AlertCircle className="w-4 h-4 inline mr-2" />
                                  Set All Unavailable
                                </button>
                                <button
                                  onClick={() => manageDaySlots(selectedDate, 'delete')}
                                  disabled={actionLoading}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-700 rounded transition-colors disabled:opacity-50"
                                >
                                  <Trash2 className="w-4 h-4 inline mr-2" />
                                  Delete All Slots
                                </button>
                              </>
                            ) : (
                              <p className="text-xs text-red-600 px-2 py-1">
                                Cannot modify day with booked slots
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4">
                {selectedDateSlots.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateSlots.map((slot, index) => {
                      const statusConfig = getStatusConfig(slot.status);
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <StatusIcon className="w-4 h-4 text-gray-500" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-sm font-medium">
                                {slot.startTime} - {slot.endTime}
                              </span>
                            </div>
                            <div className="mt-1">
                              <span className={`text-xs px-2 py-1 rounded-full ${statusConfig.color}`}>
                                {statusConfig.label}
                              </span>
                            </div>
                          </div>

                          {/* Individual Slot Actions */}
                          {!slot.isBooked && (
                            <div className="relative">
                              <button
                                onClick={() => setShowSlotActions({
                                  ...showSlotActions,
                                  [slot._id]: !showSlotActions[slot._id]
                                })}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                              >
                                <MoreVertical className="w-4 h-4 text-gray-500" />
                              </button>

                              {showSlotActions[slot._id] && (
                                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-40">
                                  <div className="p-1">
                                    <button
                                      onClick={() => manageIndividualSlot(slot._id, 'available')}
                                      disabled={actionLoading}
                                      className="w-full text-left px-3 py-2 text-sm hover:bg-green-50 text-green-700 rounded transition-colors disabled:opacity-50"
                                    >
                                      <CheckCircle className="w-3 h-3 inline mr-2" />
                                      Available
                                    </button>
                                    <button
                                      onClick={() => manageIndividualSlot(slot._id, 'unavailable')}
                                      disabled={actionLoading}
                                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-700 rounded transition-colors disabled:opacity-50"
                                    >
                                      <AlertCircle className="w-3 h-3 inline mr-2" />
                                      Unavailable
                                    </button>
                                    <button
                                      onClick={() => manageIndividualSlot(slot._id, 'delete')}
                                      disabled={actionLoading}
                                      className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-700 rounded transition-colors disabled:opacity-50"
                                    >
                                      <Trash2 className="w-3 h-3 inline mr-2" />
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No slots for this date</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="bg-white rounded-lg shadow border p-4">
            <h3 className="font-medium text-gray-800 mb-3">Status Legend</h3>
            <div className="space-y-2">
              {Object.entries({
                available: 'Available for booking',
                booked: 'Already booked',
                cancelled: 'Cancelled session',
                unavailable: 'Not available'
              }).map(([status, description]) => {
                const config = getStatusConfig(status);
                const Icon = config.icon;
                return (
                  <div key={status} className="flex items-center gap-2 text-sm">
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span className={`px-2 py-1 rounded text-xs ${config.color}`}>
                      {config.label}
                    </span>
                    <span className="text-gray-600 text-xs">{description}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showDayActions || Object.values(showSlotActions).some(Boolean)) && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => {
            setShowDayActions(false);
            setShowSlotActions({});
          }}
        />
      )}
    </div>
  );
};

export default CounselorSlots;
