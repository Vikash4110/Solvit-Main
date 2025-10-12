import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaVideo,
  FaTimes,
  FaEdit,
  FaReceipt,
  FaExclamationTriangle,
  FaSpinner,
  FaCalendar,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

import { API_BASE_URL, API_ENDPOINTS } from '../../../config/api';
import { TIMEZONE } from '../../../constants/constants';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);

const ClientDashboardMyBookings = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meetingUrl, setMeetingUrl] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });
  const [cancelModal, setCancelModal] = useState({
    show: false,
    booking: null,
  });
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const tabs = [
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'raiseIssue', label: 'Raise Issue' },
    { key: 'issuesRaised', label: 'Issues Raised' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('clientAccessToken');
      const queryParams = new URLSearchParams({
        filter: activeTab,
        page: page.toString(),
        perPage: '10',
      });

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CLIENT_BOOKINGS}?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      const data = await response.json();
      if (data.success) {
        setBookings(data.data.bookings);
        setPagination(data.data.pagination);
      } else {
        toast.error(data.message || 'Failed to load bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelModal.booking || !cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    try {
      setCancelLoading(true);
      const token = localStorage.getItem('clientAccessToken');
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.CLIENT_BOOKING_CANCEL}/${cancelModal.booking.bookingId}/cancel`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ reason: cancelReason }),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success(data.message || 'Booking cancelled successfully');
        setCancelModal({ show: false, booking: null });
        setCancelReason('');
        fetchBookings();
      } else {
        toast.error(data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Failed to cancel booking');
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      dispute_window_open: 'bg-purple-100 text-purple-800',
      disputed: 'bg-pink-100 text-pink-800',
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          statusStyles[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status?.replace('-', ' ').toUpperCase()}
      </span>
    );
  };

  const renderBookingCard = (booking) => {
    return (
      <motion.div
        key={booking.bookingId}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow border p-6 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
              {booking.counselorPhoto ? (
                <img
                  src={booking.counselorPhoto}
                  alt={booking.counselorName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaUser className="text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{booking.counselorName}</h3>
                {getStatusBadge(booking.status)}
              </div>

              {booking.specialization && (
                <p className="text-sm text-gray-600 mb-2">{booking.specialization}</p>
              )}

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <FaCalendar className="mr-1" />
                  {dayjs.utc(booking.startTime).tz(TIMEZONE).format('YYYY-MM-DD')}
                </div>
                <div className="flex items-center">
                  <FaClock className="mr-1" />
                  {dayjs.utc(booking.startTime).tz(TIMEZONE).format('hh:mm A')} -{' '}
                  {dayjs.utc(booking.endTime).tz(TIMEZONE).format('hh:mm A')}
                </div>
                <div className="font-medium">₹{booking.price}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          {booking.canJoin && booking.videoSDKRoomId && (
            <button
              onClick={() => {
                window.open(
                  `${import.meta.env.VITE_FRONTEND_URL}/meeting/${booking.bookingId}/${booking.videoSDKRoomId}`,
                  'noopener,noreferrer'
                );
              }}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <FaVideo className="mr-2" />
              Join Session
            </button>
          )}

          {booking.canCancel && (
            <button
              onClick={() => setCancelModal({ show: true, booking })}
              className="inline-flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
            >
              <FaTimes className="mr-2" />
              Cancel
            </button>
          )}

          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = booking.invoice;
              link.setAttribute('download', `invoice-${booking.bookingId}.pdf`);
              document.body.appendChild(link);
              link.click();
              link.remove();
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <FaReceipt className="mr-2" />
            Download Invoice
          </button>
        </div>

        {booking.cancellationDeadline && booking.canCancel && (
          <div className="mt-3 text-xs text-gray-500">
            Cancel by: {booking.cancellationDeadline}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-600">Manage your counseling sessions</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {pagination.totalCount > 0 && activeTab === tab.key && (
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {pagination.totalCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin h-8 w-8 text-indigo-600" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <FaCalendarAlt className="mx-auto h-12 w-12 mb-4" />
            <p className="text-lg">No {activeTab.replace('-', ' ')} bookings found</p>
            <p className="text-sm mt-2">
              {activeTab === 'upcoming' && "You don't have any upcoming sessions scheduled."}
              {activeTab === 'raise issue' && 'No sessions are currently in the review window.'}
              {activeTab === 'issues raised' &&
                "You haven't raised any issues for your past sessions."}
              {activeTab === 'completed' && "You don't have any completed sessions yet."}
              {activeTab === 'cancelled' && "You don't have any cancelled sessions."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">{bookings.map(renderBookingCard)}</div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              disabled={pagination.currentPage === 1}
              onClick={() => fetchBookings(pagination.currentPage - 1)}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => fetchBookings(pagination.currentPage + 1)}
              className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.currentPage - 1) * 10 + 1}</span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * 10, pagination.totalCount)}
                </span>{' '}
                of <span className="font-medium">{pagination.totalCount}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => fetchBookings(page)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                      page === pagination.currentPage
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    } border`}
                  >
                    {page}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {cancelModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cancel Booking</h3>
              <button
                onClick={() => setCancelModal({ show: false, booking: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Are you sure you want to cancel your session with{' '}
                <strong>{cancelModal.booking?.counselorName}</strong>?
              </p>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex">
                  <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Cancellation must be made at least 24 hours before the session. Refunds will
                      be processed within 5-7 business days.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation *
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                rows="3"
                placeholder="Please provide a reason for cancellation..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCancelModal({ show: false, booking: null })}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelLoading || !cancelReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
              >
                {cancelLoading ? <FaSpinner className="animate-spin mr-2" /> : null}
                Cancel Booking
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};


export default ClientDashboardMyBookings;