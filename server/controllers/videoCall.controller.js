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

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Derive the concrete session window from a populated booking.
 *
 * The slot's startTime / endTime fields are already full ISO date strings
 * stored in UTC by the slot-generation logic (GeneratedSlot model).
 * We therefore parse them directly as UTC and convert to IST for display only.
 *
 * Returns { sessionStart, sessionEnd } as dayjs objects (UTC).
 */
const getSessionWindow = (booking) => {
  const slot = booking.slotId;

  if (!slot) {
    throw new ApiError(500, 'Booking slot data is missing');
  }

  // slotId.startTime and slotId.endTime are stored as UTC Date objects
  const sessionStart = dayjs.utc(slot.startTime);
  const sessionEnd = dayjs.utc(slot.endTime);

  if (!sessionStart.isValid() || !sessionEnd.isValid()) {
    throw new ApiError(500, 'Invalid slot timing data');
  }

  return { sessionStart, sessionEnd };
};

// ─── Get session details for video call interface ────────────────────────────

const getSessionDetails = wrapper(async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.verifiedUser?._id;

  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const booking = await Booking.findById(bookingId)
    .populate('clientId', '-password')
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

// ─── Generate meeting token ──────────────────────────────────────────────────

/**
 * FIX 1 — Session timing enforcement (server-side)
 * FIX 2 — Duplicate-join prevention via activeParticipants map in the Booking
 *
 * Flow:
 *  1. Fetch the booking + slot (to get real start/end times).
 *  2. Verify the caller is a legitimate participant.
 *  3. Enforce the join window: [start − earlyJoinMinutes, end].
 *  4. Check if this user's role already has an active token issued.
 *     If yes → reject with a clear message so they close the old tab first.
 *  5. Stamp the activeParticipants map and return the token.
 */
const getTokenForJoiningSession = wrapper(async (req, res) => {
  const { sessionData, participantId } = req.body;

  if (!sessionData?.booking?._id || !participantId) {
    throw new ApiError(400, 'sessionData.booking._id and participantId are required');
  }

  const bookingId = sessionData.booking._id;

  // ── 1. Fetch booking with slot ─────────────────────────────────────────────
  const booking = await Booking.findById(bookingId)
    .populate('clientId', 'fullName')
    .populate({ path: 'slotId', populate: { path: 'counselorId', select: 'fullName' } });

  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.status === 'cancelled') throw new ApiError(400, 'This session has been cancelled');

  // ── 2. Derive role from participantId prefix ───────────────────────────────
  // Frontend sets: "client - <mongoId>"  or  "counselor - <mongoId>"
  const isClient = participantId.startsWith('client - ');
  const isCounselor = participantId.startsWith('counselor - ');

  if (!isClient && !isCounselor) {
    throw new ApiError(400, 'participantId must start with "client - " or "counselor - "');
  }

  const role = isClient ? 'client' : 'counselor';
  const rawUserId = participantId.replace(/^(client - |counselor - )/, '');

  // ── DEBUG: log every value so we can see exactly what is being compared ──
  console.log('[DEBUG getToken] participantId from body :', participantId);
  console.log('[DEBUG getToken] role detected           :', role);
  console.log('[DEBUG getToken] rawUserId extracted     :', rawUserId);
  console.log('[DEBUG getToken] booking.clientId        :', JSON.stringify(booking.clientId));
  console.log('[DEBUG getToken] booking.slotId          :', JSON.stringify(booking.slotId));
  console.log('[DEBUG getToken] clientId._id.toString() :', booking.clientId?._id?.toString());
  console.log('[DEBUG getToken] counselorId._id.toString():', booking.slotId?.counselorId?._id?.toString());

  // Verify the caller owns this booking slot
  const clientMatch    = booking.clientId?._id?.toString()              === rawUserId;
  const counselorMatch = booking.slotId?.counselorId?._id?.toString()   === rawUserId;

  console.log('[DEBUG getToken] clientMatch  :', clientMatch, '| counselorMatch:', counselorMatch);

  if (role === 'client' && !clientMatch)
    throw new ApiError(403, 'You are not the client for this booking');
  if (role === 'counselor' && !counselorMatch)
    throw new ApiError(403, 'You are not the counselor for this booking');

  // Build the unique name used inside VideoSDK: "fullName_mongoId"
  // This MUST match exactly what the frontend sets as `name` in MeetingProvider config.
  // Frontend sets: `${fullName}_${_id}` — so we reconstruct it the same way here.
  const participantName =
    role === 'client'
      ? `${booking.clientId.fullName}_${booking.clientId._id}`
      : `${booking.slotId.counselorId.fullName}_${booking.slotId.counselorId._id}`;

  // ── 3. Enforce session timing ──────────────────────────────────────────────
  const { sessionStart, sessionEnd } = getSessionWindow(booking);
  const now = dayjs().utc();
  const joinOpenAt = sessionStart.subtract(earlyJoinMinutesForSession, 'minute');

  if (now.isBefore(joinOpenAt)) {
    const minutesUntilOpen = joinOpenAt.diff(now, 'minute');
    throw new ApiError(
      400,
      `Session has not started yet. You can join ${minutesUntilOpen} minute(s) before the scheduled time (${sessionStart.tz(timeZone).format('h:mm A z')}).`
    );
  }

  if (now.isAfter(sessionEnd)) {
    throw new ApiError(
      400,
      `Session time has ended (scheduled until ${sessionEnd.tz(timeZone).format('h:mm A z')}). You can no longer join this session.`
    );
  }

  // ── 4. Check VideoSDK — is this person LIVE in the room right now? ──────────
  //
  //  We compare by NAME ("fullName_mongoId") because VideoSDK's sessions API
  //  does NOT surface our custom participantId from the JWT — it uses its own
  //  internal id in that field. The `name` field is exactly what we pass in
  //  MeetingProvider config and is reliably present + unique (fullName_mongoId).
  //
  //  If YES  → same person already in another tab/device → block
  //  If NO   → allow (first join, clean leave, or crash-reconnect)
  //  API down → fail open so users aren't locked out during VideoSDK outages
  //
  if (!booking.videoSDKRoomId) {
    throw new ApiError(500, 'Video room has not been created for this booking');
  }

  const isLiveInRoom = await videoSDKService.isParticipantLiveInRoom(
    booking.videoSDKRoomId,
    participantName  // "fullName_mongoId" — matches what MeetingProvider sends to VideoSDK
  );

  if (isLiveInRoom) {
    logger.warn(
      `[Join Blocked] already live | role=${role} name=${participantName} roomId=${booking.videoSDKRoomId}`
    );
    throw new ApiError(
      409,
      'You are already in this session from another tab or device. Please close that session first, then try again.'
    );
  }

  // ── 5. Issue token ─────────────────────────────────────────────────────────
  //
  //  We pass our deterministic participantId in the JWT payload.
  //  VideoSDK uses this as the participant's identity in the session —
  //  so a counselor who closes their window and rejoins comes back as the
  //  SAME participant in VideoSDK's records (same timelog entry gets a new
  //  timelog row appended, not a new participant record). Analytics stay clean.
  //
  const token = videoSDKService.generateTokenForJoiningSession(
    booking.videoSDKRoomId,
    participantId // "client - <id>" or "counselor - <id>" — same every time for same user
  );

  // Lightweight DB stamp — not used as a gate, just for audit/debugging
  await Booking.findByIdAndUpdate(bookingId, {
    $set: {
      [`activeParticipants.${role}`]: {
        participantId,
        participantName,
        issuedAt: new Date(),
      },
    },
  });

  logger.info(
    `Session token issued | role=${role} name=${participantName} participantId=${participantId} bookingId=${bookingId} roomId=${booking.videoSDKRoomId}`
  );

  return res
    .status(200)
    .json(new ApiResponse(200, { token }, 'Meeting token generated successfully'));
});

// ─── Track session events ────────────────────────────────────────────────────

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

  const sessionEvent = {
    eventType,
    participantId,
    timestamp: new Date(),
    metadata: { ...metadata, deviceInfo, qualityStats },
  };

  session.sessionEvents.push(sessionEvent);

  switch (eventType) {
    case 'participant-joined':
      await handleParticipantJoined(session, participantId, deviceInfo);
      break;
    case 'participant-left':
      await handleParticipantLeft(session, participantId, metadata.duration);
      // Clear active participant entry so they can re-join from a fresh tab if needed
      await clearActiveParticipant(session.bookingId, participantId);
      break;
    case 'quality-update':
      await updateParticipantQuality(session, participantId, qualityStats);
      break;
    case 'session-ended':
      await handleSessionEnded(session);
      // Clear ALL active participants when session ends
      await clearAllActiveParticipants(session.bookingId);
      break;
  }

  await session.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { success: true }, 'Session event tracked successfully'));
});

// ─── Participant lifecycle helpers ───────────────────────────────────────────

/**
 * Clear the activeParticipants entry for a role when they leave.
 * participantId format: "client_<id>" or "counselor_<id>"
 */
const clearActiveParticipant = async (bookingId, participantId) => {
  if (!bookingId || !participantId) return;

  const role = participantId.startsWith('client - ')
    ? 'client'
    : participantId.startsWith('counselor - ')
      ? 'counselor'
      : null;

  if (!role) return;

  try {
    await Booking.findByIdAndUpdate(bookingId, {
      $unset: { [`activeParticipants.${role}`]: '' },
    });
    logger.info(`Cleared activeParticipant | role=${role} bookingId=${bookingId}`);
  } catch (err) {
    logger.error(`Failed to clear activeParticipant: ${err.message}`);
  }
};

/**
 * Clear all active participants when the session ends (e.g. VideoSDK webhook).
 */
const clearAllActiveParticipants = async (bookingId) => {
  if (!bookingId) return;
  try {
    await Booking.findByIdAndUpdate(bookingId, {
      $set: { activeParticipants: {} },
    });
    logger.info(`Cleared all activeParticipants | bookingId=${bookingId}`);
  } catch (err) {
    logger.error(`Failed to clear all activeParticipants: ${err.message}`);
  }
};

const handleParticipantJoined = async (session, participantId, deviceInfo) => {
  try {
    const existingParticipant = session.participants.find(
      (p) => p.userId.toString() === participantId.replace(/^(client - |counselor - )/, '')
    );

    if (!existingParticipant) {
      const isClient = participantId.startsWith('client - ');
      const userId = participantId.replace(/^(client - |counselor - )/, '');
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

      if (!session.actualStartTime) {
        session.actualStartTime = new Date();
        session.status = 'active';
      }
    }
  } catch (error) {
    logger.error('Error handling participant joined:', error);
  }
};

const handleParticipantLeft = async (session, participantId, duration) => {
  try {
    const userId = participantId.replace(/^(client - |counselor - )/, '');
    const participant = session.participants.find((p) => p.userId.toString() === userId);

    if (participant && !participant.leftAt) {
      participant.leftAt = new Date();
      participant.duration = duration || Math.floor((new Date() - participant.joinedAt) / 1000);
    }
  } catch (error) {
    logger.error('Error handling participant left:', error);
  }
};

const updateParticipantQuality = async (session, participantId, qualityStats) => {
  try {
    const userId = participantId.replace(/^(client - |counselor - )/, '');
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

const calculateSessionQuality = (session) => {
  try {
    if (!session.participants.length) return 3;

    const qualityScores = session.participants.map((participant) => {
      const quality = participant.connectionQuality;
      if (!quality) return 3;

      let score = 5;
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

// ─── Analytics / feedback / recordings (unchanged) ──────────────────────────

const getSessionAnalytics = wrapper(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.verifiedUser?._id;

  if (!userId) throw new ApiError(401, 'Authentication required');

  const session = await Session.findById(sessionId).populate('bookingId').populate({
    path: 'participants.userId',
    select: 'fullName email',
  });

  if (!session) throw new ApiError(404, 'Session not found');

  const booking = session.bookingId;
  const isClient = booking.clientId.toString() === userId.toString();
  const isCounselor =
    booking.slotId &&
    booking.slotId.counselorId &&
    booking.slotId.counselorId.toString() === userId.toString();

  if (!isClient && !isCounselor) throw new ApiError(403, 'Access denied to this session analytics');

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

const saveSessionFeedback = wrapper(async (req, res) => {
  const { sessionId } = req.params;
  const { rating, comment, notes, followUpRequired } = req.body;
  const userId = req.verifiedUser?._id;

  if (!userId || !rating) throw new ApiError(400, 'User authentication and rating are required');

  const session = await Session.findById(sessionId).populate('bookingId');
  if (!session) throw new ApiError(404, 'Session not found');

  const booking = session.bookingId;
  const isClient = booking.clientId.toString() === userId.toString();
  const isCounselor =
    booking.slotId &&
    booking.slotId.counselorId &&
    booking.slotId.counselorId.toString() === userId.toString();

  if (!isClient && !isCounselor) throw new ApiError(403, 'Access denied');

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

const getSessionRecordings = wrapper(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.verifiedUser?._id;

  if (!userId) throw new ApiError(401, 'Authentication required');

  const session = await Session.findById(sessionId).populate('bookingId');
  if (!session) throw new ApiError(404, 'Session not found');

  const booking = session.bookingId;
  const isClient = booking.clientId.toString() === userId.toString();
  const isCounselor =
    booking.slotId &&
    booking.slotId.counselorId &&
    booking.slotId.counselorId.toString() === userId.toString();

  if (!isClient && !isCounselor) throw new ApiError(403, 'Access denied');

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