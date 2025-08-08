import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  User,
  Star,
  Languages,
  CheckCircle,
  XCircle,
  Loader2,
  Video,
  X,
  CreditCard
} from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

const BookCounselorCalendar = () => {
  const { counselorId } = useParams();
  const navigate = useNavigate();
  
  const [counselor, setCounselor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    fetchCounselorData();
  }, [counselorId]);

  const fetchCounselorData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.BOOKING_COUNSELOR_SLOTS}/${counselorId}/slots`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setCounselor(data.counselor);
        setSlots(data.slots || []);
      } else {
        setMessage({ type: 'error', text: 'Failed to load counselor data' });
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setMessage({ type: 'error', text: 'Failed to load counselor data' });
    } finally {
      setLoading(false);
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

  const getSlotPrice = (slot) => {
    return slot.price || 3000;
  };

  // Get client data for payment
  const getClientData = () => {
    const clientData = localStorage.getItem('user');
    return clientData ? JSON.parse(clientData) : null;
  };

  const initiatePayment = async () => {
    if (!selectedSlot) return;
    
    try {
      setBookingLoading(true);
      setMessage({ type: '', text: '' });
      
      const clientData = getClientData();
      if (!clientData) {
        setMessage({ type: 'error', text: 'Client data not found. Please login again.' });
        setBookingLoading(false);
        return;
      }
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage({ type: 'error', text: 'Authentication required. Please login again.' });
        setBookingLoading(false);
        return;
      }
    

      const amount = getSlotPrice(selectedSlot);
     

      // Step 1: Get Razorpay key
      const keyResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PAYMENT_GET_KEY}`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
    });
      
      if (!keyResponse.ok) {
        throw new Error('Failed to get Razorpay key');
      }
     
      
      const { key } = await keyResponse.json();
      //console.log(key)

      // Step 2: Create Razorpay order
      const orderResponse = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PAYMENT_CHECKOUT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify({
          amount,
          clientId: clientData._id,
          slotId: selectedSlot._id
        })
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        setMessage({ type: 'error', text: 'Failed to create payment order' });
        setBookingLoading(false);
        return;
      }

      // Step 3: Initialize Razorpay checkout
      const options = {
        key: key,
        amount: orderData.order.amount,
        currency: 'INR',
        name: 'MindCare',
        description: `Counseling Session with ${counselor.fullName}`,
        order_id: orderData.order.id,
        handler: async (response) => {
          // Step 4: Verify payment on backend
          await verifyPayment({
            ...response,
            clientId: clientData._id,
            slotId: selectedSlot._id
          });
        },
        prefill: {
          name: clientData.fullName,
          email: clientData.email,
          contact: clientData.phone || '9999999999'
        },
        notes: {
          counselor: counselor.fullName,
          session_date: selectedDate?.toLocaleDateString(),
          session_time: selectedSlot.startTime
        },
        theme: {
          color: '#2563eb'
        },
        modal: {
          ondismiss: () => {
            setBookingLoading(false);
            setMessage({ type: 'error', text: 'Payment cancelled' });
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

      // Handle payment failure
      razorpay.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        setMessage({ type: 'error', text: 'Payment failed. Please try again.' });
        setBookingLoading(false);
      });

    } catch (error) {
      console.error('Payment initiation error:', error);
      setMessage({ type: 'error', text: 'Failed to initiate payment. Please try again.' });
      setBookingLoading(false);
    }
  };

  const verifyPayment = async (paymentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.PAYMENT_VERIFICATION}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include',
        body: JSON.stringify(paymentData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: 'Payment successful! Session booked. Google Meet link sent to your email.' 
        });
        
        // Update slot status locally
        setSlots(prev => 
          prev.map(slot => 
            slot._id === selectedSlot._id 
              ? { ...slot, status: 'booked', isBooked: true }
              : slot
          )
        );
        
        closeBookingModal();
        
        // Redirect to bookings page after a delay
        setTimeout(() => {
          navigate('/my-bookings');
        }, 3000);
        
      } else {
        setMessage({ type: 'error', text: data.message || 'Payment verification failed' });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setMessage({ type: 'error', text: 'Failed to verify payment' });
    } finally {
      setBookingLoading(false);
    }
  };

  // Calendar helper functions (same as before)
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
      return slotDateString === targetDateString && slot.status === 'available' && !slot.isBooked;
    });
  };

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
      const isToday = isSameDay(date, today);
      const isSelected = selectedDate && isSameDay(date, selectedDate);
      const isPast = date < today && !isToday;

      days.push(
        <div
          key={day}
          onClick={() => !isPast && setSelectedDate(date)}
          className={`h-24 border border-gray-100 p-1 transition-colors ${
            isPast 
              ? 'bg-gray-50 cursor-not-allowed' 
              : 'cursor-pointer hover:bg-gray-50'
          } ${
            isToday ? 'bg-blue-50 border-blue-200' : ''
          } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        >
          <div className={`text-sm font-medium mb-1 ${
            isPast ? 'text-gray-400' : isToday ? 'text-blue-600' : 'text-gray-900'
          }`}>
            {day}
          </div>
          <div className="space-y-1">
            {!isPast && daySlots.slice(0, 2).map((slot, index) => (
              <div
                key={index}
                className="text-xs px-1 py-0.5 rounded truncate bg-blue-100 text-blue-800"
                title={`${slot.startTime} - ${slot.endTime} (45 minutes)`}
              >
                {slot.startTime}
              </div>
            ))}
            {!isPast && daySlots.length > 2 && (
              <div className="text-xs text-gray-500 px-1">
                +{daySlots.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const selectedDateSlots = selectedDate ? getSlotsForDate(selectedDate) : [];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!counselor) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-20">
          <h2 className="text-xl text-gray-500">Counselor not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Browse
        </button>
        
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
            {counselor.profilePicture ? (
              <img 
                src={counselor.profilePicture} 
                alt={counselor.fullName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-blue-600" />
            )}
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{counselor.fullName}</h1>
            <p className="text-blue-600 font-medium">{counselor.specialization}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                4.8 (124 reviews)
              </span>
              <span>{counselor.gender}</span>
              {counselor.application?.languages && (
                <span className="flex items-center gap-1">
                  <Languages className="w-4 h-4" />
                  {counselor.application.languages.join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>
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
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={goToPreviousMonth} className="p-2 hover:bg-blue-500 rounded-lg transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-xl font-semibold">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <button onClick={goToNextMonth} className="p-2 hover:bg-blue-500 rounded-lg transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <button onClick={goToToday} className="px-4 py-2 bg-blue-500 hover:bg-blue-400 rounded-lg transition-colors text-sm font-medium">
                  Today
                </button>
              </div>
            </div>

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
          {counselor.application?.professionalSummary && (
            <div className="bg-white rounded-lg shadow border p-4">
              <h3 className="font-medium text-gray-800 mb-2">About</h3>
              <p className="text-sm text-gray-600">
                {counselor.application.professionalSummary}
              </p>
            </div>
          )}

          {selectedDate && (
            <div className="bg-white rounded-lg shadow border overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="font-semibold text-gray-800">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
              </div>
              
              <div className="p-4 max-h-96 overflow-y-auto">
                {selectedDateSlots.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateSlots.map((slot) => (
                      <div key={slot._id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-800">
                              {slot.startTime} - {slot.endTime}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-green-600">
                            ₹{getSlotPrice(slot)}
                          </span>
                        </div>
                        
                        <div className="mb-3 text-xs text-gray-600">
                          45-minute session
                        </div>
                        
                        <button
                          onClick={() => openBookingModal(slot)}
                          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Book Now
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No slots available on this date</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow border p-4">
            <h3 className="font-medium text-gray-800 mb-3">Session Pricing</h3>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">₹3,000</div>
              <div className="text-sm text-gray-600">45-minute session</div>
            </div>
            <div className="mt-3 p-2 bg-green-50 rounded text-xs text-green-700">
              💡 Secure payment via Razorpay
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal with Payment */}
      {showBookingModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Confirm Booking & Payment</h3>
              <button
                onClick={closeBookingModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Session Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {selectedDate?.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {selectedSlot.startTime} - {selectedSlot.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Duration:</span>
                  <span className="text-sm font-medium text-gray-800">45 minutes</span>
                </div>
              </div>

              {/* Payment Amount */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Amount to Pay:</span>
                  <span className="text-lg font-bold text-blue-600">
                    ₹{getSlotPrice(selectedSlot)}
                  </span>
                </div>
              </div>

              {/* Payment & Meet Notice */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <CreditCard className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">
                    Secure payment via Razorpay
                  </span>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <Video className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    Google Meet link will be sent after payment
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeBookingModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={initiatePayment}
                  disabled={bookingLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {bookingLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Pay ₹{getSlotPrice(selectedSlot)}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookCounselorCalendar;
