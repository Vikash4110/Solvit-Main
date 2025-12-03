// counselor-dashboard-controller.js

import mongoose from 'mongoose';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { Counselor } from '../models/counselor-model.js';
import { Session } from '../models/session.model.js';
import { GeneratedSlot } from '../models/generatedSlots-model.js';
import { uploadOncloudinary } from '../utils/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { logger } from '../utils/logger.js';
import { wrapper } from '../utils/wrapper.js';
import fs from 'fs';
import { timeZone, earlyJoinMinutesForSession } from '../constants.js';

dayjs.extend(utc);
dayjs.extend(timezone);

// ***************************************** Personal Information (Profile) ***************************************

/**
 * @desc Get counselor profile
 * @route GET /api/v1/counselor/profile
 * @access Private (Counselor only)
 */
export const getCounselorProfile = wrapper(async (req, res) => {
  const counselorId = req.verifiedCounselorId._id;
  logger.info(`Fetching profile for counselor: ${counselorId}`);

  // Find counselor and exclude sensitive fields
  const counselor = await Counselor.findById(counselorId)
    .select('-password -refreshToken -__v')
    .lean();

  if (!counselor) {
    throw new ApiError(404, 'Counselor profile not found');
  }

  logger.info(`Profile retrieved successfully for counselor: ${counselorId}`);
  return res
    .status(200)
    .json(new ApiResponse(200, counselor, 'Counselor profile retrieved successfully'));
});

/**
 * @desc Update counselor profile
 * @route PUT /api/v1/counselor/profile
 * @access Private (Counselor only)
 */
export const updateCounselorProfile = wrapper(async (req, res) => {
  const counselorId = req.verifiedCounselorId._id;
  logger.info(`Updating profile for counselor: ${counselorId}`);

  // Destructure allowed fields for update
  const {
    username,
    phone,
    gender,
    specialization,
    experienceYears,
    languages,
    professionalSummary,
  } = req.body;

  // Validate required fields

  if (!phone?.trim()) {
    throw new ApiError(400, 'Phone number is required');
  }

  // Check if username is being changed and if it's already taken
  if (username && username.trim()) {
    const existingCounselor = await Counselor.findOne({
      username: username.trim(),
      _id: { $ne: counselorId },
    });

    if (existingCounselor) {
      throw new ApiError(409, 'Username is already taken');
    }
  }

  // Check if phone is being changed and if it's already taken
  const existingPhoneCounselor = await Counselor.findOne({
    phone: phone.trim(),
    _id: { $ne: counselorId },
  });

  if (existingPhoneCounselor) {
    throw new ApiError(409, 'Phone number is already registered');
  }

  // Prepare update object with nested field handling
  const updateData = {};

  // Basic fields
  if (username?.trim()) updateData.username = username.trim();

  if (phone?.trim()) updateData.phone = phone.trim();
  if (gender) updateData.gender = gender;
  if (specialization) updateData.specialization = specialization;
  if (experienceYears !== undefined) updateData.experienceYears = parseInt(experienceYears);

  // Application nested fields
  if (languages || professionalSummary) {
    // Application nested fields
    if (professionalSummary !== undefined) {
      updateData['application.professionalSummary'] = professionalSummary;
    }

    if (Array.isArray(languages)) {
      updateData['application.languages'] = languages;
    }
  }
  console.log(updateData);

  // Update counselor profile
  const counselor = await Counselor.findById(counselorId).select('-password -refreshToken -__v');
  console.log(counselor);
  if (!counselor) {
    throw new ApiError(404, 'Counselor not found');
  }

  counselor.username = updateData.username;
  Counselor.gender = updateData.gender;
  counselor.phone = updateData.phone;
  counselor.specialization = updateData.specialization;
  counselor.experienceYears = updateData.experienceYears;
  counselor.application.professionalSummary = updateData['application.professionalSummary'];
  counselor.application.languages = updateData['application.languages'];
  await counselor.save();
  logger.info(`Profile updated successfully for counselor: ${counselorId}`);
  return res.status(200).json(new ApiResponse(200, counselor, 'Profile updated successfully'));
});

/**
 * @desc Update counselor profile picture
 * @route PUT /api/v1/counselor/profile-picture
 * @access Private (Counselor only)
 */
export const updateCounselorProfilePicture = wrapper(async (req, res) => {
  const counselorId = req.verifiedCounselorId._id;
  logger.info(`Updating profile picture for counselor: ${counselorId}`);

  // Check if file is uploaded
  if (!req.file) {
    throw new ApiError(400, 'Profile picture file is required');
  }

  const localFilePath = req.file.path;

  // Validate file size (max 5MB)
  if (req.file.size > 5 * 1024 * 1024) {
    // Clean up uploaded file
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw new ApiError(400, 'File size must be less than 5MB');
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    // Clean up uploaded file
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw new ApiError(400, 'Only JPEG, JPG, PNG, and WEBP formats are allowed');
  }

  // Get current counselor
  const counselor = await Counselor.findById(counselorId);
  if (!counselor) {
    // Clean up uploaded file
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw new ApiError(404, 'Counselor not found');
  }

  // Delete old profile picture from Cloudinary (if exists)
  if (counselor.profilePicture) {
    try {
      // Extract public_id from Cloudinary URL
      const urlParts = counselor.profilePicture.split('/');
      const publicIdWithExt = urlParts[urlParts.length - 1];
      const publicId = publicIdWithExt.split('.')[0];
      logger.info(`Old profile picture exists: ${publicId}`);
      // Note: Implement deleteFromCloudinary if available
    } catch (error) {
      logger.error(`Error processing old profile picture: ${error.message}`);
      // Continue even if deletion fails
    }
  }

  // Upload new profile picture to Cloudinary
  let uploadResult;
  try {
    uploadResult = await uploadOncloudinary(localFilePath);
    if (!uploadResult || !uploadResult.secure_url) {
      throw new ApiError(500, 'Failed to upload profile picture to cloud storage');
    }
  } catch (error) {
    logger.error(`Cloudinary upload failed: ${error.message}`);
    throw new ApiError(500, 'Failed to upload profile picture');
  }

  // Update counselor profile picture URL
  const updatedCounselor = await Counselor.findByIdAndUpdate(
    counselorId,
    { profilePicture: uploadResult.secure_url },
    { new: true }
  ).select('-password -refreshToken -__v');

  logger.info(`Profile picture updated successfully for counselor: ${counselorId}`);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { profilePicture: updatedCounselor.profilePicture },
        'Profile picture updated successfully'
      )
    );
});

/**
 * @desc Delete counselor profile picture
 * @route DELETE /api/v1/counselor/profile-picture
 * @access Private (Counselor only)
 */
export const deleteCounselorProfilePicture = wrapper(async (req, res) => {
  const counselorId = req.verifiedCounselorId._id;
  logger.info(`Deleting profile picture for counselor: ${counselorId}`);

  const counselor = await Counselor.findById(counselorId);
  if (!counselor) {
    throw new ApiError(404, 'Counselor not found');
  }

  if (!counselor.profilePicture) {
    throw new ApiError(400, 'No profile picture to delete');
  }

  // Delete from Cloudinary (if delete function exists)
  try {
    const urlParts = counselor.profilePicture.split('/');
    const publicIdWithExt = urlParts[urlParts.length - 1];
    const publicId = publicIdWithExt.split('.')[0];
    logger.info(`Profile picture deletion from Cloudinary: ${publicId}`);
    // Implement deleteFromCloudinary function in cloudinary.js
  } catch (error) {
    logger.error(`Error deleting profile picture from Cloudinary: ${error.message}`);
  }

  // Remove profile picture URL from database
  counselor.profilePicture = undefined;
  await counselor.save();

  logger.info(`Profile picture deleted successfully for counselor: ${counselorId}`);
  return res.status(200).json(new ApiResponse(200, null, 'Profile picture deleted successfully'));
});

/**
 * @desc Get counselor dashboard stats
 * @route GET /api/v1/counselor/stats
 * @access Private (Counselor only)
 */
export const getCounselorStats = wrapper(async (req, res) => {
  const counselorId = req.verifiedCounselorId._id;
  logger.info(`Fetching stats for counselor: ${counselorId}`);

  const counselor = await Counselor.findById(counselorId).select('createdAt lastLogin').lean();

  if (!counselor) {
    throw new ApiError(404, 'Counselor not found');
  }

  // TODO: Expand with actual booking/session data
  const stats = {
    totalSessions: 0, // TODO: Calculate from bookings
    upcomingSessions: 0, // TODO: Calculate from bookings
    completedSessions: 0, // TODO: Calculate from bookings
    totalEarnings: 0, // TODO: Calculate from payments
    memberSince: counselor.createdAt,
    lastLogin: counselor.lastLogin || counselor.createdAt,
  };

  logger.info(`Stats retrieved successfully for counselor: ${counselorId}`);
  return res
    .status(200)
    .json(new ApiResponse(200, stats, 'Counselor stats retrieved successfully'));
});

/**
 * @desc Validate counselor profile completeness
 * @route GET /api/v1/counselor/profile/completeness
 * @access Private (Counselor only)
 */
export const validateCounselorProfileCompleteness = wrapper(async (req, res) => {
  const counselorId = req.verifiedCounselorId._id;
  logger.info(`Validating profile completeness for counselor: ${counselorId}`);

  const counselor = await Counselor.findById(counselorId)
    .select('-password -refreshToken -__v')
    .lean();

  if (!counselor) {
    throw new ApiError(404, 'Counselor not found');
  }

  // Check profile completeness
  const completeness = {
    hasBasicInfo: !!(counselor.fullName && counselor.email && counselor.phone && counselor.gender),
    hasProfilePicture: !!counselor.profilePicture,
    hasProfessionalInfo: !!(
      counselor.specialization &&
      counselor.experienceYears !== undefined &&
      counselor.experienceLevel
    ),
    hasProfessionalSummary: !!counselor.application?.professionalSummary,
    hasLanguages: !!(counselor.application?.languages?.length > 0),
    hasEducation: !!(
      counselor.application?.education?.graduation?.university &&
      counselor.application?.education?.graduation?.degree &&
      counselor.application?.education?.graduation?.year
    ),
    hasLicense: !!(
      counselor.application?.license?.licenseNo && counselor.application?.license?.issuingAuthority
    ),
    hasBankDetails: !!(
      counselor.application?.bankDetails?.accountNo &&
      counselor.application?.bankDetails?.ifscCode &&
      counselor.application?.bankDetails?.branchName
    ),
  };

  const totalFields = Object.keys(completeness).length;
  const completedFields = Object.values(completeness).filter(Boolean).length;
  const completionPercentage = Math.round((completedFields / totalFields) * 100);

  const result = {
    isComplete: completionPercentage === 100,
    completionPercentage,
    missingFields: Object.entries(completeness)
      .filter(([_, value]) => !value)
      .map(([key]) => key),
    details: completeness,
  };

  logger.info(`Profile completeness validated for counselor: ${counselorId}`);
  return res.status(200).json(new ApiResponse(200, result, 'Profile validation completed'));
});

/**
 * @desc Submit counselor application
 * @route POST /api/v1/counselor/application/submit
 * @access Private (Counselor only)
 */
export const submitCounselorApplication = wrapper(async (req, res) => {
  const counselorId = req.verifiedCounselorId._id;
  logger.info(`Submitting application for counselor: ${counselorId}`);

  const counselor = await Counselor.findById(counselorId);
  if (!counselor) {
    throw new ApiError(404, 'Counselor not found');
  }

  // Check if already submitted
  if (
    counselor.application?.applicationStatus !== 'not_submitted' &&
    counselor.application?.applicationStatus !== 'rejected'
  ) {
    throw new ApiError(400, 'Application has already been submitted');
  }

  // Validate profile completeness before submission
  const validation = await validateCounselorProfileCompleteness(req, res);
  if (!validation.data.isComplete) {
    throw new ApiError(400, 'Please complete all required fields before submitting application');
  }

  // Update application status
  counselor.application.applicationStatus = 'pending';
  counselor.application.applicationSubmittedAt = new Date();
  await counselor.save();

  logger.info(`Application submitted successfully for counselor: ${counselorId}`);
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        applicationStatus: counselor.application.applicationStatus,
        submittedAt: counselor.application.applicationSubmittedAt,
      },
      'Application submitted successfully. You will be notified once reviewed.'
    )
  );
});

/**
 * @desc Get application status
 * @route GET /api/v1/counselor/application/status
 * @access Private (Counselor only)
 */
export const getCounselorApplicationStatus = wrapper(async (req, res) => {
  const counselorId = req.verifiedCounselorId._id;
  logger.info(`Fetching application status for counselor: ${counselorId}`);

  const counselor = await Counselor.findById(counselorId)
    .select('application.applicationStatus application.applicationSubmittedAt')
    .lean();

  if (!counselor) {
    throw new ApiError(404, 'Counselor not found');
  }

  const statusInfo = {
    status: counselor.application?.applicationStatus || 'not_submitted',
    submittedAt: counselor.application?.applicationSubmittedAt || null,
  };

  logger.info(`Application status retrieved for counselor: ${counselorId}`);
  return res
    .status(200)
    .json(new ApiResponse(200, statusInfo, 'Application status retrieved successfully'));
});

/**
 * @desc Get counselor upcoming sessions with join capability
 * @route GET /api/v1/counselor/sessions/upcoming
 * @access Private (Counselor only)
 */
export const getCounselorUpcomingSessions = wrapper(async (req, res) => {
  const counselorId = req.verifiedCounselorId._id;
  const { page = 1, perPage = 20 } = req.query;

  logger.info(`Fetching upcoming sessions for counselor: ${counselorId}`);

  const skip = (parseInt(page) - 1) * parseInt(perPage);
  const now = dayjs().utc();

  // Aggregation pipeline to get upcoming sessions
  const pipeline = [
    // Step 1: Find booked slots for this counselor
    {
      $match: {
        counselorId: new mongoose.Types.ObjectId(counselorId),
        status: 'booked',
      },
    },
    // Step 2: Lookup booking details
    {
      $lookup: {
        from: 'bookings',
        localField: 'bookingId',
        foreignField: '_id',
        as: 'bookingData',
      },
    },
    {
      $unwind: '$bookingData',
    },
    // Step 3: Lookup session details
    {
      $lookup: {
        from: 'sessions',
        localField: 'bookingData.sessionId',
        foreignField: '_id',
        as: 'sessionData',
      },
    },
    {
      $unwind: '$sessionData',
    },
    // Step 4: Only get scheduled sessions
    {
      $match: {
        'sessionData.status': 'scheduled',
      },
    },
    // Step 5: Lookup client details
    {
      $lookup: {
        from: 'clients',
        localField: 'bookingData.clientId',
        foreignField: '_id',
        as: 'clientData',
      },
    },
    {
      $unwind: '$clientData',
    },
    // Step 6: Lookup payment details
    {
      $lookup: {
        from: 'payments',
        localField: 'bookingData.paymentId',
        foreignField: '_id',
        as: 'paymentData',
      },
    },
    // Step 7: Project required fields
    {
      $addFields: {
        slotInfo: {
          slotId: '$_id',
          startTime: '$startTime',
          endTime: '$endTime',
          price: '$totalPriceAfterPlatformFee',
        },
        sessionInfo: '$sessionData',
        clientInfo: {
          clientId: '$clientData._id',
          fullName: '$clientData.fullName',
          profilePicture: '$clientData.profilePicture',
          username: '$clientData.username',
          email: '$clientData.email',
          phone: '$clientData.phone',
        },
        bookingInfo: {
          bookingId: '$bookingData._id',
          status: '$bookingData.status',
          createdAt: '$bookingData.createdAt',
        },
        paymentInfo: { $arrayElemAt: ['$paymentData', 0] },
      },
    },
    // Step 8: Final projection
    {
      $project: {
        _id: 0,
        sessionId: '$sessionInfo._id',
        bookingId: '$bookingInfo.bookingId',
        slotId: '$slotInfo.slotId',

        // Client Information
        client: {
          clientId: '$clientInfo.clientId',
          fullName: '$clientInfo.fullName',
          profilePicture: '$clientInfo.profilePicture',
          username: '$clientInfo.username',
          email: '$clientInfo.email',
          phone: '$clientInfo.phone',
        },

        // Session Details
        session: {
          videoSDKRoomId: '$sessionInfo.videoSDKRoomId',
          status: '$sessionInfo.status',
          scheduledStartTime: '$sessionInfo.scheduledStartTime',
          scheduledEndTime: '$sessionInfo.scheduledEndTime',
        },

        // Timing
        startTime: '$slotInfo.startTime',
        endTime: '$slotInfo.endTime',

        // Booking Details
        bookingStatus: '$bookingInfo.status',
        bookingCreatedAt: '$bookingInfo.createdAt',

        // Payment
        price: '$slotInfo.price',
        paymentStatus: '$paymentInfo.status',

        createdAt: '$bookingInfo.createdAt',
      },
    },
    // Step 9: Sort by start time (ascending)
    {
      $sort: { startTime: 1 },
    },
    // Step 10: Pagination
    {
      $skip: skip,
    },
    {
      $limit: parseInt(perPage),
    },
  ];

  const sessions = await GeneratedSlot.aggregate(pipeline);

  // Get total count
  const countPipeline = [
    {
      $match: {
        counselorId: new mongoose.Types.ObjectId(counselorId),
        status: 'booked',
      },
    },
    {
      $lookup: {
        from: 'bookings',
        localField: 'bookingId',
        foreignField: '_id',
        as: 'bookingData',
      },
    },
    {
      $unwind: '$bookingData',
    },
    {
      $lookup: {
        from: 'sessions',
        localField: 'bookingData.sessionId',
        foreignField: '_id',
        as: 'sessionData',
      },
    },
    {
      $unwind: '$sessionData',
    },
    {
      $match: {
        'sessionData.status': 'scheduled',
      },
    },
    {
      $count: 'total',
    },
  ];

  const countResult = await GeneratedSlot.aggregate(countPipeline);
  const totalCount = countResult.length > 0 ? countResult[0].total : 0;

  // Enrich sessions with computed fields
  const enrichedSessions = sessions.map((session) => {
    const startTime = dayjs.utc(session.startTime);
    const endTime = dayjs.utc(session.endTime);
    const minutesUntilStart = startTime.diff(now, 'minute');
    const minutesUntilEnd = endTime.diff(now, 'minute');

    // Can join X minutes before session starts and until session ends
    const canJoin = minutesUntilStart <= earlyJoinMinutesForSession && minutesUntilEnd > 0;

    // Determine session timing status
    let timingStatus = 'upcoming';
    if (canJoin && minutesUntilStart <= 0) {
      timingStatus = 'in_progress';
    } else if (canJoin) {
      timingStatus = 'ready_to_join';
    } else if (minutesUntilEnd <= 0) {
      timingStatus = 'ended';
    }

    return {
      ...session,
      canJoin,
      timingStatus,
      minutesUntilStart,
      minutesUntilEnd,

      // Format times in timezone
      startTimeFormatted: startTime.tz(timeZone).format('DD MMM YYYY, hh:mm A'),
      endTimeFormatted: endTime.tz(timeZone).format('hh:mm A'),
      dateFormatted: startTime.tz(timeZone).format('DD MMMM YYYY'),
      timeRangeFormatted: `${startTime.tz(timeZone).format('hh:mm A')} - ${endTime.tz(timeZone).format('hh:mm A')}`,

      // Smart time display
      timeUntilSession: getSmartTimeDisplay(minutesUntilStart),
    };
  });

  logger.info(
    `Retrieved ${enrichedSessions.length} upcoming sessions for counselor: ${counselorId}`
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        sessions: enrichedSessions,
        pagination: {
          currentPage: parseInt(page),
          perPage: parseInt(perPage),
          totalCount,
          totalPages: Math.ceil(totalCount / parseInt(perPage)),
        },
      },
      'Upcoming sessions retrieved successfully'
    )
  );
});

/**
 * @desc Join a session
 * @route POST /api/v1/counselor/sessions/:sessionId/join
 * @access Private (Counselor only)
 */
export const joinSession = wrapper(async (req, res) => {
  const counselorId = req.verifiedCounselorId._id;
  const { sessionId } = req.params;

  logger.info(`Counselor ${counselorId} attempting to join session: ${sessionId}`);

  // Find session with related data
  const session = await Session.findById(sessionId).populate({
    path: 'bookingId',
    populate: {
      path: 'slotId',
      match: { counselorId: counselorId },
    },
  });

  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  if (!session.bookingId || !session.bookingId.slotId) {
    throw new ApiError(403, 'You are not authorized to join this session');
  }

  if (session.status !== 'scheduled') {
    throw new ApiError(400, `Cannot join session with status: ${session.status}`);
  }

  // Check if counselor can join
  const now = dayjs().utc();
  const startTime = dayjs.utc(session.scheduledStartTime);
  const endTime = dayjs.utc(session.scheduledEndTime);
  const minutesUntilStart = startTime.diff(now, 'minute');
  const minutesUntilEnd = endTime.diff(now, 'minute');

  const canJoin = minutesUntilStart <= earlyJoinMinutesForSession && minutesUntilEnd > 0;

  if (!canJoin) {
    if (minutesUntilStart > earlyJoinMinutesForSession) {
      throw new ApiError(
        400,
        `Session can be joined ${earlyJoinMinutesForSession} minutes before start time`
      );
    } else if (minutesUntilEnd <= 0) {
      throw new ApiError(400, 'This session has already ended');
    }
  }

  // Update session status to active
  session.status = 'active';
  await session.save();

  logger.info(`Counselor ${counselorId} successfully joined session: ${sessionId}`);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        sessionId: session._id,
        videoSDKRoomId: session.videoSDKRoomId,
        status: session.status,
        scheduledStartTime: session.scheduledStartTime,
        scheduledEndTime: session.scheduledEndTime,
      },
      'Session joined successfully'
    )
  );
});

/**
 * @desc Get single session details
 * @route GET /api/v1/counselor/sessions/:sessionId
 * @access Private (Counselor only)
 */
export const getCounselorSessionDetails = wrapper(async (req, res) => {
  const counselorId = req.verifiedCounselorId._id;
  const { sessionId } = req.params;

  logger.info(`Fetching session details for counselor: ${counselorId}, session: ${sessionId}`);

  const session = await Session.findById(sessionId)
    .populate({
      path: 'bookingId',
      populate: [
        {
          path: 'clientId',
          select: 'fullName profilePicture username email phone',
        },
        {
          path: 'slotId',
          match: { counselorId: counselorId },
        },
        {
          path: 'paymentId',
        },
      ],
    })
    .lean();

  if (!session || !session.bookingId || !session.bookingId.slotId) {
    throw new ApiError(404, 'Session not found or you are not authorized to view it');
  }

  const now = dayjs().utc();
  const startTime = dayjs.utc(session.scheduledStartTime);
  const endTime = dayjs.utc(session.scheduledEndTime);
  const minutesUntilStart = startTime.diff(now, 'minute');
  const minutesUntilEnd = endTime.diff(now, 'minute');

  const canJoin = minutesUntilStart <= earlyJoinMinutesForSession && minutesUntilEnd > 0;

  const enrichedSession = {
    sessionId: session._id,
    videoSDKRoomId: session.videoSDKRoomId,
    status: session.status,
    scheduledStartTime: session.scheduledStartTime,
    scheduledEndTime: session.scheduledEndTime,

    booking: {
      bookingId: session.bookingId._id,
      status: session.bookingId.status,
      createdAt: session.bookingId.createdAt,
    },

    client: session.bookingId.clientId,

    slot: session.bookingId.slotId,

    payment: session.bookingId.paymentId,

    // Computed fields
    canJoin,
    minutesUntilStart,
    minutesUntilEnd,
    startTimeFormatted: startTime.tz(timeZone).format('DD MMM YYYY, hh:mm A'),
    endTimeFormatted: endTime.tz(timeZone).format('hh:mm A'),
    timeUntilSession: getSmartTimeDisplay(minutesUntilStart),
  };

  logger.info(`Session details retrieved for counselor: ${counselorId}`);

  return res
    .status(200)
    .json(new ApiResponse(200, enrichedSession, 'Session details retrieved successfully'));
});

// Helper function for smart time display
const getSmartTimeDisplay = (minutesUntilStart) => {
  if (minutesUntilStart <= 0) {
    return 'Session started';
  } else if (minutesUntilStart < 60) {
    return `Starts in ${minutesUntilStart} minute${minutesUntilStart !== 1 ? 's' : ''}`;
  } else if (minutesUntilStart < 1440) {
    // Less than 24 hours
    const hours = Math.floor(minutesUntilStart / 60);
    return `Starts in ${hours} hour${hours !== 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(minutesUntilStart / 1440);

    return `Starts in ${days} day${days !== 1 ? 's' : ''}`;
  }
};

export default {
  getCounselorProfile,
  updateCounselorProfile,
  updateCounselorProfilePicture,
  deleteCounselorProfilePicture,
  getCounselorStats,
  validateCounselorProfileCompleteness,
  submitCounselorApplication,
  getCounselorApplicationStatus,
};
