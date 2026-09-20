import mongoose from 'mongoose';

const attendanceLogSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    role: {
      type: String,
      enum: ['client', 'counselor'],
      required: true,
    },
    event: {
      type: String,
      enum: ['join_intent', 'joined', 'heartbeat', 'left'],
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

attendanceLogSchema.index({ bookingId: 1, event: 1 });
attendanceLogSchema.index({ userId: 1, createdAt: -1 });

export const AttendanceLog =
  mongoose.models.AttendanceLog || mongoose.model('AttendanceLog', attendanceLogSchema);
