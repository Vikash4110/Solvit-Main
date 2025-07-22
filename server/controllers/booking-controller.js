import {wrapper} from '../utils/wrapper.js'
import { RecurringAvailability } from '../models/recurringAvailability-model.js'

/*
input from frontend example

{
  "counselorId": "abc123", // it can be fetched form middleware
  
  "weeklyAvailability": [
    {
      "dayOfWeek": "Monday",
      "timeRanges": [
        { "startTime": "10:00", "endTime": "12:00" }
      ],
      "slotDuration": 30,
      "bufferTime": 5,
      "isAvailable": true,
    },
    {
      "dayOfWeek": "Wednesday",
      "timeRanges": [
        { "startTime": "14:00", "endTime": "17:30" },
        { "startTime": "19:00", "endTime": "21:00" }
      ],
      "slotDuration": 30,
      "bufferTime": 0,
      "isAvailable": true,
    },
    {
      "dayOfWeek": "Friday",
      "timeRanges": [
        { "startTime": "09:30", "endTime": "11:00" }
      ],
      "slotDuration": 20,
      "bufferTime": 10,
      "isAvailable": flase
    }
  ]
}*/
const settingRecurringAvailability = wrapper(async (req, res) => {
  const counselorId = req.verifiedClientId;
  const { weeklyAvailability } = req.body;

  if (!weeklyAvailability || weeklyAvailability.length!==7) {
    return res.status(400).json({
      status: 400,
      message: "Set availability for all days of the week",
    });
  }

  // Validate all days first before DB operations
  for (let day of weeklyAvailability) {
    if (!day.dayOfWeek) {
      return res.status(400).json({
        status: 400,
        message: "Day of the week is required",
      });
    }

    if (day.isAvailable && (!day.timeRanges || day.timeRanges.length === 0)) {
      return res.status(400).json({
        status: 400,
        message: `Please provide at least one time slot for ${day.dayOfWeek}`,
      });
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
    });
  }

  res.status(200).json({
    status: 200,
    message: "Recurring availability set successfully",
  });
});


const updateRecurringAvailability = wrapper(async (req, res) => {
  const counselorId = req.verifiedClientId;
  const { updatedWeeklyAvailability } = req.body;

  if (!updatedWeeklyAvailability || updatedWeeklyAvailability.length === 0) {
    return res.status(400).json({
      status: 400,
      message: "Update availability for at least one day",
    });
  }

  // Check if any existing record exists for counselor
  const availabilityExists = await RecurringAvailability.findOne({ counselorId });
  if (!availabilityExists) {
    return res.status(400).json({
      status: 400,
      message: "Please set availability first before updating it",
    });
  }

  // First, validate all days
  for (let day of updatedWeeklyAvailability) {
    if (!day.dayOfWeek) {
      return res.status(400).json({
        status: 400,
        message: "Day of the week is required",
      });
    }

    if (day.isAvailable && (!day.timeRanges || day.timeRanges.length === 0)) {
      return res.status(400).json({
        status: 400,
        message: `Please provide at least one time slot for ${day.dayOfWeek}`,
      });
    }
  }

  // performing updates
  for (let day of updatedWeeklyAvailability) {
    const current = await RecurringAvailability.findOne({ counselorId, dayOfWeek: day.dayOfWeek });
    if (!current) {
      return res.status(400).json({
        status: 400,
        message: `No entry found for ${day.dayOfWeek}`,
      });
    }

    current.isAvailable = day.isAvailable;
    current.timeRanges = day.isAvailable ? day.timeRanges : [];
    await current.save({ validateBeforeSave: false });
  }

  return res.status(200).json({
    status: 200,
    message: "Weekly availability updated successfully",
  });
});



export { settingRecurringAvailability ,updateRecurringAvailability};
