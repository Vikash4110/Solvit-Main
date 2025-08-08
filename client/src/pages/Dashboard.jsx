import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  MessageCircle,
  Phone,
  Video,
  Star,
  Bell,
  Settings,
  BookOpen,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
  MoreVertical,
  Trash2,
  Eye
} from 'lucide-react';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

const ClientDashboard = () => {
  const [clientData, setClientData] = useState({});
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CLIENT_DASHBOARD}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        setClientData(data.client || {});
        setUpcomingSessions(data.upcomingSessions || []);
        setPastSessions(data.pastSessions || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setMessage({ type: 'error', text: 'Failed to load dashboard data' });
    } finally {
      setLoading(false);
    }
  };

  const cancelSession = async (sessionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CLIENT_CANCEL_SESSION}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: "include",
        body: JSON.stringify({ sessionId })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Session cancelled successfully' });
        await fetchDashboardData(); // Refresh data
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to cancel session' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to cancel session' });
    }
  };

  const getSessionStatus = (session) => {
    const now = new Date();
    const sessionDate = new Date(session.date);
    const sessionStartTime = new Date(`${session.date} ${session.startTime}`);
    
    if (session.status === 'cancelled') {
      return { label: 'Cancelled', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle };
    }
    
    if (sessionStartTime < now) {
      return { label: 'Completed', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle };
    }
    
    if (sessionDate.toDateString() === now.toDateString()) {
      return { label: 'Today', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: AlertCircle };
    }
    
    return { label: 'Upcoming', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2024-01-01 ${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getSessionDuration = (startTime, endTime) => {
    const start = new Date(`2024-01-01 ${startTime}`);
    const end = new Date(`2024-01-01 ${endTime}`);
    return Math.round((end - start) / (1000 * 60)); // minutes
  };

  const SessionCard = ({ session, showActions = true }) => {
    const status = getSessionStatus(session);
    const StatusIcon = status.icon;
    const duration = getSessionDuration(session.startTime, session.endTime);

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
              {session.counselor?.profilePicture ? (
                <img 
                  src={session.counselor.profilePicture} 
                  alt={session.counselor.fullName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{session.counselor?.fullName}</h3>
              <p className="text-sm text-blue-600">{session.counselor?.specialization}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
            <StatusIcon className="w-3 h-3 inline mr-1" />
            {status.label}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(session.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{formatTime(session.startTime)} - {formatTime(session.endTime)} ({duration} min)</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">₹{session.price || (duration <= 30 ? 1500 : 3000)}</span>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedSession(session);
                setShowSessionDetails(true);
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Eye className="w-4 h-4 inline mr-2" />
              View Details
            </button>
            
            {session.status !== 'cancelled' && new Date(session.date) > new Date() && (
              <button
                onClick={() => cancelSession(session._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <Trash2 className="w-4 h-4 inline mr-2" />
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome back, {clientData.fullName || 'Client'}!
            </h1>
            <p className="text-gray-600">Manage your counseling sessions and track your progress</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:text-gray-700 relative">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 text-gray-500 hover:text-gray-700">
              <Settings className="w-6 h-6" />
            </button>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{upcomingSessions.length}</p>
              <p className="text-sm text-gray-600">Upcoming Sessions</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{pastSessions.length}</p>
              <p className="text-sm text-gray-600">Completed Sessions</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">8.5</p>
              <p className="text-sm text-gray-600">Progress Score</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">4.8</p>
              <p className="text-sm text-gray-600">Average Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">Book New Session</p>
              <p className="text-sm text-gray-600">Find and book a counselor</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">Chat Support</p>
              <p className="text-sm text-gray-600">Get help instantly</p>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-800">View Resources</p>
              <p className="text-sm text-gray-600">Access helpful materials</p>
            </div>
          </button>
        </div>
      </div>

      {/* Sessions Section */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">My Sessions</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'upcoming'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Upcoming ({upcomingSessions.length})
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'past'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Past ({pastSessions.length})
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'upcoming' ? (
            <div className="space-y-4">
              {upcomingSessions.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">No upcoming sessions</h3>
                  <p className="text-gray-400 mb-4">Book a session to get started with your counseling journey</p>
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Book New Session
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingSessions.map(session => (
                    <SessionCard key={session._id} session={session} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {pastSessions.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500">No past sessions</h3>
                  <p className="text-gray-400">Your completed sessions will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pastSessions.map(session => (
                    <SessionCard key={session._id} session={session} showActions={false} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Session Details Modal */}
      {showSessionDetails && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Session Details</h3>
              <button
                onClick={() => setShowSessionDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                  {selectedSession.counselor?.profilePicture ? (
                    <img 
                      src={selectedSession.counselor.profilePicture} 
                      alt={selectedSession.counselor.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">{selectedSession.counselor?.fullName}</h4>
                  <p className="text-sm text-blue-600">{selectedSession.counselor?.specialization}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formatDate(selectedSession.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">
                    {formatTime(selectedSession.startTime)} - {formatTime(selectedSession.endTime)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {getSessionDuration(selectedSession.startTime, selectedSession.endTime)} minutes
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium text-green-600">
                    ₹{selectedSession.price || (getSessionDuration(selectedSession.startTime, selectedSession.endTime) <= 30 ? 1500 : 3000)}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Video className="w-4 h-4 inline mr-2" />
                  Join Session
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
