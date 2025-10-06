import mongoose from 'mongoose';
const RecurringAvailabilitySchema = new mongoose.Schema(
  {
    counselorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Counselor',
      required: true,
      index: true,
    },
    dayOfWeek: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    timeRanges: [
      {
        startTime: { type: String }, // e.g., "10:00"
        endTime: { type: String },
      },
    ],
    price: {
      type: Number,
      required: true,
    },

    isAvailable: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

export const RecurringAvailability = mongoose.model(
  'RecurringAvailability',
  RecurringAvailabilitySchema
);
