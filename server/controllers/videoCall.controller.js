import { wrapper } from '../utils/wrapper.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Session } from '../models/session.model.js';
import { Booking } from '../models/booking-model.js';
import videoSDKService from '../services/videoSDK.service.js';
import { logger } from '../utils/logger.js';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import { timeZone, earlyJoinMinutesForSession } from '../constants.js';

dayjs.extend(utc);
dayjs.extend(timezone);

// Get session(booking) details for video call interface
const getSessionDetails = wrapper(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.verifiedUser?._id;

  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const booking = await Booking.findById(bookingId)
    .populate('clientId', '-password')
    .populate('sessionId')
    .populate({
      path: 'slotId',
      populate: {
        path: 'counselorId',
        select: '-password',
      },
    });

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  // Verify user has access to this session
  const isClient = booking.clientId._id.toString() === userId.toString();
  const isCounselor = booking.slotId.counselorId._id.toString() === userId.toString();

  if (!isClient && !isCounselor) {
    throw new ApiError(403, 'Access denied to this session');
  }

  const sessionDetails = { booking, userType: isClient ? 'client' : 'counselor' };

  return res
    .status(200)
    .json(new ApiResponse(200, sessionDetails, 'Session details retrieved successfully'));
});

// Generate meeting token for joining session
const getTokenForJoiningSession = wrapper(async (req, res) => {
  const { sessionData, participantId } = req.body;

  // Check session timing
  const slotData = sessionData.booking.slotId;
  const sessionStartTime = dayjs(slotData.startTime).tz(timeZone);
  const sessionEndTime = dayjs(slotData.endTime).tz(timeZone);
  const now = dayjs().tz(timeZone);

  if (now.isBefore(sessionStartTime.clone().subtract(earlyJoinMinutesForSession, 'minute'))) {
    throw new ApiError(
      400,
      'Session has not started yet. Please join closer to the scheduled time.'
    );
  }

  if (now.isAfter(sessionEndTime)) {
    throw new ApiError(400, 'Session has already ended');
  }

  // Generate VideoSDK meeting token
  const token = await videoSDKService.generateTokenForJoiningSession(
    sessionData.booking.sessionId.videoSDKroomId,
    participantId
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        token,
      },
      'Meeting token generated successfully'
    )
  );
});

// Track session events in real-time
const trackSessionEvent = wrapper(async (req, res) => {
  const { sessionId } = req.params;
  const { eventType, participantId, metadata = {}, deviceInfo = {}, qualityStats = {} } = req.body;

  if (!eventType || !participantId) {
    throw new ApiError(400, 'Event type and participant ID are required');
  }

  const session = await Session.findById(sessionId);
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  // Add event to session
  const sessionEvent = {
    eventType,
    participantId,
    timestamp: new Date(),
    metadata: {
      ...metadata,
      deviceInfo,
      qualityStats,
    },
  };

  session.sessionEvents.push(sessionEvent);

  // Handle specific event types
  switch (eventType) {
    case 'participant-joined':
      await handleParticipantJoined(session, participantId, deviceInfo);
      break;

    case 'participant-left':
      await handleParticipantLeft(session, participantId, metadata.duration);
      break;

    case 'quality-update':
      await updateParticipantQuality(session, participantId, qualityStats);
      break;

    case 'session-ended':
      await handleSessionEnded(session);
      break;
  }

  await session.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { success: true }, 'Session event tracked successfully'));
});

// Handle participant joining
const handleParticipantJoined = async (session, participantId, deviceInfo) => {
  try {
    // Check if participant already exists
    const existingParticipant = session.participants.find(
      (p) => p.userId.toString() === participantId.replace(/^(client_|counselor_)/, '')
    );

    if (!existingParticipant) {
      // Determine user type and ID
      const isClient = participantId.startsWith('client_');
      const userId = participantId.replace(/^(client_|counselor_)/, '');
      const userType = isClient ? 'Client' : 'Counselor';

      session.participants.push({
        userId,
        userType,
        joinedAt: new Date(),
        deviceInfo: {
          browser: deviceInfo.browser || 'Unknown',
          os: deviceInfo.os || 'Unknown',
          deviceType: deviceInfo.deviceType || 'Unknown',
          userAgent: deviceInfo.userAgent || '',
        },
      });

      // Update session start time if first participant
      if (!session.actualStartTime) {
        session.actualStartTime = new Date();
        session.status = 'active';
      }
    }
  } catch (error) {
    logger.error('Error handling participant joined:', error);
  }
};

// Handle participant leaving
const handleParticipantLeft = async (session, participantId, duration) => {
  try {
    const userId = participantId.replace(/^(client_|counselor_)/, '');
    const participant = session.participants.find((p) => p.userId.toString() === userId);

    if (participant && !participant.leftAt) {
      participant.leftAt = new Date();
      participant.duration = duration || Math.floor((new Date() - participant.joinedAt) / 1000);
    }
  } catch (error) {
    logger.error('Error handling participant left:', error);
  }
};

// Update participant quality metrics
const updateParticipantQuality = async (session, participantId, qualityStats) => {
  try {
    const userId = participantId.replace(/^(client_|counselor_)/, '');
    const participant = session.participants.find((p) => p.userId.toString() === userId);

    if (participant) {
      participant.connectionQuality = {
        avgBitrate: qualityStats.avgBitrate || 0,
        avgLatency: qualityStats.avgLatency || 0,
        packetLoss: qualityStats.packetLoss || 0,
        jitter: qualityStats.jitter || 0,
      };
    }
  } catch (error) {
    logger.error('Error updating participant quality:', error);
  }
};

// Handle session ending
const handleSessionEnded = async (session) => {
  try {
    if (!session.actualEndTime) {
      session.actualEndTime = new Date();
      session.status = 'ended';

      if (session.actualStartTime) {
        session.totalDuration = Math.floor(
          (session.actualEndTime - session.actualStartTime) / 1000
        );
      }

      // Calculate session quality rating
      const qualityRating = calculateSessionQuality(session);
      session.sessionQuality = {
        ...session.sessionQuality,
        overallRating: qualityRating,
      };
    }
  } catch (error) {
    logger.error('Error handling session ended:', error);
  }
};

// Calculate overall session quality
const calculateSessionQuality = (session) => {
  try {
    if (!session.participants.length) return 3;

    const qualityScores = session.participants.map((participant) => {
      const quality = participant.connectionQuality;
      if (!quality) return 3;

      let score = 5;

      // Reduce score based on connection issues
      if (quality.avgLatency > 200) score -= 1;
      if (quality.avgLatency > 400) score -= 1;
      if (quality.packetLoss > 2) score -= 1;
      if (quality.packetLoss > 5) score -= 1;
      if (quality.avgBitrate < 200) score -= 1;

      return Math.max(1, score);
    });

    return Math.round(qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length);
  } catch (error) {
    logger.error('Error calculating session quality:', error);
    return 3;
  }
};

// Get session analytics (post-session)
const getSessionAnalytics = wrapper(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.verifiedUser?._id;

  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const session = await Session.findById(sessionId).populate('bookingId').populate({
    path: 'participants.userId',
    select: 'fullName email',
  });

  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  // Verify user has access
  const booking = session.bookingId;
  const isClient = booking.clientId.toString() === userId.toString();
  const isCounselor =
    booking.slotId &&
    booking.slotId.counselorId &&
    booking.slotId.counselorId.toString() === userId.toString();

  if (!isClient && !isCounselor) {
    throw new ApiError(403, 'Access denied to this session analytics');
  }

  // Compile analytics data
  const analytics = {
    sessionId: session._id,
    meetingId: session.videoSDKMeetingId,
    duration: {
      scheduled: session.scheduledEndTime - session.scheduledStartTime,
      actual: session.totalDuration || 0,
      actualMinutes: Math.round((session.totalDuration || 0) / 60),
    },
    timing: {
      scheduledStart: session.scheduledStartTime,
      scheduledEnd: session.scheduledEndTime,
      actualStart: session.actualStartTime,
      actualEnd: session.actualEndTime,
    },
    participants: session.participants.map((participant) => ({
      name: participant.userId.fullName,
      type: participant.userType,
      joinedAt: participant.joinedAt,
      leftAt: participant.leftAt,
      duration: participant.duration,
      durationMinutes: Math.round((participant.duration || 0) / 60),
      deviceInfo: participant.deviceInfo,
      connectionQuality: participant.connectionQuality,
    })),
    events: session.sessionEvents.map((event) => ({
      type: event.eventType,
      timestamp: event.timestamp,
      participant: event.participantId,
      metadata: event.metadata,
    })),
    quality: {
      overall: session.sessionQuality?.overallRating || 0,
      network: session.sessionQuality?.networkStability || 'unknown',
      audio: session.sessionQuality?.audioQualityRating || 0,
      video: session.sessionQuality?.videoQualityRating || 0,
      issues: session.sessionQuality?.connectionIssues || 0,
    },
    recording: session.recording.isRecorded
      ? {
          available: true,
          url: session.recording.recordingUrl,
          downloadUrl: session.recording.downloadUrl,
          duration: session.recording.recordingDuration,
        }
      : { available: false },
    chat:
      session.chatMessages.length > 0
        ? {
            messageCount: session.chatMessages.length,
            messages: session.chatMessages.map((msg) => ({
              sender: msg.senderType,
              message: msg.message,
              timestamp: msg.timestamp,
              type: msg.messageType,
            })),
          }
        : { messageCount: 0, messages: [] },
  };

  return res
    .status(200)
    .json(new ApiResponse(200, analytics, 'Session analytics retrieved successfully'));
});

// Save post-session feedback
const saveSessionFeedback = wrapper(async (req, res) => {
  const { sessionId } = req.params;
  const { rating, comment, notes, followUpRequired } = req.body;
  const userId = req.verifiedUser?._id;

  if (!userId || !rating) {
    throw new ApiError(400, 'User authentication and rating are required');
  }

  const session = await Session.findById(sessionId).populate('bookingId');
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  // Determine user role
  const booking = session.bookingId;
  const isClient = booking.clientId.toString() === userId.toString();
  const isCounselor =
    booking.slotId &&
    booking.slotId.counselorId &&
    booking.slotId.counselorId.toString() === userId.toString();

  if (!isClient && !isCounselor) {
    throw new ApiError(403, 'Access denied');
  }

  // Save feedback based on user role
  if (isClient) {
    session.postSessionData.clientFeedback = {
      rating,
      comment: comment || '',
      submittedAt: new Date(),
    };
  } else if (isCounselor) {
    session.postSessionData.counselorNotes = notes || '';
    session.postSessionData.followUpRequired = followUpRequired || false;
    if (followUpRequired && req.body.followUpDate) {
      session.postSessionData.followUpScheduled = new Date(req.body.followUpDate);
    }
  }

  await session.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { success: true }, 'Session feedback saved successfully'));
});

// Get session recordings
const getSessionRecordings = wrapper(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.verifiedUser?._id;

  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const session = await Session.findById(sessionId).populate('bookingId');
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  // Verify access
  const booking = session.bookingId;
  const isClient = booking.clientId.toString() === userId.toString();
  const isCounselor =
    booking.slotId &&
    booking.slotId.counselorId &&
    booking.slotId.counselorId.toString() === userId.toString();

  if (!isClient && !isCounselor) {
    throw new ApiError(403, 'Access denied');
  }

  if (!session.recording.isRecorded) {
    return res
      .status(200)
      .json(new ApiResponse(200, { available: false }, 'No recording available for this session'));
  }

  const recordingData = {
    available: true,
    recordingId: session.recording.recordingId,
    url: session.recording.recordingUrl,
    downloadUrl: session.recording.downloadUrl,
    duration: session.recording.recordingDuration,
    sessionDate: session.scheduledStartTime,
    participants: session.participants.map((p) => ({
      name: p.displayName,
      type: p.userType,
    })),
  };

  return res
    .status(200)
    .json(new ApiResponse(200, recordingData, 'Session recording retrieved successfully'));
});

export {
  trackSessionEvent,
  getSessionDetails,
  getSessionAnalytics,
  saveSessionFeedback,
  getSessionRecordings,
  getTokenForJoiningSession,
};
