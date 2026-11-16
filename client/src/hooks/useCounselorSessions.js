import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
import { slotManagementService } from '../services/booking';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export const EARLY_JOIN_MINUTES = 10;

/**
 * Pure helper - checks whether counselor is within valid session join window.
 * @param {Object} booking - Booking entity.
 * @returns {boolean} Whether join window is open.
 */
export const computeCanJoin = (booking) => {
  if (!booking?.videoSDKRoomId || !booking?.startTime || !booking?.endTime) return false;
  if (booking.status !== 'confirmed') return false;

  const now = dayjs().utc();
  const start = dayjs.utc(booking.startTime);
  const end = dayjs.utc(booking.endTime);

  if (!start.isValid() || !end.isValid()) return false;

  return now.isSameOrAfter(start.subtract(EARLY_JOIN_MINUTES, 'minute')) && now.isBefore(end);
};

export const COUNSELOR_SESSION_TABS = [
  { key: 'upcoming', filterKey: 'upcoming' },
  { key: 'raiseIssue', filterKey: 'raiseIssue' },
  { key: 'issuesRaised', filterKey: 'issuesRaised' },
  { key: 'completed', filterKey: 'completed' },
];

/**
 * Enterprise Layer 3 State Hook for Counselor Sessions Dashboard.
 * Encapsulates session history, upcoming appointment polling, join eligibility timers,
 * clinical notes modal dispatch, and video consultation routing.
 *
 * @param {Object} [options] - Configuration options.
 * @param {string} [options.initialTab='upcoming'] - Default selected tab key.
 * @returns {Object} Counselor session state and workflow dispatchers.
 */
export const useCounselorSessions = ({ initialTab = 'upcoming' } = {}) => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });

  const [guidelinesState, setGuidelinesState] = useState({ show: false, booking: null });
  const [notesModal, setNotesModal] = useState({ show: false, booking: null });
  const [detailsModal, setDetailsModal] = useState({ show: false, booking: null });

  const timerRef = useRef(null);

  // Fetch counselor bookings for current tab filter
  const fetchSessions = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);

        const currentTabConfig =
          COUNSELOR_SESSION_TABS.find((t) => t.key === activeTab) || COUNSELOR_SESSION_TABS[0];

        const data = await slotManagementService.getCounselorBookings({
          filter: currentTabConfig.filterKey,
          page: page.toString(),
          perPage: '10',
        });

        if (!data || typeof data !== 'object') {
          toast.error('Unexpected response from server');
          return;
        }

        if (data.success && data.data && Array.isArray(data.data.bookings)) {
          const enriched = data.data.bookings.map((b) => ({
            ...b,
            canJoin: computeCanJoin(b),
          }));
          setBookings(enriched);
          setPagination(
            data.data.pagination || {
              currentPage: page,
              totalPages: 1,
              totalCount: enriched.length,
            }
          );
        } else {
          toast.error(data.message || 'Failed to load sessions');
        }
      } catch (error) {
        console.error('Error fetching counselor sessions:', error);
        toast.error('Network error while loading sessions');
      } finally {
        setLoading(false);
      }
    },
    [activeTab]
  );

  useEffect(() => {
    fetchSessions(1);
  }, [fetchSessions]);

  // Live timer: recompute canJoin every 30s for the 'upcoming' tab
  useEffect(() => {
    if (activeTab !== 'upcoming') return;

    timerRef.current = setInterval(() => {
      setBookings((prev) => prev.map((b) => ({ ...b, canJoin: computeCanJoin(b) })));
    }, 30_000);

    return () => clearInterval(timerRef.current);
  }, [activeTab]);

  // Join session handler - validates window and triggers guidelines
  const handleJoinSession = useCallback((booking) => {
    if (!booking?.bookingId) {
      toast.error('Invalid session data');
      return;
    }
    if (!computeCanJoin(booking)) {
      toast.error('The join window for this session is not open.');
      return;
    }
    setGuidelinesState({ show: true, booking });
  }, []);

  // Navigate to WebRTC video meeting room
  const handleProceedToSession = useCallback(
    (bookingId, videoSDKRoomId) => {
      setGuidelinesState({ show: false, booking: null });
      navigate(`/meeting/${bookingId}/${videoSDKRoomId}`);
    },
    [navigate]
  );

  return {
    activeTab,
    setActiveTab,
    bookings,
    setBookings,
    loading,
    pagination,
    guidelinesState,
    setGuidelinesState,
    notesModal,
    setNotesModal,
    detailsModal,
    setDetailsModal,
    fetchSessions,
    handleJoinSession,
    handleProceedToSession,
    computeCanJoin,
  };
};

export default useCounselorSessions;
