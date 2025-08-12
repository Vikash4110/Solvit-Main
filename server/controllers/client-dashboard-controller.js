import mongoose from "mongoose";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { Booking } from "../models/booking-model.js";
import { GeneratedSlot } from "../models/generatedSlots-model.js";
import { Payment } from "../models/payment-model.js";
import { wrapper } from "../utils/wrapper.js";

dayjs.extend(utc);
dayjs.extend(timezone);

// Helper function to determine if booking can be canceled
const canCancelBooking = (booking) => {
  const now = dayjs().tz("Asia/Kolkata");
  const sessionStart = dayjs(
    `${dayjs(booking.date).format("YYYY-MM-DD")} ${booking.startTime}`,
    "YYYY-MM-DD hh:mm A"
  );
  const hoursDiff = sessionStart.diff(now, "hour");

  // Can cancel if more than 24 hours before session
  return hoursDiff >= 24 && ["scheduled"].includes(booking.status);
};

// Helper function to determine if user can join
const canJoinSession = (booking) => {
  if (!booking.googleMeetLink) return false;

  const now = dayjs().tz("Asia/Kolkata");
  const sessionStart = dayjs(
    `${dayjs(booking.date).format("YYYY-MM-DD")} ${booking.startTime}`,
    "YYYY-MM-DD hh:mm A"
  );
  const sessionEnd = dayjs(
    `${dayjs(booking.date).format("YYYY-MM-DD")} ${booking.endTime}`,
    "YYYY-MM-DD hh:mm A"
  );

  //can join 10 minutes earlier from start time
  const minutesDiffStart = sessionStart.diff(now, "minute");

  //can join until  session ends
  const minutesDiffEnd = sessionEnd.diff(now, "minute");

  // Can join 10 minutes before to 90 minutes afte
  return minutesDiffStart <= 10 && minutesDiffEnd > 0;
};

// Get bookings with filters and pagination
export const getBookings = wrapper(async (req, res) => {
  const { filter = "upcoming", page = 1, perPage = 20 } = req.query;
  const clientId = req.verifiedClientId;

  // Build query based on filter
  let statusFilter = {};

  const now = dayjs();

  switch (filter) {
    case "upcoming":
      statusFilter = {
        status: "scheduled", // Only future bookings
      };
      break;
    case "history":
      statusFilter = {
        $or: [
          { status: "completed" },
          { status: "cancelled" },
          { status: "no-show" },
        ],
      };
      break;

    default:
      statusFilter = {};
  }

  const skip = (parseInt(page) - 1) * parseInt(perPage);

  // Aggregation pipeline for joining data
  const pipeline = [
    {
      $match: {
        client: new mongoose.Types.ObjectId(clientId),
        ...statusFilter,
      },
    },
    {
      $lookup: {
        from: "generatedslots",
        localField: "slot",
        foreignField: "_id",
        as: "slotData",
      },
    },
    {
      $lookup: {
        from: "counselors",
        localField: "counselor",
        foreignField: "_id",
        as: "counselorData",
      },
    },
    {
      $addFields: {
        slot: { $arrayElemAt: ["$slotData", 0] },
        counselorInfo: { $arrayElemAt: ["$counselorData", 0] },
      },
    },
    {
      $project: {
        bookingId: "$_id",
        slotId: "$slot._id",
        counselorId: "$counselorInfo._id",
        counselorName: "$counselorInfo.fullName",
        counselorPhoto: "$counselorInfo.profilePicture",
        specialization: "$counselorInfo.specialization",
        date: "$slot.date",
        startTime: "$slot.startTime",
        endTime: "$slot.endTime",
        status: 1,
        paymentStatus: 1,
        price: 1,
        googleMeetLink: 1,
        createdAt: 1,
        updatedAt: 1,
        slotDuration: 1,
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
  (filter ==="upcoming") ?
  bookings.sort((a, b) => {
    const datea = dayjs(a.date).format("YYYY-MM-DD")
    const dateb = dayjs(b.date).format("YYYY-MM-DD")
    const dateTimeA = dayjs(`${datea} ${a.startTime}`, "YYYY-MM-DD hh:mm A");
    const dateTimeB = dayjs(`${dateb} ${b.startTime}`, "YYYY-MM-DD hh:mm A");
    if (dateTimeA.isBefore(dateTimeB)) return -1;
    if (dateTimeA.isAfter(dateTimeB)) return 1;
    return 0;
  }) : bookings.sort((a, b) => {
    const datea = dayjs(a.date).format("YYYY-MM-DD")
    const dateb = dayjs(b.date).format("YYYY-MM-DD")
    const dateTimeA = dayjs(`${datea} ${a.startTime}`, "YYYY-MM-DD hh:mm A");
    const dateTimeB = dayjs(`${dateb} ${b.startTime}`, "YYYY-MM-DD hh:mm A");
    if (dateTimeA.isBefore(dateTimeB)) return 1;
    if (dateTimeA.isAfter(dateTimeB)) return -1;
    return 0;
  })


  // Get total count for pagination
  const totalCount = await Booking.countDocuments({
    client: clientId,
    ...statusFilter,
  });
  console.log(bookings)

  // Add computed fields for each booking
  const enrichedBookings = bookings.map((booking) => {
    const canCancel = canCancelBooking(booking);
    const canJoin = canJoinSession(booking);

    return {
      ...booking,
      canCancel,
      canJoin,
      canReschedule: canCancel, // Same logic for now
      // Obfuscate meeting link until join time
      meetingLink: canJoin ? booking.googleMeetLink : null,
      cancellationDeadline: booking.date
        ? dayjs(`${dayjs(booking.date).format("YYYY-MM-DD")} ${booking.startTime}`,"YYYY-MM-DD hh:mm A").subtract(24, "hour").toISOString()
        : null,
    };
  });

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
  const clientId = req.verifiedClientId;

  const booking = await Booking.findOne({
    _id: id,
    client: clientId,
  })
    .populate("slot")
    .populate("counselor", "fullName profilePicture specialization email")
    .populate("client", "fullName email");

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found",
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
        ? dayjs(booking.slot.date).subtract(24, "hour").toISOString()
        : null,
    },
  });
});

// Cancel booking
export const cancelBooking = wrapper(async (req, res) => {
  const { id } = req.params;
  const clientId = req.verifiedClientId;
  const { reason } = req.body;

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // Find booking
      const booking = await Booking.findOne({
        _id: id,
        client: clientId,
      })
        .populate("slot")
        .session(session);

      if (!booking) {
        throw new Error("Booking not found");
      }

      // Check if cancellation is allowed
      if (!canCancelBooking(booking)) {
        throw new Error(
          "Cancellation not allowed. Must cancel at least 24 hours before session."
        );
      }

      if (!["scheduled", "booked", "pending"].includes(booking.status)) {
        throw new Error("Cannot cancel booking with current status");
      }

      // Update booking status
      await Booking.updateOne(
        { _id: id },
        {
          status: "cancelled",
          cancellationReason: reason,
          cancelledAt: new Date(),
          cancelledBy: "client",
        },
        { session }
      );

      // Release the slot atomically
      await GeneratedSlot.updateOne(
        { _id: booking.slot._id },
        {
          $set: {
            isBooked: false,
            status: "available",
            clientId: null,
            bookingId: null,
          },
        },
        { session }
      );

      // If payment was made, initiate refund
      if (booking.paymentStatus === "paid") {
        // Create refund record or trigger refund process
        // This depends on your payment system implementation
        await Payment.updateOne(
          { clientId, slotId: booking.slot._id },
          {
            status: "refund_pending",
            refundReason: reason,
            refundInitiatedAt: new Date(),
          },
          { session }
        );
      }
    });

    res.json({
      success: true,
      message:
        "Booking cancelled successfully. Refund will be processed within 5-7 business days.",
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
        .populate("slot")
        .session(session);

      if (!booking) {
        throw new Error("Booking not found");
      }

      if (!canCancelBooking(booking)) {
        throw new Error(
          "Reschedule not allowed. Must reschedule at least 24 hours before session."
        );
      }

      // Check if new slot is available
      const newSlot = await GeneratedSlot.findOne({
        _id: newSlotId,
        isBooked: false,
        status: "available",
      }).session(session);

      if (!newSlot) {
        throw new Error("Selected slot is not available");
      }

      // Book new slot atomically
      const slotUpdate = await GeneratedSlot.updateOne(
        { _id: newSlotId, isBooked: false },
        {
          $set: {
            isBooked: true,
            status: "booked",
            clientId,
            bookingId: id,
          },
        },
        { session }
      );

      if (slotUpdate.modifiedCount === 0) {
        throw new Error("Failed to book new slot - may have been taken");
      }

      // Release old slot
      await GeneratedSlot.updateOne(
        { _id: booking.slot._id },
        {
          $set: {
            isBooked: false,
            status: "available",
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
          status: "scheduled",
          rescheduleReason: reason,
          rescheduledAt: new Date(),
          rescheduledBy: "client",
        },
        { session }
      );
    });

    res.json({
      success: true,
      message: "Booking rescheduled successfully",
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
