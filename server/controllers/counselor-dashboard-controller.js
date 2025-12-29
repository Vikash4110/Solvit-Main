// counselor-dashboard-controller.js

import mongoose from 'mongoose';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { Counselor } from '../models/counselor-model.js';
import { Session } from '../models/session.model.js';
import { GeneratedSlot } from '../models/generatedSlots-model.js';
import { Booking } from '../models/booking-model.js';
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
  counselor.gender = updateData.gender;
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

// Reuse the same logic style as client dashboard
const canJoinSessionForCounselor = (booking) => {
  if (!booking.videoSDKRoomId || !booking.startTime || !booking.endTime) return false;

  const now = dayjs().utc();
  const startTime = dayjs.utc(booking.startTime);
  const endTime = dayjs.utc(booking.endTime);

  const minutesDiffStart = startTime.diff(now, 'minute');
  const minutesDiffEnd = endTime.diff(now, 'minute');

  // Same semantics as client: join from earlyJoinMinutesForSession before start until session end
  return minutesDiffStart <= earlyJoinMinutesForSession && minutesDiffEnd > 0;
};

/**
 * @desc Get counselor bookings with filters and pagination
 * @route GET /api/v1/counselor-dashboard/bookings
 * @access Private (Counselor only)
 */
export const getCounselorBookings = wrapper(async (req, res) => {
  const rawFilter = (req.query.filter || 'upcoming').toString();
  const rawPage = req.query.page || '1';
  const rawPerPage = req.query.perPage || '20';

  const counselorId = req.verifiedCounselorId?._id;
  if (!counselorId) {
    throw new ApiError(401, 'Unauthorized: counselor id missing');
  }

  // Input validation
  const allowedFilters = ['upcoming', 'inProgress', 'disputed', 'completed', 'cancelled', 'all'];
  const filter = allowedFilters.includes(rawFilter) ? rawFilter : 'upcoming';

  let page = parseInt(rawPage, 10);
  let perPage = parseInt(rawPerPage, 10);

  if (Number.isNaN(page) || page < 1) page = 1;
  if (Number.isNaN(perPage) || perPage < 1) perPage = 20;
  if (perPage > 50) perPage = 50; // hard cap

  logger.info(
    `Fetching counselor bookings | counselorId=${counselorId} filter=${filter} page=${page} perPage=${perPage}`
  );

  // Build status filter
  let statusFilter = {};
  switch (filter) {
    case 'upcoming':
      statusFilter = { status: 'confirmed' };
      break;
    case 'inProgress':
      statusFilter = { status: 'dispute_window_open' };
      break;
    case 'disputed':
      statusFilter = { status: 'disputed' };
      break;
    case 'completed':
      statusFilter = { status: 'completed' };
      break;
    case 'cancelled':
      statusFilter = { status: 'cancelled' };
      break;
    case 'all':
    default:
      statusFilter = {};
      break;
  }

  const skip = (page - 1) * perPage;

  // Aggregation pipeline
  const pipeline = [
    {
      $lookup: {
        from: 'generatedslots',
        localField: 'slotId',
        foreignField: '_id',
        as: 'slotData',
      },
    },
    { $unwind: '$slotData' },
    {
      $match: {
        'slotData.counselorId': new mongoose.Types.ObjectId(counselorId),
        ...statusFilter,
      },
    },
    {
      $lookup: {
        from: 'clients',
        localField: 'clientId',
        foreignField: '_id',
        as: 'clientData',
      },
    },
    {
      $lookup: {
        from: 'sessions',
        localField: 'sessionId',
        foreignField: '_id',
        as: 'sessionData',
      },
    },
    {
      $lookup: {
        from: 'payments',
        localField: 'paymentId',
        foreignField: '_id',
        as: 'paymentData',
      },
    },
    {
      $addFields: {
        slotInfo: '$slotData',
        sessionInfo: { $arrayElemAt: ['$sessionData', 0] },
        clientInfo: { $arrayElemAt: ['$clientData', 0] },
        paymentInfo: { $arrayElemAt: ['$paymentData', 0] },
      },
    },
    {
      $project: {
        bookingId: '$_id',
        status: 1,
        createdAt: 1,
        // Client info
        clientName: '$clientInfo.fullName',
        clientPhoto: '$clientInfo.profilePicture',
        clientEmail: '$clientInfo.email',
        clientPhone: '$clientInfo.phone',
        // Slot/session info
        startTime: '$slotInfo.startTime',
        endTime: '$slotInfo.endTime',
        earnings: '$slotInfo.basePrice', // counselor earning (pre-payout)
        totalPrice: '$slotInfo.totalPriceAfterPlatformFee',
        videoSDKRoomId: '$sessionInfo.videoSDKRoomId',
        // Dispute info (optional)
        dispute: 1,
      },
    },
    {
      $sort:
        filter === 'upcoming' ? { startTime: 1, createdAt: -1 } : { startTime: -1, createdAt: -1 },
    },
    { $skip: skip },
    { $limit: perPage },
  ];

  let bookings;
  try {
    bookings = await Booking.aggregate(pipeline);
  } catch (error) {
    logger.error('Error running counselor bookings aggregation', {
      error: error.message,
      stack: error.stack,
      counselorId,
      filter,
    });
    throw new ApiError(500, 'Failed to fetch bookings');
  }

  // Total count for pagination
  const countPipeline = [
    {
      $lookup: {
        from: 'generatedslots',
        localField: 'slotId',
        foreignField: '_id',
        as: 'slotData',
      },
    },
    { $unwind: '$slotData' },
    {
      $match: {
        'slotData.counselorId': new mongoose.Types.ObjectId(counselorId),
        ...statusFilter,
      },
    },
    { $count: 'total' },
  ];

  let totalCount = 0;
  try {
    const countResult = await Booking.aggregate(countPipeline);
    totalCount = countResult[0]?.total || 0;
  } catch (error) {
    logger.error('Error counting counselor bookings', {
      error: error.message,
      stack: error.stack,
      counselorId,
      filter,
    });
    throw new ApiError(500, 'Failed to count bookings');
  }

  // Compute canJoin per booking with robust checks
  const enrichedBookings = bookings.map((booking) => {
    const canJoin = canJoinSessionForCounselor(booking);

    return {
      ...booking,
      canJoin,
      // For counselor UI convenience, also include a formatted cancellationDeadline if needed later
      // cancellationDeadline: booking.startTime
      //   ? dayjs.utc(booking.startTime).tz(timeZone).subtract(24, 'hour').format('YYYY-MM-DD hh:mm A')
      //   : null,
    };
  });

  logger.info(
    `Counselor bookings fetched | counselorId=${counselorId} count=${enrichedBookings.length} total=${totalCount}`
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        bookings: enrichedBookings,
        pagination: {
          currentPage: page,
          perPage,
          totalCount,
          totalPages: Math.ceil(totalCount / perPage) || 1,
        },
      },
      'Counselor bookings fetched successfully'
    )
  );
});

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
