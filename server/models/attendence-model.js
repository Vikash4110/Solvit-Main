// models/attendance-log-model.js
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
      enum: ['join_intent', 'joined', 'heartbeat', 'left', 'forced_end'],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      ip: String,
      userAgent: String,
      sessionToken: String,
      duration: Number, // for heartbeat events
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
attendanceLogSchema.index({ bookingId: 1, timestamp: 1 });
attendanceLogSchema.index({ userId: 1, event: 1 });

export const AttendanceLog = mongoose.model('AttendanceLog', attendanceLogSchema);
