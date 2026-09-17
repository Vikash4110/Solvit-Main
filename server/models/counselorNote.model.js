import mongoose from 'mongoose';

const counselorNoteSchema = new mongoose.Schema(
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
    counselorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Counselor',
      required: true,
      index: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true,
    },
    notes: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate notes from the same counselor on the same booking (allow update)
counselorNoteSchema.index({ bookingId: 1, counselorId: 1 }, { unique: true });

export const CounselorNote = mongoose.model('CounselorNote', counselorNoteSchema);
