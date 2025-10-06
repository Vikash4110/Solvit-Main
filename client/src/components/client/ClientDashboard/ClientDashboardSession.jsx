// components/ClientDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaCalendarAlt,
  FaClock,
  FaVideo,
  FaUser,
  FaChartBar,
  FaExclamationTriangle,
  FaSearch,
  FaPlus,
  FaHeart,
  FaStar,
  FaCheckCircle,
} from 'react-icons/fa';
import { API_BASE_URL } from '../../../config/api';
import { formatTime } from '../../../../utils/timeUtils'; // ADD formatTime import
import { useClientAuth } from '../../../contexts/ClientAuthContext';

const ClientDashboardSession = () => {
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { client } = useClientAuth();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const token = localStorage.getItem('clientAccessToken');

      // USE NEW DASHBOARD ENDPOINT
      const response = await fetch(`${API_BASE_URL}/sessions/dashboard/sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setUpcomingSessions(data.data.upcoming || []);
        setRecentSessions(data.data.past || []);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      ongoing: 'bg-green-100 text-green-800 border-green-200',
      completed_pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed_final: 'bg-green-100 text-green-800 border-green-200',
      disputed: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
      no_show: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const canJoinSession = (session) => {
    const now = new Date();
    const slot = session.slotId;
    if (!slot) return false;

    // UPDATED: Parse slot date and time properly
    const slotDate = new Date(slot.date);
    const [time, period] = slot.startTime.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    const sessionStart = new Date(slotDate);
    sessionStart.setHours(hour, parseInt(minutes), 0, 0);

    const startWithGrace = new Date(sessionStart.getTime() - 10 * 60 * 1000);
    const endWithGrace = new Date(sessionStart.getTime() + 55 * 60 * 1000);

    return session.status === 'confirmed' && now >= startWithGrace && now <= endWithGrace;
  };

  // UPDATED: Format slot date and time
  const formatSlotDateTime = (slot) => {
    if (!slot) return 'N/A';
    const date = new Date(slot.date);
    return `${date.toLocaleDateString()} at ${slot.startTime}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {client?.fullName}! 👋
            </h1>
            <p className="text-gray-600">Manage your counseling sessions and track your progress</p>
          </div>

          <Link
            to="/browse-counselors"
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 hover:scale-105 flex items-center font-semibold shadow-lg"
          >
            <FaPlus className="mr-2" />
            Book New Session
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FaCalendarAlt className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingSessions.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <FaCheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {recentSessions.filter((s) => s.status === 'completed_final').length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FaHeart className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((recentSessions.length * 45) / 60)}h
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <FaStar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Avg. Rating</p>
                <p className="text-2xl font-bold text-gray-900">4.8</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Upcoming Sessions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Sessions</h2>

          {upcomingSessions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
              <FaCalendarAlt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-3">No Upcoming Sessions</h3>
              <p className="text-gray-500 mb-6">
                Book your first session to get started on your wellness journey.
              </p>
              <Link
                to="/browse-counselors"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <FaSearch className="mr-2" />
                Find a Counselor
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map((session, index) => (
                <motion.div
                  key={session._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center">
                        <FaUser className="text-indigo-600 h-8 w-8" />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg mb-1">
                          Dr. {session.counselorId?.fullName}
                        </h3>
                        <p className="text-indigo-600 font-medium mb-2">
                          {session.counselorId?.specialization}
                        </p>
                        <div className="flex items-center text-gray-600 space-x-4">
                          <div className="flex items-center">
                            <FaClock className="mr-2 text-sm" />
                            <span className="text-sm">{formatSlotDateTime(session.slotId)}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm">45 minutes</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}
                      >
                        {session.status.replace('_', ' ').toUpperCase()}
                      </span>

                      {canJoinSession(session) && (
                        <Link
                          to={`/session/${session._id}`}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm font-medium"
                        >
                          <FaVideo className="mr-2" />
                          Join Now
                        </Link>
                      )}

                      {!canJoinSession(session) && session.status === 'confirmed' && (
                        <Link
                          to={`/session/${session._id}`}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                        >
                          View Session
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Session History</h2>

          {recentSessions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
              <FaChartBar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Session History</h3>
              <p className="text-gray-500">Your completed sessions will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentSessions.slice(0, 5).map((session, index) => (
                <motion.div
                  key={session._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-gray-600" />
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Dr. {session.counselorId?.fullName}
                        </h3>
                        <div className="flex items-center text-gray-600 space-x-4">
                          <div className="flex items-center">
                            <FaClock className="mr-2 text-sm" />
                            <span className="text-sm">{formatSlotDateTime(session.slotId)}</span>
                          </div>
                          {session.attendance?.summary?.clientMinutes && (
                            <span className="text-sm text-green-600">
                              Attended: {session.attendance.summary.clientMinutes} minutes
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {session.dispute?.isDisputed && (
                        <FaExclamationTriangle className="text-red-500" />
                      )}

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}
                      >
                        {session.status.replace('_', ' ').toUpperCase()}
                      </span>

                      <Link
                        to={`/session/${session._id}/summary`}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}

              {recentSessions.length > 5 && (
                <div className="text-center pt-4">
                  <Link
                    to="/sessions/history"
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    View All Sessions ({recentSessions.length})
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboardSession;
