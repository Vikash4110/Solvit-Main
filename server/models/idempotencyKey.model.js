import mongoose from 'mongoose';

const idempotencyKeySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  requestType: {
    type: String,
    enum: ['checkout', 'verify', 'refund'],
    required: true,
  },
  requestData: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  responseData: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing',
  },
  attempts: {
    type: Number,
    default: 1,
  },
  lastAttemptAt: {
    // ✅ ADD THIS FIELD
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // Auto-delete after 24 hours
  },
  completedAt: {
    type: Date,
  },
});

export const IdempotencyKey = mongoose.model('IdempotencyKey', idempotencyKeySchema);
