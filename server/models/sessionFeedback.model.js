import mongoose from 'mongoose';

const sessionFeedbackSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true,
    },
    counselorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Counselor',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    callQualityRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate feedback from the same client on the same booking
sessionFeedbackSchema.index({ bookingId: 1, clientId: 1 }, { unique: true });

export const SessionFeedback = mongoose.model('SessionFeedback', sessionFeedbackSchema);
