import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { videoSessionService } from '../services/video';

/**
 * Enterprise Layer 3 State Hook for VideoSDK Consultation Sessions.
 * Encapsulates session metadata resolution, participant identity derivation,
 * room identification, and initialization lifecycle.
 *
 * @param {string} bookingId - MongoDB booking ID.
 * @returns {Object} Meeting session state and loader dispatchers.
 */
export const useMeetingSession = (bookingId) => {
  const [sessionData, setSessionData] = useState(null);
  const [userType, setUserType] = useState(null);
  const [participantId, setParticipantId] = useState(null);
  const [participantName, setParticipantName] = useState(null);
  const [meetingId, setMeetingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initializeSession = useCallback(async () => {
    if (!bookingId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await videoSessionService.getSessionDetails(bookingId);
      setSessionData(data);

      const resolvedUserType = data.userType;
      setUserType(resolvedUserType);

      // Unique participant identifier for VideoSDK authorization
      const resolvedParticipantId =
        resolvedUserType === 'client'
          ? `client - ${data.booking.clientId._id}`
          : `counselor - ${data.booking.slotId.counselorId._id}`;
      setParticipantId(resolvedParticipantId);

      // Display name as "fullName_mongoId" to avoid name-based collisions in VideoSDK
      const client = data.booking.clientId;
      const counselor = data.booking.slotId.counselorId;
      const resolvedName =
        resolvedUserType === 'client'
          ? `${client.fullName}_${client._id}`
          : `${counselor.fullName}_${counselor._id}`;
      setParticipantName(resolvedName);

      setMeetingId(data.booking.videoSDKRoomId);
    } catch (err) {
      console.error('Session initialization error:', err);
      const errMsg = err?.message || 'Failed to load session details.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  return {
    sessionData,
    setSessionData,
    userType,
    setUserType,
    participantId,
    setParticipantId,
    participantName,
    setParticipantName,
    meetingId,
    setMeetingId,
    loading,
    error,
    initializeSession,
  };
};

export default useMeetingSession;
