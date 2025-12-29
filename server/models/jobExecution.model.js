/**
 * JOB EXECUTION TRACKING
 * Replaces file-based tracker for production
 */

import mongoose from 'mongoose';

const jobExecutionSchema = new mongoose.Schema(
  {
    jobName: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    lastRun: {
      type: Date,
      required: true,
    },
    lastStatus: {
      type: String,
      enum: ['success', 'failed', 'running'],
      default: 'success',
    },
    executionCount: {
      type: Number,
      default: 0,
    },
    consecutiveFailures: {
      type: Number,
      default: 0,
    },
    lastDuration: {
      type: Number, // milliseconds
      default: 0,
    },
    lastProcessed: {
      type: Number,
      default: 0,
    },
    lastSucceeded: {
      type: Number,
      default: 0,
    },
    lastFailed: {
      type: Number,
      default: 0,
    },
    lastError: {
      type: String,
      default: null,
    },
    nodeId: {
      type: String, // Which node executed
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Index for queries
jobExecutionSchema.index({ jobName: 1, lastRun: -1 });

export const JobExecution = mongoose.model('JobExecution', jobExecutionSchema);
