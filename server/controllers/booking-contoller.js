import { wrapper } from '../utils/wrapper.js';
import { Booking } from '../models/booking-model.js';
import { Counselor } from '../models/counselor-model.js';
import { GeneratedSlot } from '../models/generatedSlots-model.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(timezone);

//fetching only available counselors
const getAvailableCounselors = wrapper(async (req, res) => {
  try {
    // Get all approved counselors with available slots

    const counselors = await Counselor.aggregate([
      {
        $match: {
          'application.applicationStatus': 'approved',
          isBlocked: false,
        },
      },
      {
        $lookup: {
          from: 'generatedslots',
          localField: '_id',
          foreignField: 'counselorId',
          as: 'availableSlots',
          pipeline: [
            {
              $match: {
                status: 'available',
                startTime: { $gte: dayjs().utc().toDate() }, // Only future slots
              },
            },
            {
              $sort: { startTime: 1 },
            },
          ],
        },
      },
      {
        $match: {
          'availableSlots.0': { $exists: true }, // Only counselors with available slots
        },
      },
      {
        $project: {
          password: 0, // Exclude sensitive data
          'application.bankDetails': 0,
          'application.documents': 0,
        },
      },
    ]);

    res.status(200).json({
      status: 200,
      message: 'Available counselors fetched successfully',
      counselors,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Failed to fetch counselors',
      error,
    });
  }
});

//getting slots of the counselor
const getCounselorSlots = wrapper(async (req, res) => {
  const { counselorId } = req.params;

  try {
    // Get counselor data
    const counselor = await Counselor.findById(counselorId).select(
      '-password -application.bankDetails -application.documents'
    );

    if (!counselor) {
      return res.status(404).json({
        status: 404,
        message: 'Counselor not found',
      });
    }

    // Get available slots for this counselor for the same day and after days
    //now only those slots that are at least 10 minutes in the future .
    const currentDateTime = dayjs().utc().toDate();
    const slots = await GeneratedSlot.find({
      counselorId,
      status: 'available',
      startTime: { $gte: currentDateTime },
    }).sort({ startTime: 1 });

    res.status(200).json({
      status: 200,
      message: 'Counselor data fetched successfully',
      counselor,
      slots,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Failed to fetch counselor data',
      error,
    });
  }
});

//below it no updation has been done according to new

// Get client bookings
const getClientBookings = wrapper(async (req, res) => {
  const clientId = req.verifiedClientId._id;

  try {
    const bookings = await Booking.find({ client: clientId })
      .populate('counselor', 'fullName specialization profilePicture email phone')
      .populate('slot', 'date startTime endTime')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 200,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Failed to fetch bookings',
      error,
    });
  }
});

// Cancel booking
const cancelBooking = wrapper(async (req, res) => {
  const clientId = req.verifiedClientId._id;
  const { bookingId } = req.body;

  try {
    const booking = await Booking.findOne({
      _id: bookingId,
      client: clientId,
    }).populate('slot');

    if (!booking) {
      return res.status(404).json({
        status: 404,
        message: 'Booking not found',
      });
    }

    // Check if booking can be cancelled (24 hours before)
    const sessionDateTime = new Date(
      `${booking.slot.date.toISOString().split('T')[0]} ${booking.slot.startTime}`
    );
    const now = new Date();
    const hoursDifference = (sessionDateTime - now) / (1000 * 60 * 60);

    if (hoursDifference < 24) {
      return res.status(400).json({
        status: 400,
        message: 'Cannot cancel booking within 24 hours of session time',
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Update slot status
    const slot = await GeneratedSlot.findById(booking.slot._id);
    slot.isBooked = false;
    slot.status = 'available';
    slot.clientId = null;
    slot.bookingId = null;
    await slot.save();

    res.status(200).json({
      status: 200,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Failed to cancel booking',
      error,
    });
  }
});

export { getAvailableCounselors, getClientBookings, cancelBooking, getCounselorSlots };
