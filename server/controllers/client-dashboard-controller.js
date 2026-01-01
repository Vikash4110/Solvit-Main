import mongoose from 'mongoose';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import { Booking } from '../models/booking-model.js';
import { GeneratedSlot } from '../models/generatedSlots-model.js';
import { Payment } from '../models/payment-model.js';
import { wrapper } from '../utils/wrapper.js';
import { timeZone, earlyJoinMinutesForSession, cancellationWindowHours } from '../constants.js';

import { Client } from '../models/client-model.js';
import { uploadOncloudinary } from '../utils/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { logger } from '../utils/logger.js';
import fs from 'fs';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);

// ***************************************** Personal Information  ( Profile) ***************************************

/**
 * @desc    Get client profile
 * @access  Private (Client only)
 */

export const getClientProfile = wrapper(async (req, res) => {
  const clientId = req.verifiedClientId._id;

  logger.info(`Fetching profile for client: ${clientId}`);

  // Find client and exclude sensitive fields
  const client = await Client.findById(clientId).select('-password -refreshToken -__v').lean();

  if (!client) {
    throw new ApiError(404, 'Client profile not found');
  }

  logger.info(`Profile retrieved successfully for client: ${clientId}`);

  return res
    .status(200)
    .json(new ApiResponse(200, client, 'Client profile retrieved successfully'));
});

/**
 * @desc    Update client profile
 * @access  Private (Client only)
 */
export const updateClientProfile = wrapper(async (req, res) => {
  const clientId = req.verifiedClientId._id;

  logger.info(`Updating profile for client: ${clientId}`);

  // Destructure allowed fields for update
  const {
    fullName,
    username,
    email,
    phone,
    gender,
    bio,
    address,
    preferredLanguages,
    prefferedTopics,
  } = req.body;

  console.log('****************************************************************************');
  console.log(prefferedTopics);
  console.log('***************************************************************************');

  // Validate required fields
  if (!fullName?.trim()) {
    throw new ApiError(400, 'Full name is required');
  }

  if (!email?.trim()) {
    throw new ApiError(400, 'Email is required');
  }

  if (!phone?.trim()) {
    throw new ApiError(400, 'Phone number is required');
  }

  // Check if username is being changed and if it's already taken
  if (username && username.trim()) {
    const existingClient = await Client.findOne({
      username: username.trim(),
      _id: { $ne: clientId },
    });

    if (existingClient) {
      throw new ApiError(409, 'Username is already taken');
    }
  }

  // Check if email is being changed and if it's already taken
  const existingEmailClient = await Client.findOne({
    email: email.trim().toLowerCase(),
    _id: { $ne: clientId },
  });

  if (existingEmailClient) {
    throw new ApiError(409, 'Email is already registered');
  }

  // Check if phone is being changed and if it's already taken
  const existingPhoneClient = await Client.findOne({
    phone: phone.trim(),
    _id: { $ne: clientId },
  });

  if (existingPhoneClient) {
    throw new ApiError(409, 'Phone number is already registered');
  }

  // Prepare update object with nested field handling
  const updateData = {};

  // Basic fields
  if (fullName?.trim()) updateData.fullName = fullName.trim();
  if (username?.trim()) updateData.username = username.trim();
  if (email?.trim()) updateData.email = email.trim().toLowerCase();
  if (phone?.trim()) updateData.phone = phone.trim();
  if (gender) updateData.gender = gender;
  if (bio !== undefined) updateData.bio = bio; // Allow empty string

  // Nested objects - only update if provided
  if (address) {
    updateData.address = {
      city: address.city?.trim() || '',
      area: address.area?.trim() || '',
      pincode: address.pincode?.trim() || '',
    };
  }

  if (Array.isArray(preferredLanguages)) {
    updateData.preferredLanguages = preferredLanguages;
  }

  if (Array.isArray(prefferedTopics)) {
    updateData.prefferedTopics = prefferedTopics;
  }

  // Update client profile
  const updatedClient = await Client.findByIdAndUpdate(
    clientId,
    { $set: updateData },
    {
      new: true,
      runValidators: true,
    }
  ).select('-password -refreshToken -__v');

  if (!updatedClient) {
    throw new ApiError(404, 'Client not found');
  }

  logger.info(`Profile updated successfully for client: ${clientId}`);

  return res.status(200).json(new ApiResponse(200, updatedClient, 'Profile updated successfully'));
});

/**
 * @desc    Update client profile picture
 * @access  Private (Client only)
 */
export const updateProfilePicture = wrapper(async (req, res) => {
  const clientId = req.verifiedClientId._id;
  logger.info(`Updating profile picture for client: ${clientId}`);

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

  // Get current client
  const client = await Client.findById(clientId);
  if (!client) {
    // Clean up uploaded file
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw new ApiError(404, 'Client not found');
  }

  // Delete old profile picture from Cloudinary (if exists)
  if (client.profilePicture) {
    try {
      // Extract public_id from Cloudinary URL
      const urlParts = client.profilePicture.split('/');
      const publicIdWithExt = urlParts[urlParts.length - 1];
      const publicId = publicIdWithExt.split('.')[0];

      // Note: Your cloudinary.js doesn't have delete function, you can add it
      logger.info(`Old profile picture exists, but delete function not implemented yet`);
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

  // Update client profile picture URL
  const updatedClient = await Client.findByIdAndUpdate(
    clientId,
    { profilePicture: uploadResult.secure_url },
    { new: true }
  ).select('-password -refreshToken -__v');

  logger.info(`Profile picture updated successfully for client: ${clientId}`);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { profilePicture: updatedClient.profilePicture },
        'Profile picture updated successfully'
      )
    );
});

/**
 * @desc    Delete client profile picture
 * @access  Private (Client only)
 */
export const deleteProfilePicture = wrapper(async (req, res) => {
  const clientId = req.verifiedClientId._id;

  logger.info(`Deleting profile picture for client: ${clientId}`);

  const client = await Client.findById(clientId);
  if (!client) {
    throw new ApiError(404, 'Client not found');
  }

  if (!client.profilePicture) {
    throw new ApiError(400, 'No profile picture to delete');
  }

  // Delete from Cloudinary (if delete function exists)
  try {
    const urlParts = client.profilePicture.split('/');
    const publicIdWithExt = urlParts[urlParts.length - 1];
    const publicId = publicIdWithExt.split('.')[0];

    logger.info(`Profile picture deletion from Cloudinary not implemented yet`);
    // You can implement deleteFromCloudinary function in cloudinary.js
  } catch (error) {
    logger.error(`Error deleting profile picture from Cloudinary: ${error.message}`);
  }

  // Remove profile picture URL from database
  client.profilePicture = undefined;
  await client.save();

  logger.info(`Profile picture deleted successfully for client: ${clientId}`);

  return res.status(200).json(new ApiResponse(200, null, 'Profile picture deleted successfully'));
});

/**
 * @desc    Get client dashboard stats
 * @access  Private (Client only)
 */
export const getClientStats = wrapper(async (req, res) => {
  const clientId = req.verifiedClientId._id;

  logger.info(`Fetching stats for client: ${clientId}`);

  const client = await Client.findById(clientId).select('createdAt lastLogin').lean();

  if (!client) {
    throw new ApiError(404, 'Client not found');
  }

  // Basic stats (expand with actual booking/session data later)
  const stats = {
    totalSessions: 0, // TODO: Calculate from bookings
    upcomingSessions: 0, // TODO: Calculate from bookings
    completedSessions: 0, // TODO: Calculate from bookings
    totalSpent: 0, // TODO: Calculate from payments
    memberSince: client.createdAt,
    lastLogin: client.lastLogin || client.createdAt,
  };

  logger.info(`Stats retrieved successfully for client: ${clientId}`);

  return res.status(200).json(new ApiResponse(200, stats, 'Client stats retrieved successfully'));
});

/**
 * @desc    Validate client profile completeness
 * @access  Private (Client only)
 */
export const validateProfileCompleteness = wrapper(async (req, res) => {
  const clientId = req.verifiedClientId._id;

  const client = await Client.findById(clientId).select('-password -__v -isBlocked').lean();

  if (!client) {
    throw new ApiError(404, 'Client not found');
  }
  console.log(client);

  // Check profile completeness
  const completeness = {
    hasBasicInfo: !!(client.fullName && client.email && client.phone && client.username),
    hasGender: !!client.gender,
    hasProfilePicture: !!client.profilePicture,
    hasAddress: !!client.address,
    hasPrefferedTopics: !!client.prefferedTopics,
    hasPreferredLanguages: !!client.preferredLanguages,
    hasBio: !!client.bio,
  };

  const totalFields = Object.keys(completeness).length;
  const completedFields = Object.values(completeness).filter(Boolean).length;
  const completionPercentage = Math.round((completedFields / totalFields) * 100);
  console.log(totalFields);
  console.log(completedFields);
  console.log(`completion : ${completionPercentage}`);
  const result = {
    isComplete: completionPercentage === 100,
    completionPercentage,
    missingFields: Object.entries(completeness)
      .filter(([_, value]) => !value)
      .map(([key]) => key),
    details: completeness,
  };

  return res.status(200).json(new ApiResponse(200, result, 'Profile validation completed'));
});

//***************************************** Booking *******************************************

// Helper function to determine if booking can be canceled
const canCancelBooking = (booking) => {
  const now = dayjs().utc();
  const startTime = dayjs.utc(booking.startTime);
  const hoursDiff = startTime.diff(now, 'hour');

  // Can cancel if more than 24 hours before session
  return hoursDiff >= cancellationWindowHours && ['confirmed'].includes(booking.status);
};

// Helper function to determine if user can join
const canJoinSession = (booking) => {
  if (!booking.videoSDKRoomId) return false;

  const now = dayjs().utc();
  const startTime = dayjs.utc(booking.startTime);
  const endTime = dayjs.utc(booking.endTime);

  //can join 10 minutes earlier from start time
  const minutesDiffStart = startTime.diff(now, 'minute');

  //can join until  session ends
  const minutesDiffEnd = endTime.diff(now, 'minute');

  // Can join 10 minutes before to 90 minutes afte
  // return minutesDiffStart <= earlyJoinMinutesForSession && minutesDiffEnd > 0;
  return true;
  // return true;
};

//helper function to determine if user can raise issue

const canRaiseIssueOnBooking = (booking) => {
  return booking.status === 'dispute_window_open';
};

// Get bookings with filters and pagination
export const getBookings = wrapper(async (req, res) => {
  const { filter = 'upcoming', page = 1, perPage = 20 } = req.query;
  const clientId = req.verifiedClientId._id;
  console.log(filter);

  // Build query based on filter
  let statusFilter = {};

  switch (filter) {
    case 'upcoming':
      statusFilter = {
        status: 'confirmed',
      };
      break;
    case 'raiseIssue':
      statusFilter = {
        status: 'dispute_window_open',
      };
      break;
    case 'issuesRaised':
      statusFilter = {
        status: 'disputed',
      };
      break;
    case 'completed':
      statusFilter = {
        status: 'completed',
      };
      break;
    case 'cancelled':
      statusFilter = {
        status: 'cancelled',
      };
      break;

    default:
      statusFilter = {};
  }

  const skip = (parseInt(page) - 1) * parseInt(perPage);

  console.log(perPage);
  console.log(skip);

  // Aggregation pipeline for joining data
  const pipeline = [
    {
      $match: {
        clientId: new mongoose.Types.ObjectId(clientId),
        ...statusFilter,
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
      $lookup: {
        from: 'generatedslots',
        localField: 'slotId',
        foreignField: '_id',
        as: 'slotData',
      },
    },

    {
      $unwind: '$slotData',
    },
    {
      $lookup: {
        from: 'counselors',
        localField: 'slotData.counselorId',
        foreignField: '_id',
        as: 'counselorData',
      },
    },
    {
      $addFields: {
        slotInfo: '$slotData',
        counselorInfo: { $arrayElemAt: ['$counselorData', 0] },
        paymentInfo: { $arrayElemAt: ['$paymentData', 0] },
      },
    },
    {
      $project: {
        bookingId: '$_id',
        counselorName: '$counselorInfo.fullName',
        counselorPhoto: '$counselorInfo.profilePicture',
        specialization: '$counselorInfo.specialization',
        startTime: '$slotInfo.startTime',
        endTime: '$slotInfo.endTime',
        price: '$slotInfo.totalPriceAfterPlatformFee',
        videoSDKRoomId: 1,
        status: 1,
        invoice: '$paymentInfo.invoice',
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: parseInt(perPage),
    },
  ];

  const bookings = await Booking.aggregate(pipeline);

  filter === 'upcoming'
    ? bookings.sort((a, b) => {
        const startTimeA = dayjs.utc(`${a.startTime}`);
        const startTimeB = dayjs.utc(`${b.startTime}`);
        if (startTimeA.isSameOrBefore(startTimeB)) return -1;
        if (startTimeA.isAfter(startTimeB)) return 1;
        return 0;
      })
    : bookings.sort((a, b) => {
        const startTimeA = dayjs.utc(`${a.startTime}`);
        const startTimeB = dayjs.utc(`${b.startTime}`);
        if (startTimeA.isSameOrBefore(startTimeB)) return 1;
        if (startTimeA.isAfter(startTimeB)) return -1;
        return 0;
      });

  // Get total count for pagination
  const totalCount = await Booking.countDocuments({
    clientId: clientId,
    ...statusFilter,
  });

  // Add computed fields for each booking
  const enrichedBookings = bookings.map((booking) => {
    const canCancel = canCancelBooking(booking);
    const canJoin = canJoinSession(booking);
    const canRaiseIssue = canRaiseIssueOnBooking(booking);

    return {
      ...booking,
      canCancel,
      canJoin,
      canRaiseIssue,

      cancellationDeadline: booking.startTime
        ? dayjs
            .utc(booking.startTime)
            .subtract(cancellationWindowHours, 'hour')
            .tz(timeZone)
            .format('YYYY-MM-DD hh:mm A')
        : null,
    };
  });
  console.log(enrichedBookings);

  res.json({
    success: true,
    data: {
      bookings: enrichedBookings,
      pagination: {
        currentPage: parseInt(page),
        perPage: parseInt(perPage),
        totalCount,
        totalPages: Math.ceil(totalCount / parseInt(perPage)),
      },
    },
  });
});

// Get single booking details
export const getBookingDetails = wrapper(async (req, res) => {
  const { id } = req.params;
  const clientId = req.verifiedClientId._id;

  const booking = await Booking.findOne({
    _id: id,
    client: clientId,
  })
    .populate('slot')
    .populate('counselor', 'fullName profilePicture specialization email')
    .populate('client', 'fullName email');

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found',
    });
  }

  const canCancel = canCancelBooking(booking);
  const canJoin = canJoinSession(booking);
  const canRaiseIssue = canRaiseIssueOnBooking(booking);

  res.json({
    success: true,
    data: {
      ...booking.toObject(),
      canCancel,
      canJoin,
      canRaiseIssue,
      canReschedule: canCancel,
      meetingLink: canJoin ? booking.googleMeetLink : null,
      cancellationDeadline: booking.slot?.date
        ? dayjs(booking.slot.date).subtract(24, 'hour').toISOString()
        : null,
    },
  });
});

// Cancel booking
export const cancelBooking = wrapper(async (req, res) => {
  const { id } = req.params;
  const clientId = req.verifiedClientId._id;
  const { reason } = req.body;

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // Find booking
      const booking = await Booking.findOne({
        _id: id,
        client: clientId,
      })
        .populate('slot')
        .session(session);

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Check if cancellation is allowed
      if (!canCancelBooking(booking)) {
        throw new Error('Cancellation not allowed. Must cancel at least 24 hours before session.');
      }

      if (!['scheduled', 'booked', 'pending'].includes(booking.status)) {
        throw new Error('Cannot cancel booking with current status');
      }

      // Update booking status
      await Booking.updateOne(
        { _id: id },
        {
          status: 'cancelled',
          cancellationReason: reason,
          cancelledAt: new Date(),
          cancelledBy: 'client',
        },
        { session }
      );

      // Release the slot atomically
      await GeneratedSlot.updateOne(
        { _id: booking.slot._id },
        {
          $set: {
            isBooked: false,
            status: 'available',
            clientId: null,
            bookingId: null,
          },
        },
        { session }
      );

      // If payment was made, initiate refund
      if (booking.paymentStatus === 'paid') {
        // Create refund record or trigger refund process
        // This depends on your payment system implementation
        await Payment.updateOne(
          { clientId, slotId: booking.slot._id },
          {
            status: 'refund_pending',
            refundReason: reason,
            refundInitiatedAt: new Date(),
          },
          { session }
        );
      }
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully. Refund will be processed within 5-7 business days.',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  } finally {
    await session.endSession();
  }
});

// Request reschedule ( for future )
export const rescheduleBooking = wrapper(async (req, res) => {
  const { id } = req.params;
  const clientId = req.user.id;
  const { newSlotId, reason } = req.body;

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // Find original booking
      const booking = await Booking.findOne({
        _id: id,
        client: clientId,
      })
        .populate('slot')
        .session(session);

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (!canCancelBooking(booking)) {
        throw new Error(
          'Reschedule not allowed. Must reschedule at least 24 hours before session.'
        );
      }

      // Check if new slot is available
      const newSlot = await GeneratedSlot.findOne({
        _id: newSlotId,
        isBooked: false,
        status: 'available',
      }).session(session);

      if (!newSlot) {
        throw new Error('Selected slot is not available');
      }

      // Book new slot atomically
      const slotUpdate = await GeneratedSlot.updateOne(
        { _id: newSlotId, isBooked: false },
        {
          $set: {
            isBooked: true,
            status: 'booked',
            clientId,
            bookingId: id,
          },
        },
        { session }
      );

      if (slotUpdate.modifiedCount === 0) {
        throw new Error('Failed to book new slot - may have been taken');
      }

      // Release old slot
      await GeneratedSlot.updateOne(
        { _id: booking.slot._id },
        {
          $set: {
            isBooked: false,
            status: 'available',
            clientId: null,
            bookingId: null,
          },
        },
        { session }
      );

      // Update booking with new slot
      await Booking.updateOne(
        { _id: id },
        {
          slot: newSlotId,
          status: 'scheduled',
          rescheduleReason: reason,
          rescheduledAt: new Date(),
          rescheduledBy: 'client',
        },
        { session }
      );
    });

    res.json({
      success: true,
      message: 'Booking rescheduled successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  } finally {
    await session.endSession();
  }
});
