import { wrapper } from '../utils/wrapper.js';
import { RecurringAvailability } from '../models/recurringAvailability-model.js';
import { GeneratedSlot } from '../models/generatedSlots-model.js';
import { Counselor } from '../models/counselor-model.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import mongoose from 'mongoose';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import { Price } from '../models/price-model.js';
import { ApiError } from '../utils/ApiError.js';
import { paltformFeePercentage } from '../constants.js';
import { timeZone, slotDuration, timeBufferGenerateSlots } from '../constants.js';

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(timezone);

// ─────────────────────────────────────────────
// Helper: parse a time string against a date,
// rolling end time to the next day if it crosses
// midnight (i.e. endTime <= startTime).
// ─────────────────────────────────────────────
const parseSlotTime = (dateStr, timeStr, tz) => {
  return dayjs.tz(`${dateStr} ${timeStr}`, 'YYYY-MM-DD hh:mm A', tz);
};

const resolveEndTime = (startTime, endTime) => {
  // If end is not after start it must have crossed midnight — push it one day forward
  if (!endTime.isAfter(startTime)) {
    return endTime.add(1, 'day');
  }
  return endTime;
};

// ─────────────────────────────────────────────
// Setting Recurring Availability
// ─────────────────────────────────────────────
const settingRecurringAvailability = wrapper(async (req, res) => {
  const counselorId = req.verifiedCounselorId._id;
  const { weeklyAvailability } = req.body;

  const counselorData = await Counselor.findById(counselorId).select('-password');
  if (!counselorData) {
    throw new ApiError(400, 'No counselor found. Please login again');
  }

  const priceData = await Price.findOne({
    experienceLevel: `${counselorData.experienceLevel}`,
  });
  if (!priceData) {
    throw new ApiError(400, 'No price info found');
  }

  const { minPrice, maxPrice } = priceData;

  if (!minPrice || !maxPrice) {
    throw new ApiError(400, 'Error: No minPrice or maxPrice found');
  }

  if (!weeklyAvailability || weeklyAvailability.length !== 7) {
    return res.status(400).json({
      status: 400,
      message: 'Set availability for all 7 days of the week',
    });
  }

  // ── Validate all days before touching the DB ──
  for (let day of weeklyAvailability) {
    if (!day.dayOfWeek) {
      return res.status(400).json({
        status: 400,
        message: 'Day of the week is required',
      });
    }

    if (day.isAvailable && (!day.timeRanges || day.timeRanges.length === 0)) {
      return res.status(400).json({
        status: 400,
        message: `Please provide at least one time range for ${day.dayOfWeek}`,
      });
    }

    if (day.isAvailable && !day.price) {
      return res.status(400).json({
        status: 400,
        message: `Please set the price for ${day.dayOfWeek}`,
      });
    }

    // FIX #5: parentheses were wrong — only enforce range when the day is available
    if (day.isAvailable && (day.price < minPrice || day.price > maxPrice)) {
      throw new ApiError(400, `Price should be in the range ${minPrice} - ${maxPrice}`);
    }

    if (!day.isAvailable) continue; // no time-range checks for unavailable days

    for (let i = 0; i < day.timeRanges.length; i++) {
      const rangeI = day.timeRanges[i];

      const startI = parseSlotTime('2000-01-01', rangeI.startTime, 'UTC');
      // FIX #2: resolve midnight crossing on the dummy date
      let endI = parseSlotTime('2000-01-01', rangeI.endTime, 'UTC');
      endI = resolveEndTime(startI, endI);

      if (!startI.isBefore(endI)) {
        return res.status(400).json({
          status: 400,
          message: `Invalid time range: ${rangeI.startTime} - ${rangeI.endTime} for ${day.dayOfWeek}`,
        });
      }

      for (let j = 0; j < day.timeRanges.length; j++) {
        if (i === j) continue;

        const rangeJ = day.timeRanges[j];
        const startJ = parseSlotTime('2000-01-01', rangeJ.startTime, 'UTC');
        let endJ = parseSlotTime('2000-01-01', rangeJ.endTime, 'UTC');
        endJ = resolveEndTime(startJ, endJ);

        // Exact duplicate
        if (startI.isSame(startJ) && endI.isSame(endJ)) {
          return res.status(400).json({
            status: 400,
            message: `Duplicate time range: ${rangeI.startTime} - ${rangeI.endTime} for ${day.dayOfWeek}`,
          });
        }

        // Range i is contained within / contains range j
        if (
          (startI.isSame(startJ) && endI.isAfter(endJ)) ||
          (startI.isBefore(startJ) && endI.isSame(endJ)) ||
          (startI.isBefore(startJ) && endI.isAfter(endJ))
        ) {
          return res.status(400).json({
            status: 400,
            message: `Time range ${rangeJ.startTime} - ${rangeJ.endTime} is already covered by ${rangeI.startTime} - ${rangeI.endTime} for ${day.dayOfWeek}`,
          });
        }

        // Partial overlap
        if (
          (startI.isBefore(startJ) && endI.isAfter(startJ) && endI.isBefore(endJ)) ||
          (startI.isAfter(startJ) && startI.isBefore(endJ) && endI.isAfter(endJ))
        ) {
          return res.status(400).json({
            status: 400,
            message: `Time ranges ${rangeJ.startTime} - ${rangeJ.endTime} and ${rangeI.startTime} - ${rangeI.endTime} are overlapping for ${day.dayOfWeek}`,
          });
        }
      }
    }
  }

  // ── Persist ──
  await RecurringAvailability.deleteMany({ counselorId });

  for (let day of weeklyAvailability) {
    await RecurringAvailability.create({
      counselorId,
      dayOfWeek: day.dayOfWeek,
      isAvailable: day.isAvailable,
      timeRanges: day.isAvailable ? day.timeRanges : [],
      price: day.isAvailable ? day.price : 0,
    });
  }

  res.status(200).json({
    status: 200,
    message: 'Weekly availability set successfully',
  });
});

// ─────────────────────────────────────────────
// Get My Recurring Availability
// ─────────────────────────────────────────────
const getMyRecurringAvailability = wrapper(async (req, res) => {
  const counselorId = req.verifiedCounselorId._id;
  const availability = await RecurringAvailability.find({ counselorId });

  // FIX #6: find() returns [], never null
  if (!availability || availability.length === 0) {
    return res.status(404).json({
      status: 404,
      message: 'Availability has not been set',
    });
  }

  res.status(200).json({
    status: 200,
    availability,
  });
});

// ─────────────────────────────────────────────
// Generate Actual Slots From Recurring Availability
// ─────────────────────────────────────────────
const generatingActualSlotsFromRecurringAvailability = wrapper(async (req, res) => {
  const startDate = dayjs().tz(`${timeZone}`).startOf('day');
  const endDate = startDate.add(30, 'day').endOf('day');

  const counselorId = req.verifiedCounselorId._id;

  // FIX #4: preserve booked slots — only delete available/unavailable ones
  await GeneratedSlot.deleteMany({
    counselorId,
    status: { $in: ['available', 'unavailable'] },
  });

  let totalSlotsGenerated = 0;
  const weeklyAvailability = await RecurringAvailability.find({
    counselorId,
    isAvailable: true,
  });

  if (!weeklyAvailability.length) {
    return res.status(404).json({
      status: 404,
      message: 'No weekly availability found for this counselor',
    });
  }

  for (let date = startDate.clone(); date.isBefore(endDate); date = date.add(1, 'day')) {
    const dayOfWeek = date.format('dddd');
    const availability = weeklyAvailability.find((entry) => entry.dayOfWeek === dayOfWeek);
    if (!availability) continue;

    for (const range of availability.timeRanges) {
      const { startTime, endTime } = range;

      if (!startTime || !endTime) throw new ApiError(400, 'No startTime or endTime found');

      const dateStr = date.format('YYYY-MM-DD');

      let slotStart = parseSlotTime(dateStr, startTime, timeZone);
      // FIX #3: resolve midnight crossing for recurring ranges
      let slotEnd = parseSlotTime(dateStr, endTime, timeZone);
      slotEnd = resolveEndTime(slotStart, slotEnd);

      // ── Today-specific buffering logic ──
      if (date.isSame(startDate, 'day')) {
        const currentTime = dayjs().tz(`${timeZone}`);

        if (currentTime.isAfter(slotEnd) || currentTime.isSame(slotEnd)) {
          continue;
        } else if (currentTime.isAfter(slotStart) && currentTime.isBefore(slotEnd)) {
          const buffered = currentTime.add(timeBufferGenerateSlots, 'minute');
          if (slotEnd.diff(buffered, 'minute') >= slotDuration) {
            slotStart = buffered;
          } else {
            continue;
          }
        } else if (currentTime.isSame(slotStart)) {
          const buffered = currentTime.add(timeBufferGenerateSlots, 'minute');
          if (slotEnd.diff(buffered, 'minute') >= slotDuration) {
            slotStart = buffered;
          } else {
            continue;
          }
        } else if (slotStart.diff(currentTime, 'minute') < timeBufferGenerateSlots) {
          const gap = timeBufferGenerateSlots - slotStart.diff(currentTime, 'minute');
          slotStart = slotStart.add(gap, 'minute');
        }
      }

      let slotTime = slotStart.clone();

      while (
        slotTime.isBefore(slotEnd) &&
        slotTime.clone().add(slotDuration, 'minutes').isSameOrBefore(slotEnd)
      ) {
        const slotStartStr = slotTime;
        const slotEndStr = slotTime.clone().add(slotDuration, 'minute');

        const exists = await GeneratedSlot.exists({
          counselorId: new mongoose.Types.ObjectId(counselorId),
          startTime: slotStartStr.toDate(),
          endTime: slotEndStr.toDate(),
        });

        if (!exists) {
          const platformFee = availability.price * paltformFeePercentage;
          const totalPriceAfterPlatformFee = availability.price + platformFee;

          await GeneratedSlot.create({
            counselorId,
            startTime: slotStartStr.utc().toDate(),
            endTime: slotEndStr.utc().toDate(),
            basePrice: availability.price,
            totalPriceAfterPlatformFee,
          });
          totalSlotsGenerated++;
        }

        slotTime = slotTime.clone().add(slotDuration, 'minute');
      }
    }
  }

  return res.status(200).json({
    success: true,
    message: 'Slots generated successfully',
    totalSlotsGenerated,
  });
});

// ─────────────────────────────────────────────
// Get All Generated Slots
// ─────────────────────────────────────────────
const getAllgeneratedSlots = wrapper(async (req, res) => {
  const counselorId = req.verifiedCounselorId._id;
  const slots = await GeneratedSlot.find({ counselorId });

  // FIX #6: find() returns [], never null
  if (!slots || slots.length === 0) {
    return res.status(404).json({
      status: 404,
      message: 'No slots found',
    });
  }

  return res.status(200).json({
    status: 200,
    message: 'Slots fetched successfully',
    slots,
  });
});

// ─────────────────────────────────────────────
// Manage Slots of a Whole Day
// ─────────────────────────────────────────────
const managingSlotsOfADay = wrapper(async (req, res) => {
  const counselorId = req.verifiedCounselorId._id;
  const { date, status } = req.body;

  if (!date || !status) {
    return res.status(400).json({
      status: 400,
      message: 'Date and status are required',
    });
  }

  const possibleStatus = ['available', 'delete', 'unavailable'];
  if (!possibleStatus.includes(status)) {
    return res.status(400).json({
      status: 400,
      message: 'Invalid status passed',
    });
  }

  const startOfDay = dayjs.tz(date, timeZone).startOf('day').utc().toDate();
  const endOfDay = dayjs.tz(date, timeZone).endOf('day').utc().toDate();

  const requiredslots = await GeneratedSlot.find({
    counselorId,
    startTime: { $gte: startOfDay, $lte: endOfDay },
  });

  if (!requiredslots || requiredslots.length === 0) {
    return res.status(404).json({
      status: 404,
      message: `No slots found for date: ${date}`,
    });
  }

  for (let slot of requiredslots) {
    if (slot.status === 'booked') {
      return res.status(400).json({
        status: 400,
        message: "Cannot perform this operation — some slots on this day are already booked",
      });
    }
  }

  if (status === 'delete') {
    await GeneratedSlot.deleteMany({
      counselorId,
      startTime: { $gte: startOfDay, $lte: endOfDay },
    });
  } else {
    for (let slot of requiredslots) {
      slot.status = status;
      await slot.save({ validateBeforeSave: false });
    }
  }

  res.status(200).json({
    status: 200,
    message: 'Update successful',
  });
});

// ─────────────────────────────────────────────
// Manage an Individual Slot
// ─────────────────────────────────────────────
const managingIndividualSlot = wrapper(async (req, res) => {
  const counselorId = req.verifiedCounselorId._id;
  const { slotId, status } = req.body;

  if (!slotId || !status) {
    return res.status(400).json({
      status: 400,
      message: 'SlotId and status are required',
    });
  }

  const possibleStatus = ['available', 'delete', 'unavailable'];
  if (!possibleStatus.includes(status)) {
    return res.status(400).json({
      status: 400,
      message: 'Invalid status passed',
    });
  }

  const requiredSlot = await GeneratedSlot.findById(slotId);
  if (!requiredSlot) {
    return res.status(404).json({
      status: 404,
      message: 'No slot found for the given ID',
    });
  }

  // FIX #7: ownership check — counselor can only manage their own slots
  if (requiredSlot.counselorId.toString() !== counselorId.toString()) {
    return res.status(403).json({
      status: 403,
      message: 'You are not authorised to manage this slot',
    });
  }

  if (requiredSlot.status === 'booked') {
    return res.status(400).json({
      status: 400,
      message: "Cannot change status — this slot is already booked",
    });
  }

  if (status === 'delete') {
    await GeneratedSlot.deleteOne({ _id: slotId });
  } else {
    requiredSlot.status = status;
    await requiredSlot.save({ validateBeforeSave: false });
  }

  res.status(200).json({
    status: 200,
    message: 'Update successful',
  });
});

// ─────────────────────────────────────────────
// Add a Custom Slot
// ─────────────────────────────────────────────
const addCustomSlot = wrapper(async (req, res) => {
  const counselorId = req.verifiedCounselorId._id;
  const { date, startTime, endTime, price } = req.body;

  // ── Input validation ──
  if (!date || !startTime || !endTime || !price) {
    return res.status(400).json({
      status: 400,
      message: 'Date, start time, end time, and price are required',
    });
  }

  const priceNum = Number(price);
  if (isNaN(priceNum) || priceNum <= 0) {
    return res.status(400).json({
      status: 400,
      message: 'Price must be a valid positive number',
    });
  }

  // ── Counselor & price constraints ──
  const counselorData = await Counselor.findById(counselorId).select('-password');
  if (!counselorData) {
    throw new ApiError(401, 'Counselor not found. Please login again');
  }

  const priceData = await Price.findOne({
    experienceLevel: `${counselorData.experienceLevel}`,
  });
  if (!priceData) {
    throw new ApiError(500, 'Price configuration not found');
  }

  const { minPrice, maxPrice } = priceData;

  if (priceNum < minPrice || priceNum > maxPrice) {
    return res.status(400).json({
      status: 400,
      message: `Price must be between ₹${minPrice} and ₹${maxPrice} for your experience level`,
    });
  }

  // ── Parse & validate date/time ──
  try {
    const slotDate = dayjs.tz(date, timeZone);

    if (!slotDate.isValid()) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid date format provided',
      });
    }

    const today = dayjs().tz(timeZone).startOf('day');
    if (slotDate.isBefore(today)) {
      return res.status(400).json({
        status: 400,
        message: 'Cannot create slots for past dates',
      });
    }

    const dateStr = slotDate.format('YYYY-MM-DD');
    const slotStartTime = parseSlotTime(dateStr, startTime, timeZone);
    let slotEndTime = parseSlotTime(dateStr, endTime, timeZone);

    if (!slotStartTime.isValid() || !slotEndTime.isValid()) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid time format. Use a format like "9:00 AM" or "11:30 PM"',
      });
    }

    // FIX #1: resolve midnight crossing — e.g. 11:30 PM → 12:15 AM next day
    slotEndTime = resolveEndTime(slotStartTime, slotEndTime);

    const durationMinutes = slotEndTime.diff(slotStartTime, 'minute');
    if (durationMinutes !== slotDuration) {
      return res.status(400).json({
        status: 400,
        message: `Slot duration must be exactly ${slotDuration} minutes`,
      });
    }

    // ── Buffer check for today ──
    const currentTime = dayjs().tz(timeZone);
    if (slotDate.isSame(today, 'day')) {
      const minimumStartTime = currentTime.add(timeBufferGenerateSlots, 'minute');
      if (slotStartTime.isBefore(minimumStartTime)) {
        return res.status(400).json({
          status: 400,
          message: `Slot must start at least ${timeBufferGenerateSlots} minutes from now`,
        });
      }
    }

    // ── Duplicate check ──
    const existingSlot = await GeneratedSlot.findOne({
      counselorId: new mongoose.Types.ObjectId(counselorId),
      startTime: slotStartTime.utc().toDate(),
      endTime: slotEndTime.utc().toDate(),
    });

    if (existingSlot) {
      return res.status(409).json({
        status: 409,
        message: `A slot already exists for ${startTime} - ${endTime} on ${slotDate.format('MMM DD, YYYY')}`,
      });
    }

    // ── Overlap check ──
    const overlappingSlots = await GeneratedSlot.find({
      counselorId: new mongoose.Types.ObjectId(counselorId),
      $or: [
        {
          startTime: { $lt: slotEndTime.utc().toDate() },
          endTime: { $gt: slotStartTime.utc().toDate() },
        },
        {
          startTime: { $gte: slotStartTime.utc().toDate() },
          endTime: { $lte: slotEndTime.utc().toDate() },
        },
      ],
    });

    if (overlappingSlots.length > 0) {
      const overlappingSlot = overlappingSlots[0];
      const overlapStart = dayjs(overlappingSlot.startTime).tz(timeZone).format('hh:mm A');
      const overlapEnd = dayjs(overlappingSlot.endTime).tz(timeZone).format('hh:mm A');
      return res.status(409).json({
        status: 409,
        message: `This slot overlaps with an existing slot: ${overlapStart} - ${overlapEnd}`,
      });
    }

    // ── Create slot ──
    const platformFee = priceNum * paltformFeePercentage;
    const totalPriceAfterPlatformFee = priceNum + platformFee;

    const newSlot = await GeneratedSlot.create({
      counselorId,
      startTime: slotStartTime.utc().toDate(),
      endTime: slotEndTime.utc().toDate(),
      basePrice: priceNum,
      totalPriceAfterPlatformFee,
      status: 'available',
    });

    return res.status(201).json({
      status: 201,
      message: 'Slot created successfully',
      slot: {
        _id: newSlot._id,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime,
        basePrice: newSlot.basePrice,
        totalPriceAfterPlatformFee: newSlot.totalPriceAfterPlatformFee,
        status: newSlot.status,
      },
    });
  } catch (error) {
    console.error('Error in addCustomSlot:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        status: 409,
        message: 'A slot with this exact time already exists',
      });
    }

    throw new ApiError(500, 'Failed to create slot. Please try again');
  }
});

export {
  settingRecurringAvailability,
  getMyRecurringAvailability,
  generatingActualSlotsFromRecurringAvailability,
  getAllgeneratedSlots,
  managingIndividualSlot,
  managingSlotsOfADay,
  addCustomSlot,
};