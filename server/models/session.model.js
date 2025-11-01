import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },

    videoSDKRoomId: {
      type: String,
      required: true,
    },
    videoSDKRoomDeletionJobId: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ['scheduled', 'active', 'ended', 'cancelled'],
      default: 'scheduled',
    },

    // Timing Information
    scheduledStartTime: {
      type: Date,
      required: true,
    },

    scheduledEndTime: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
sessionSchema.index({ videoSDKMeetingId: 1 });
sessionSchema.index({ status: 1, scheduledStartTime: 1 });
sessionSchema.index({ 'participants.userId': 1 });

// Virtual for session duration in minutes
sessionSchema.virtual('durationInMinutes').get(function () {
  if (this.actualStartTime && this.actualEndTime) {
    return Math.round((this.actualEndTime - this.actualStartTime) / (1000 * 60));
  }
  return 0;
});

export const Session = mongoose.model('Session', sessionSchema);
