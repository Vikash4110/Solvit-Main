import mongoose from 'mongoose';
const GeneratedSlotSchema = new mongoose.Schema(
  {
    counselorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Counselor',
      required: true,
      index: true,
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      required: true,
      index: true,
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    status: {
      type: String,
      enum: ['available', 'booked', 'unavailable'],
      default: 'available',
    },
    basePrice: {
      type: Number,
      required: true,
    },
    totalPriceAfterPlatformFee: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);
GeneratedSlotSchema.index(
  { counselorId: 1, startTime: 1 },
  {
    unique: true,
    name: 'unique_slot_per_counselor',
  }
);
export const GeneratedSlot = mongoose.model('GeneratedSlot', GeneratedSlotSchema);
