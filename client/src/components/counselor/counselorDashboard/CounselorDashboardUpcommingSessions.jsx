import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  Calendar,
  Clock,
  Video,
  User,
  Phone,
  Mail,
  DollarSign,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Timer,
  Sparkles,
  Eye,
  PlayCircle,
  XCircle,
  Loader2,
  CalendarDays,
  Search,
  Filter,
  ChevronRight,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

// shadcn/ui imports
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { TIMEZONE } from '../../../constants/constants';
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

// Configure Day.js plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const scaleIn = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
  transition: { duration: 0.3 },
};

const CounselorDashboardUpcomingSessions = () => {
  // State management
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch sessions
  const fetchSessions = useCallback(async (page = 1, showLoader = true) => {
    if (showLoader) setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.COUNSELOR_SESSIONS_UPCOMING}?page=${page}&perPage=20`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const result = await response.json();
      const data = result.data || result;

      setSessions(data.sessions || []);
      setFilteredSessions(data.sessions || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.totalCount || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err.message || 'Failed to load sessions');
      toast.error('Failed to Load Sessions', {
        description: 'Unable to fetch your upcoming sessions. Please try again.',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSessions(1);
  }, [fetchSessions]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSessions(currentPage, false);
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [currentPage, fetchSessions]);

  // Filter sessions
  useEffect(() => {
    let filtered = [...sessions];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((session) =>
        session.client.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.client.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.client.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((session) => session.timingStatus === statusFilter);
    }

    setFilteredSessions(filtered);
  }, [searchQuery, statusFilter, sessions]);

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchSessions(currentPage);
  };

  // Join session handler
  const handleJoinSession = async (session) => {
    if (!session.canJoin) {
      toast.error('Cannot Join Session', {
        description: 'This session is not available to join yet.',
      });
      return;
    }

    setIsJoining(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.COUNSELOR_SESSION_JOIN}/${session.sessionId}/join`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to join session');
      }

      const result = await response.json();
      const data = result.data || result;

      toast.success('Joining Session', {
        description: 'Redirecting to video call...',
      });

      // Redirect to video call with roomId
      // Replace with your actual video call route
      window.location.href = `/counselor/session/${data.videoSDKRoomId}`;
    } catch (err) {
      console.error('Error joining session:', err);
      toast.error('Failed to Join Session', {
        description: err.message || 'Unable to join the session. Please try again.',
      });
    } finally {
      setIsJoining(false);
    }
  };

  // View session details
  const handleViewDetails = (session) => {
    setSelectedSession(session);
    setIsDetailsDialogOpen(true);
  };

  // Get status badge configuration
  const getStatusBadge = (timingStatus) => {
    const configs = {
      upcoming: {
        label: 'Upcoming',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        icon: Calendar,
      },
      ready_to_join: {
        label: 'Ready to Join',
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        icon: Timer,
      },
      in_progress: {
        label: 'In Progress',
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        icon: PlayCircle,
      },
      ended: {
        label: 'Ended',
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        icon: CheckCircle2,
      },
    };

    return configs[timingStatus] || configs.upcoming;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <motion.div
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6"
      >
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Upcoming Sessions
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              {totalCount} session{totalCount !== 1 ? 's' : ''} scheduled
            </p>
          </div>

          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </motion.div>

        {/* Filters */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                      placeholder="Search by client name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sessions</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="ready_to_join">Ready to Join</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sessions Grid */}
        {filteredSessions.length === 0 ? (
          <motion.div variants={fadeInUp}>
            <Card>
              <CardContent className="py-16">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <CalendarDays className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      No Sessions Found
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                      {searchQuery || statusFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'You have no upcoming sessions scheduled'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredSessions.map((session) => (
                <SessionCard
                  key={session.sessionId}
                  session={session}
                  onJoin={handleJoinSession}
                  onViewDetails={handleViewDetails}
                  isJoining={isJoining}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Session Details Dialog */}
        <SessionDetailsDialog
          session={selectedSession}
          isOpen={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          onJoin={handleJoinSession}
          isJoining={isJoining}
        />
      </motion.div>
    </TooltipProvider>
  );
};

// Session Card Component
const SessionCard = ({ session, onJoin, onViewDetails, isJoining }) => {
  const statusBadge = getStatusBadge(session.timingStatus);
  const StatusIcon = statusBadge.icon;

  return (
    <motion.div
      variants={fadeInUp}
      layout
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-4">
          {/* Client Info */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Avatar className="h-16 w-16 border-2 border-primary-200 dark:border-primary-800">
                <AvatarImage src={session.client.profilePicture} alt={session.client.fullName} />
                <AvatarFallback className="text-lg bg-primary-100 dark:bg-primary-900/30">
                  {session.client.fullName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {session.client.fullName}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                  @{session.client.username}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <Badge className={`${statusBadge.color} gap-1 shrink-0`}>
              <StatusIcon className="h-3 w-3" />
              {statusBadge.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Session Time */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
              <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium">{session.dateFormatted}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
              <Clock className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium">{session.timeRangeFormatted}</span>
            </div>
            
            {/* Time Until Session */}
            {session.minutesUntilStart > 0 && (
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  {session.timeUntilSession}
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
              <Mail className="h-4 w-4" />
              <span className="truncate">{session.client.email}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
              <DollarSign className="h-4 w-4" />
              <span>₹{session.price}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => onJoin(session)}
              disabled={!session.canJoin || isJoining}
              className="flex-1 gap-2"
              size="lg"
            >
              {isJoining ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Video className="h-4 w-4" />
                  {session.canJoin ? 'Join Session' : 'Not Available'}
                </>
              )}
            </Button>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => onViewDetails(session)}
                  variant="outline"
                  size="lg"
                  className="px-4"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View Details</TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Session Details Dialog Component
const SessionDetailsDialog = ({ session, isOpen, onClose, onJoin, isJoining }) => {
  if (!session) return null;

  const statusBadge = getStatusBadge(session.timingStatus);
  const StatusIcon = statusBadge.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary-600" />
            Session Details
          </DialogTitle>
          <DialogDescription>Complete information about this counseling session</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="space-y-6"
          >
            {/* Status */}
            <motion.div variants={scaleIn}>
              <Badge className={`${statusBadge.color} gap-1`}>
                <StatusIcon className="h-3 w-3" />
                {statusBadge.label}
              </Badge>
            </motion.div>

            {/* Client Information */}
            <motion.div variants={fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-primary-600" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-2 border-primary-200 dark:border-primary-800">
                      <AvatarImage
                        src={session.client.profilePicture}
                        alt={session.client.fullName}
                      />
                      <AvatarFallback className="text-2xl bg-primary-100 dark:bg-primary-900/30">
                        {session.client.fullName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        {session.client.fullName}
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        @{session.client.username}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <InfoRow
                      icon={Mail}
                      label="Email"
                      value={session.client.email}
                    />
                    <InfoRow
                      icon={Phone}
                      label="Phone"
                      value={session.client.phone}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Session Timing */}
            <motion.div variants={fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary-600" />
                    Session Timing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <InfoRow
                    icon={Calendar}
                    label="Date"
                    value={session.dateFormatted}
                  />
                  <InfoRow
                    icon={Clock}
                    label="Time"
                    value={session.timeRangeFormatted}
                  />
                  {session.minutesUntilStart > 0 && (
                    <InfoRow
                      icon={Timer}
                      label="Time Until Start"
                      value={session.timeUntilSession}
                      highlight
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Booking Details */}
            <motion.div variants={fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary-600" />
                    Booking Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <InfoRow
                    icon={DollarSign}
                    label="Session Fee"
                    value={`₹${session.price}`}
                  />
                  <InfoRow
                    icon={CheckCircle2}
                    label="Payment Status"
                    value={
                      <Badge
                        variant={
                          session.paymentStatus === 'completed' ? 'outline' : 'secondary'
                        }
                      >
                        {session.paymentStatus}
                      </Badge>
                    }
                  />
                  <InfoRow
                    icon={CalendarDays}
                    label="Booking Status"
                    value={
                      <Badge variant="outline">{session.bookingStatus}</Badge>
                    }
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Join Button */}
            <motion.div variants={fadeInUp}>
              <Button
                onClick={() => onJoin(session)}
                disabled={!session.canJoin || isJoining}
                className="w-full gap-2"
                size="lg"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Joining Session...
                  </>
                ) : session.canJoin ? (
                  <>
                    <Video className="h-4 w-4" />
                    Join Video Session
                    <ArrowRight className="h-4 w-4 ml-auto" />
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Session Not Available to Join
                  </>
                )}
              </Button>

              {!session.canJoin && session.minutesUntilStart > 0 && (
                <p className="text-sm text-center text-neutral-600 dark:text-neutral-400 mt-2">
                  You can join 10 minutes before the session starts
                </p>
              )}
            </motion.div>
          </motion.div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

// Helper component for info rows
const InfoRow = ({ icon: Icon, label, value, highlight = false }) => (
  <div className="flex items-start gap-3">
    <Icon
      className={`h-5 w-5 mt-0.5 ${
        highlight
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-neutral-500 dark:text-neutral-400'
      }`}
    />
    <div className="flex-1 min-w-0">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{label}</p>
      <p
        className={`text-base font-medium ${
          highlight
            ? 'text-amber-700 dark:text-amber-400'
            : 'text-neutral-900 dark:text-neutral-100'
        } break-words`}
      >
        {value}
      </p>
    </div>
  </div>
);

// Helper function for status badge
const getStatusBadge = (timingStatus) => {
  const configs = {
    upcoming: {
      label: 'Upcoming',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      icon: Calendar,
    },
    ready_to_join: {
      label: 'Ready to Join',
      color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      icon: Timer,
    },
    in_progress: {
      label: 'In Progress',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      icon: PlayCircle,
    },
    ended: {
      label: 'Ended',
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      icon: CheckCircle2,
    },
  };

  return configs[timingStatus] || configs.upcoming;
};

export default CounselorDashboardUpcomingSessions;
