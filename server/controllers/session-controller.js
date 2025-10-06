// controllers/session-controller.js
import { Booking } from '../models/booking-model.js';
import { AttendanceLog } from '../models/attendence-model.js';
import { wrapper } from '../utils/wrapper.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { stat } from 'fs';

dayjs.extend(utc);
dayjs.extend(timezone);

// Helper function for user detection (ONLY ADDITION)
const getUserFromRequest = (req) => {
  if (req.verifiedClientId) {
    return { userId: req.verifiedClientId._id, role: 'client' };
  }
  if (req.verifiedCounselorId) {
    return { userId: req.verifiedCounselorId._id, role: 'counselor' };
  }
  // Fallback to your existing logic
  return { userId: req.verifiedClientId?._id, role: 'client' };
};

// Generate join token (KEEP YOUR EXISTING LOGIC)
const generateJoinToken = (bookingId, userId, role) => {
  return jwt.sign(
    { bookingId, userId, role, type: 'session_join' },
    process.env.JOIN_TOKEN_SECRET,
    { expiresIn: '2m' } // 2 minutes
  );
};

// Get session details (MINIMAL UPDATES TO YOUR EXISTING CODE)
export const getSessionDetails = wrapper(async (req, res) => {
  const { bookingId } = req.params;

  // ONLY ADDITION: Try to get user info with fallback
  let userId, userRole;
  try {
    const userInfo = getUserFromRequest(req);
    userId = userInfo.userId;
    userRole = userInfo.role;
  } catch {
    userId = req.verifiedClientId._id; // Your original fallback
    userRole = 'client';
  }

  // KEEP ALL YOUR EXISTING CODE BELOW
  const booking = await Booking.findById(bookingId)
    .populate('clientId', 'fullName email profilePicture')
    .populate('counselorId', 'fullName email profilePicture specialization')
    .populate('slotId'); // ✅ Populate slot data

  if (!booking || !booking.slotId) {
    throw new ApiError(404, 'Session or slot not found');
  }

  // Check if user is part of this booking (KEEP YOUR EXISTING LOGIC)
  const originalUserRole = booking.clientId._id.equals(userId)
    ? 'client'
    : booking.counselorId._id.equals(userId)
      ? 'counselor'
      : null;

  // Use your original logic but with fallback
  const finalUserRole = originalUserRole || userRole;

  console.log(finalUserRole);

  if (!finalUserRole) {
    throw new ApiError(403, 'Access denied to this session');
  }

  // ✅ Calculate session window using slot data (KEEP YOUR EXISTING CODE)
  const slot = booking.slotId;
  const slotDate = dayjs(slot.date).tz('Asia/Kolkata');
  const startTimeString = `${slotDate.format('YYYY-MM-DD')} ${slot.startTime}`;
  const sessionDateTime = dayjs.tz(startTimeString, 'YYYY-MM-DD hh:mm A', 'Asia/Kolkata');
  const endDateTime = sessionDateTime.add(45, 'minute');

  const now = new Date();
  const startWithGrace = new Date(sessionDateTime.toDate().getTime() - 10 * 60 * 1000);
  const endWithGrace = new Date(endDateTime.toDate().getTime() + 10 * 60 * 1000);

  const sessionWindow = {
    canJoin: now >= startWithGrace && now <= endWithGrace,
    isActive: booking.status === 'ongoing',
    timeUntilStart: Math.max(0, sessionDateTime.toDate() - now),
    timeUntilEnd: Math.max(0, endDateTime.toDate() - now),
  };

  // ✅ Enhanced response with slot data (KEEP YOUR EXISTING RESPONSE)
  res.json(
    new ApiResponse(
      200,
      {
        booking: {
          ...booking.toObject(),
          startTime: sessionDateTime.toDate(), // ✅ Add computed start time
          endTime: endDateTime.toDate(), // ✅ Add computed end time
          duration: 45, // ✅ Standard duration
          timezone: 'Asia/Kolkata', // ✅ Add timezone
        },
        userRole: finalUserRole, // ONLY CHANGE: use finalUserRole
        sessionWindow,
        attendance: booking.attendance,
      },
      'Session details retrieved'
    )
  );
});

// Log join intent (MINIMAL UPDATES TO YOUR EXISTING CODE)
export const logJoinIntent = wrapper(async (req, res) => {
  const { bookingId } = req.params;
  const { role } = req.query;

  // ONLY ADDITION: Try to get user info with fallback
  let userId;
  try {
    console.log('*********************************');
    const userInfo = getUserFromRequest(req);
    console.log('*********************************');
    userId = userInfo.userId;
  } catch {
    userId = req.verifiedClientId._id; // Your original logic
  }

  // KEEP ALL YOUR EXISTING CODE BELOW
  const booking = await Booking.findById(bookingId).populate('slotId');
  if (!booking) {
    throw new ApiError(404, 'Session not found');
  }

  // Validate role and user
  if (role === 'client' && !booking.clientId.equals(userId)) {
    throw new ApiError(403, 'Invalid client access');
  }
  if (role === 'counselor' && !booking.counselorId.equals(userId)) {
    throw new ApiError(403, 'Invalid counselor access');
  }

  // Check session window
  const now = dayjs().tz('Asia/Kolkata');
  const startTime = dayjs.tz(
    `${now.format('YYYY-MM-DD')} ${booking.slotId.startTime}`,
    'YYYY-MM-DD hh:mm A',
    'Asia/Kolkata'
  );
  const startWithGrace = startTime.subtract(10, 'minute');
  const endWithGrace = startTime.add(10, 'minute');

  if (now.isBefore(startWithGrace) || now.isAfter(endWithGrace)) {
    throw new ApiError(400, 'Session join window has closed');
  }

  // Update booking attendance
  const attendanceField = `attendance.${role}`;
  const updateData = {};
  updateData[`${attendanceField}.joinIntentAt`] = now;

  await Booking.findByIdAndUpdate(bookingId, updateData);

  // Log the event
  await AttendanceLog.create({
    bookingId,
    userId,
    role,
    event: 'join_intent',
    metadata: {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  // Generate join token (ONLY CHANGE: Use JWT_SECRET)
  const token = generateJoinToken(bookingId, userId, role);

  res.json(
    new ApiResponse(
      200,
      {
        redirectUrl: `/sessions/${bookingId}/redirect?role=${role}&token=${token}`,
        token,
        expiresIn: 120, // 2 minutes
      },
      'Join intent logged'
    )
  );
});

// Handle redirect to external meeting (KEEP YOUR EXISTING CODE UNCHANGED)
export const redirectToMeeting = wrapper(async (req, res) => {
  const { bookingId } = req.params;
  const { role, token } = req.query;

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JOIN_TOKEN_SECRET);

    if (decoded.bookingId !== bookingId || decoded.role !== role) {
      throw new ApiError(400, 'Invalid token');
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new ApiError(404, 'Session not found');
    }

    // Update joined timestamp
    const attendanceField = `attendance.${role}`;
    const updateData = {};
    updateData[`${attendanceField}.joinedAt`] = new Date();

    await Booking.findByIdAndUpdate(bookingId, updateData);

    // Log joined event
    await AttendanceLog.create({
      bookingId,
      userId: decoded.userId,
      role,
      event: 'joined',
      metadata: {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        sessionToken: token,
      },
    });

    // Redirect to meeting URL
    if (!booking.meeting.url) {
      throw new ApiError(500, 'Meeting URL not configured');
    }

    res.redirect(303, booking.meeting.url);
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Invalid or expired join token');
    }
    throw error;
  }
});

// Send heartbeat (KEEP YOUR EXISTING CODE UNCHANGED)
export const sendHeartbeat = wrapper(async (req, res) => {
  const { bookingId } = req.params;
  const { role } = req.body;

  // ONLY ADDITION: Try to get user info with fallback
  let userId;
  try {
    const userInfo = getUserFromRequest(req);
    userId = userInfo.userId;
  } catch {
    userId = req.verifiedClientId._id; // Your original logic
  }

  // KEEP ALL YOUR EXISTING CODE BELOW
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, 'Session not found');
  }

  // Validate session window
  const now = new Date();
  const startWithGrace = new Date(booking.startTime.getTime() - 10 * 60 * 1000);
  const endWithGrace = new Date(booking.endTime.getTime() + 10 * 60 * 1000);

  if (now < startWithGrace || now > endWithGrace) {
    throw new ApiError(400, 'Session window closed');
  }

  // Validate role access
  if (role === 'client' && !booking.clientId.equals(userId)) {
    throw new ApiError(403, 'Invalid client access');
  }
  if (role === 'counselor' && !booking.counselorId.equals(userId)) {
    throw new ApiError(403, 'Invalid counselor access');
  }

  // Rate limiting check (max 1 heartbeat per 25 seconds)
  const lastHeartbeat = booking.attendance[role]?.lastHeartbeatAt;
  if (lastHeartbeat && now - lastHeartbeat < 25000) {
    return res.json(
      new ApiResponse(
        200,
        {
          rateLimited: true,
          nextAllowedAt: new Date(lastHeartbeat.getTime() + 25000),
        },
        'Heartbeat rate limited'
      )
    );
  }

  // Update heartbeat
  const attendanceField = `attendance.${role}`;
  const updateData = {};
  updateData[`${attendanceField}.lastHeartbeatAt`] = now;
  updateData[`${attendanceField}.totalHeartbeats`] =
    (booking.attendance[role]?.totalHeartbeats || 0) + 1;

  await Booking.findByIdAndUpdate(bookingId, updateData);

  // Log heartbeat
  await AttendanceLog.create({
    bookingId,
    userId,
    role,
    event: 'heartbeat',
    metadata: {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  res.json(
    new ApiResponse(
      200,
      {
        heartbeatCount: (booking.attendance[role]?.totalHeartbeats || 0) + 1,
        timestamp: now,
      },
      'Heartbeat recorded'
    )
  );
});

// Mark user as left (KEEP YOUR EXISTING CODE UNCHANGED)
export const markLeft = wrapper(async (req, res) => {
  const { bookingId } = req.params;
  const { role } = req.body;

  // ONLY ADDITION: Try to get user info with fallback
  let userId;
  try {
    const userInfo = getUserFromRequest(req);
    userId = userInfo.userId;
  } catch {
    userId = req.verifiedClientId._id; // Your original logic
  }

  // KEEP ALL YOUR EXISTING CODE BELOW
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, 'Session not found');
  }

  // Update left timestamp
  const attendanceField = `attendance.${role}`;
  const updateData = {};
  updateData[`${attendanceField}.leftAt`] = new Date();

  await Booking.findByIdAndUpdate(bookingId, updateData);

  // Log left event
  await AttendanceLog.create({
    bookingId,
    userId,
    role,
    event: 'left',
    metadata: {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    },
  });

  res.json(new ApiResponse(200, null, 'Left session recorded'));
});

// Get attendance summary (KEEP YOUR EXISTING CODE UNCHANGED)
export const getAttendanceSummary = wrapper(async (req, res) => {
  const { bookingId } = req.params;

  // ONLY ADDITION: Try to get user info with fallback
  let userId;
  try {
    const userInfo = getUserFromRequest(req);
    userId = userInfo.userId;
  } catch {
    userId = req.verifiedClientId._id; // Your original logic
  }

  // KEEP ALL YOUR EXISTING CODE BELOW
  const booking = await Booking.findById(bookingId)
    .populate('clientId', 'fullName')
    .populate('counselorId', 'fullName');

  if (!booking) {
    throw new ApiError(404, 'Session not found');
  }

  // Check access
  const hasAccess = booking.clientId._id.equals(userId) || booking.counselorId._id.equals(userId);

  if (!hasAccess) {
    throw new ApiError(403, 'Access denied');
  }

  // Calculate attendance summary
  const summary = {
    session: {
      scheduled: {
        start: booking.startTime,
        end: booking.endTime,
        duration: booking.duration,
      },
      actual: booking.attendance.summary || {},
    },
    client: {
      joinedAt: booking.attendance.client.joinedAt,
      leftAt: booking.attendance.client.leftAt,
      totalHeartbeats: booking.attendance.client.totalHeartbeats,
      estimatedMinutes: booking.attendance.summary?.clientMinutes || 0,
      present: booking.attendance.client.present,
    },
    counselor: {
      joinedAt: booking.attendance.counselor.joinedAt,
      leftAt: booking.attendance.counselor.leftAt,
      totalHeartbeats: booking.attendance.counselor.totalHeartbeats,
      estimatedMinutes: booking.attendance.summary?.counselorMinutes || 0,
      present: booking.attendance.counselor.present,
    },
    status: booking.status,
    canDispute: booking.status === 'completed_pending' && !booking.dispute.isDisputed,
  };

  res.json(new ApiResponse(200, summary, 'Attendance summary retrieved'));
});

// NEW FUNCTION: Get dashboard sessions (ONLY NEW ADDITION)
export const getDashboardSessions = wrapper(async (req, res) => {
  let userId, userRole;
  try {
    const userInfo = getUserFromRequest(req);
    userId = userInfo.userId;
    userRole = userInfo.role;
  } catch {
    // Fallback to client if no proper detection
    userId = req.verifiedClientId?._id;
    userRole = 'client';
  }

  if (!userId) {
    throw new ApiError(401, 'Authentication required');
  }

  const userField = userRole === 'client' ? 'clientId' : 'counselorId';

  // Get upcoming sessions
  const upcomingSessions = await Booking.find({
    [userField]: userId,
    status: { $in: ['confirmed', 'ongoing'] },
  })
    .populate('clientId', 'fullName email profilePicture')
    .populate('counselorId', 'fullName email profilePicture specialization')
    .populate('slotId')
    .sort({ createdAt: 1 });

  // Get past sessions
  const pastSessions = await Booking.find({
    [userField]: userId,
    status: { $in: ['completed_pending', 'completed_final', 'disputed', 'no_show', 'cancelled'] },
  })
    .populate('clientId', 'fullName email profilePicture')
    .populate('counselorId', 'fullName email profilePicture specialization')
    .populate('slotId')
    .sort({ createdAt: -1 })
    .limit(20);

  res.json(
    new ApiResponse(
      200,
      {
        upcoming: upcomingSessions,
        past: pastSessions,
        userRole: userRole,
      },
      'Dashboard sessions retrieved'
    )
  );
});
