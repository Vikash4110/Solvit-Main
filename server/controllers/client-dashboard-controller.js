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
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);

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

  // const now = dayjs().utc();
  // const startTime = dayjs.utc(booking.startTime);
  // const endTime = dayjs.utc(booking.endTime);

  //can join 10 minutes earlier from start time
  // const minutesDiffStart = startTime.diff(now, 'minute');

  // //can join until  session ends
  // const minutesDiffEnd = endTime.diff(now, 'minute');

  // Can join 10 minutes before to 90 minutes afte
  return true;
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
        from: 'sessions',
        localField: 'sessionId',
        foreignField: '_id',
        as: 'sessionData',
      },
    },

    {
      $unwind: '$sessionData',
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
        sessionInfo: '$sessionData',
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
        videoSDKRoomId: '$sessionInfo.videoSDKRoomId',
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

    return {
      ...booking,
      canCancel,
      canJoin,

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

  res.json({
    success: true,
    data: {
      ...booking.toObject(),
      canCancel,
      canJoin,
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
