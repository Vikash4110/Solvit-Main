/**
 * FAILED ACTION TRACKING
 * Persistent storage for actions that need manual review
 */

import mongoose from 'mongoose';

const failedActionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        'room_deletion',
        'booking_completion',
        'slot_creation',
        'slot_deletion',
        'counselors_missing_slots',
      ],
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      index: true,
    },
    roomId: {
      type: String,
      default: null,
    },
    error: {
      type: String,
      required: true,
    },
    errorStack: {
      type: String,
      default: null,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    lastRetryAt: {
      type: Date,
      default: null,
    },
    resolved: {
      type: Boolean,
      default: false,
      index: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: String, // 'auto' or admin user ID
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Compound index for efficient queries
failedActionSchema.index({ resolved: 1, createdAt: -1 });
failedActionSchema.index({ type: 1, resolved: 1 });

export const FailedAction = mongoose.model('FailedAction', failedActionSchema);
