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

const settingRecurringAvailability = wrapper(async (req, res) => {
  const counselorId = req.verifiedCounselorId._id;
  const { weeklyAvailability } = req.body;
  console.log(weeklyAvailability);

  const counselorData = await Counselor.findById(counselorId).select('-password');
  if (!counselorData) {
    throw new ApiError(400, 'No counselor found . Plz login again');
  }

  const priceData = await Price.findOne({
    experienceLevel: `${counselorData.experienceLevel}`,
  });
  if (!priceData) {
    throw new ApiError(400, 'No price info found');
  }

  const { minPrice, maxPrice } = priceData;

  if (!minPrice || !maxPrice) {
    throw new ApiError(400, 'Error : No minPrice or maxPrice is found');
  }

  if (!weeklyAvailability || weeklyAvailability.length !== 7) {
    return res.status(400).json({
      status: 400,
      message: 'Set availability for all days of the week',
    });
  }

  // Validate all days first before DB operations
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
        message: `Please provide at least one time slot for ${day.dayOfWeek}`,
      });
    }

    if (day.isAvailable && !day.price) {
      return res.status(400).json({
        status: 400,
        message: `Please set the price for ${day.dayOfWeek}`,
      });
    }

    if ((day.isAvailable && day.price < minPrice) || day.price > maxPrice) {
      throw new ApiError(400, `Price should be in the range ${minPrice} - ${maxPrice}`);
    }

    //checking that to same timeranges for the same day should not be there

    for (let i = 0; i < day.timeRanges.length; i++) {
      const timeStartTime = dayjs(
        `2000-01-01 ${day.timeRanges[i].startTime}`,
        'YYYY-MM-DD hh:mm A'
      ); //dummy date
      const timeEndTime = dayjs(`2000-01-01 ${day.timeRanges[i].endTime}`, 'YYYY-MM-DD hh:mm A');
      if (!timeStartTime.isBefore(timeEndTime)) {
        return res.status(400).json({
          status: 400,
          message: `Invalid time range : ${timeStartTime.format(
            'hh:mm A'
          )} - ${timeEndTime.format('hh:mm A')} for ${day.dayOfWeek}`,
        });
      }

      for (let j = 0; j < day.timeRanges.length; j++) {
        if (i === j) {
          continue;
        }
        const time1StartTime = dayjs(
          `2000-01-01 ${day.timeRanges[j].startTime}`,
          'YYYY-MM-DD hh:mm A'
        );
        const time1EndTime = dayjs(`2000-01-01 ${day.timeRanges[j].endTime}`, 'YYYY-MM-DD hh:mm A');
        if (timeStartTime.isSame(time1StartTime) && timeEndTime.isSame(time1EndTime)) {
          return res.status(400).json({
            status: 400,
            message: `Duplicate time range : ${day.timeRanges[i].startTime} - ${day.timeRanges[i].endTime} for ${day.dayOfWeek}`,
          });
        }
        if (
          (timeStartTime.isSame(time1StartTime) && timeEndTime.isAfter(time1EndTime)) ||
          (timeStartTime.isBefore(time1StartTime) && timeEndTime.isSame(time1EndTime)) ||
          (timeStartTime.isBefore(time1StartTime) && timeEndTime.isAfter(time1EndTime))
        ) {
          return res.status(400).json({
            status: 400,
            message: `The time range : ${day.timeRanges[j].startTime} - ${day.timeRanges[j].endTime} already covers in time range : ${day.timeRanges[i].startTime} - ${day.timeRanges[i].endTime} for ${day.dayOfWeek}`,
          });
        }
        if (
          (timeStartTime.isBefore(time1StartTime) &&
            timeEndTime.isBefore(time1EndTime) &&
            time1StartTime.isBefore(timeEndTime)) ||
          (timeStartTime.isAfter(time1StartTime) &&
            timeEndTime.isAfter(time1EndTime) &&
            timeStartTime.isBefore(time1EndTime))
        ) {
          return res.status(400).json({
            status: 400,
            message: `The time ranges : ${day.timeRanges[j].startTime} - ${day.timeRanges[j].endTime} and ${day.timeRanges[i].startTime} - ${day.timeRanges[i].endTime} are overlapping for ${day.dayOfWeek}`,
          });
        }
      }
    }
  }
  //Clean previous availability to avoid duplication
  await RecurringAvailability.deleteMany({ counselorId });

  // Save new availability
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

const getMyRecurringAvailability = wrapper(async (req, res) => {
  const counselorId = req.verifiedCounselorId._id;
  const availability = await RecurringAvailability.find({ counselorId });
  if (!availability) {
    return res.status(404).json({
      status: 404,
      message: 'Availability has been not set',
    });
  }
  res.status(200).json({
    status: 200,
    availability,
  });
});

const generatingActualSlotsFromRecurringAvailability = wrapper(async (req, res) => {
  const startDate = dayjs().tz(`${timeZone}`).startOf('day');
  const endDate = startDate.add(30, 'day').endOf('day');

  const counselorId = req.verifiedCounselorId._id;

  //deleting all prior slots
  await GeneratedSlot.deleteMany({ counselorId, status: 'booked' });

  let totalSlotsGenerated = 0;
  const weeklyAvailability = await RecurringAvailability.find({
    counselorId,
    isAvailable: true,
  });

  console.log(weeklyAvailability);

  if (!weeklyAvailability.length) {
    console.log('No Weekly Availabliy of the counselor is found');
    return res.status(404).json({
      status: 404,
      message: 'No Weekly Availabliy ofthe counselor is found',
    });
  }

  for (let date = startDate.clone(); date.isBefore(endDate); date = date.add(1, 'day')) {
    const dayOfWeek = date.format('dddd');

    const availability = weeklyAvailability.find((entry) => entry.dayOfWeek === dayOfWeek);

    if (!availability) continue;

    for (const range of availability.timeRanges) {
      const { startTime, endTime } = range;

      if (!endTime || !startTime) throw new ApiError(400, 'No StartTime or EndTime is found');

      let slotStart;
      let slotEnd;

      if (date.isSame(startDate)) {
        const currentTime = dayjs().tz(`${timeZone}`);
        slotStart = dayjs.tz(
          `${date.format('YYYY-MM-DD')} ${startTime}`,
          'YYYY-MM-DD hh:mm A',
          `${timeZone}`
        );
        slotEnd = dayjs.tz(
          `${date.format('YYYY-MM-DD')} ${endTime}`,
          'YYYY-MM-DD hh:mm A',
          `${timeZone}`
        );
        if (currentTime.isAfter(slotEnd) || currentTime.isSame(slotEnd)) {
          continue;
        } else if (currentTime.isBefore(slotEnd) && currentTime.isAfter(slotStart)) {
          const currentTimeWithBuffer = currentTime.clone().add(timeBufferGenerateSlots, 'minute');
          if (slotEnd.diff(currentTimeWithBuffer, 'minute') >= slotDuration) {
            slotStart = currentTimeWithBuffer.clone();
          } else {
            continue;
          }
        } else if (currentTime.isSame(slotStart)) {
          const nextPossible = currentTime.clone().add(timeBufferGenerateSlots, 'minute');
          if (slotEnd.diff(nextPossible, 'minute') >= slotDuration) {
            slotStart = nextPossible;
          } else {
            continue;
          }
        } else if (slotStart.diff(currentTime, 'minute') < timeBufferGenerateSlots) {
          slotStart = slotStart
            .clone()
            .add(timeBufferGenerateSlots - slotStart.clone().diff(currentTime, 'minute'), 'minute');
        }
      } else {
        slotStart = dayjs.tz(
          `${date.format('YYYY-MM-DD')} ${startTime}`,
          'YYYY-MM-DD hh:mm A',
          `${timeZone}`
        );
        slotEnd = dayjs.tz(
          `${date.format('YYYY-MM-DD')} ${endTime}`,
          'YYYY-MM-DD hh:mm A',
          `${timeZone}`
        );
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
          startTime: slotStartStr,
          endTime: slotEndStr,
        });

        const platformFee = availability.price * paltformFeePercentage;
        const totalPriceAfterPlatformFee = availability.price + platformFee;

        if (!exists) {
          await GeneratedSlot.create({
            counselorId,
            startTime: slotStartStr.utc(),
            endTime: slotEndStr.utc(),
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

//fetching the genrated slots
const getAllgeneratedSlots = wrapper(async (req, res) => {
  const counselorId = req.verifiedCounselorId._id;
  const slots = await GeneratedSlot.find({ counselorId });
  if (!slots) {
    return res.status(404).json({
      status: 404,
      message: 'no record found',
    });
  }
  console.log(slots);
  return res.status(200).json({
    status: 200,
    message: 'Slots fetched Successfully',
    slots,
  });
});

//below it pricing logic has not been implemented

//Managing the genereted slots (status) for a particular day
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
  // const slotDate = dayjs(date)
  const startOfDay = dayjs.tz(date, timeZone).startOf('day').utc().toDate();
  const endOfDay = dayjs.tz(date, timeZone).endOf('day').utc().toDate();

  const requiredslots = await GeneratedSlot.find({
    counselorId,
    startTime: { $gte: startOfDay, $lte: endOfDay },
  });

  if (!requiredslots || requiredslots.length === 0) {
    return res.status(404).json({
      status: 404,
      message: `No slots found for the Date: ${date}`,
    });
  }
  for (let slot of requiredslots) {
    if (slot.status === 'booked') {
      return res.status(400).json({
        status: 400,
        message: "Can't perform the operation as there are already booked slots also",
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
    message: `Updation Successfull!!`,
  });
});

//managing individual slot
const managingIndividualSlot = wrapper(async (req, res) => {
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
    return res.status(400).json({
      status: 400,
      message: 'No slot found for passed ID',
    });
  }
  if (requiredSlot.status === 'booked') {
    return res.status(400).json({
      status: 400,
      message: "Can't change status as it is booked",
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
    message: `Updation Successfull!!`,
  });
});

//// Add this new controller function to slotsManager-controller.js

const addCustomSlot = wrapper(async (req, res) => {
  const counselorId = req.verifiedCounselorId._id;
  const { date, startTime, endTime, price } = req.body;

  // ============ Input Validation ============
  if (!date || !startTime || !endTime || !price) {
    return res.status(400).json({
      status: 400,
      message: 'Date, start time, end time, and price are required',
    });
  }

  // Validate price is a number
  const priceNum = Number(price);
  if (isNaN(priceNum) || priceNum <= 0) {
    return res.status(400).json({
      status: 400,
      message: 'Price must be a valid positive number',
    });
  }

  // ============ Get Counselor & Price Constraints ============
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

  // Validate price is within allowed range
  if (priceNum < minPrice || priceNum > maxPrice) {
    return res.status(400).json({
      status: 400,
      message: `Price must be between ₹${minPrice} and ₹${maxPrice} for your experience level`,
    });
  }

  // ============ Parse and Validate Date/Time ============
  try {
    // Parse the date and times
    const slotDate = dayjs.tz(date, timeZone);

    // Validate date is valid
    if (!slotDate.isValid()) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid date format provided',
      });
    }

    // Check if date is in the past
    const today = dayjs().tz(timeZone).startOf('day');
    if (slotDate.isBefore(today)) {
      return res.status(400).json({
        status: 400,
        message: 'Cannot create slots for past dates',
      });
    }

    // Parse start and end times with the selected date
    const slotStartTime = dayjs.tz(
      `${slotDate.format('YYYY-MM-DD')} ${startTime}`,
      'YYYY-MM-DD hh:mm A',
      timeZone
    );

    const slotEndTime = dayjs.tz(
      `${slotDate.format('YYYY-MM-DD')} ${endTime}`,
      'YYYY-MM-DD hh:mm A',
      timeZone
    );

    // Validate parsed times
    if (!slotStartTime.isValid() || !slotEndTime.isValid()) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid time format. Use format like "9:00 AM" or "2:30 PM"',
      });
    }

    // Validate end time is after start time
    if (!slotEndTime.isAfter(slotStartTime)) {
      return res.status(400).json({
        status: 400,
        message: 'End time must be after start time',
      });
    }

    // Validate slot duration meets minimum requirement (from your constants)
    const durationMinutes = slotEndTime.diff(slotStartTime, 'minute');
    if (durationMinutes !== slotDuration) {
      return res.status(400).json({
        status: 400,
        message: `Slot duration must be exactly ${slotDuration} minutes`,
      });
    }

    // ============ Check for Past Time on Current Day ============
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

    // ============ Check for Duplicate Slots ============
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

    // ============ Check for Overlapping Slots ============
    const overlappingSlots = await GeneratedSlot.find({
      counselorId: new mongoose.Types.ObjectId(counselorId),
      $or: [
        // New slot starts during an existing slot
        {
          startTime: { $lt: slotEndTime.utc().toDate() },
          endTime: { $gt: slotStartTime.utc().toDate() },
        },
        // New slot completely contains an existing slot
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

    // ============ Calculate Platform Fee ============
    const platformFee = priceNum * paltformFeePercentage;
    const totalPriceAfterPlatformFee = priceNum + platformFee;

    // ============ Create the Slot ============
    const newSlot = await GeneratedSlot.create({
      counselorId,
      startTime: slotStartTime.utc().toDate(),
      endTime: slotEndTime.utc().toDate(),
      basePrice: priceNum,
      totalPriceAfterPlatformFee,
      status: 'available',
    });

    // ============ Return Success Response ============
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

    // Handle specific MongoDB errors
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
