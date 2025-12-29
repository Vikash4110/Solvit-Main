/**
 * HEALTH CHECK ENDPOINT
 * Expose job status and metrics
 */

import { JobExecution } from '../../models/jobExecution.model.js';
import { FailedAction } from '../../models/failedAction.model.js';
import { Booking } from '../../models/booking-model.js';
import { logger } from '../../utils/logger.js';
import cronConfig from '../../config/cronConfig.js';
import { Payment } from '../../models/payment-model.js';
import { GeneratedSlot } from '../../models/generatedSlots-model.js';

export async function healthCheck() {
  try {
    // Test MongoDB connection
    await Booking.findOne().lean();

    // Get job execution stats
    const jobs = await JobExecution.find().lean();

    // Get failed actions count
    const failedActionsCount = await FailedAction.countDocuments({ resolved: false });

    // Get pending actions count
    const now = new Date();
    const pendingRoomDeletions = await Booking.countDocuments({
      'completion.disputeWindowOpenAt': { $lte: now },
      status: 'confirmed',
      roomId: { $exists: true },
    });

    const pendingCompletions = await Booking.countDocuments({
      'completion.autoCompleteAt': { $lte: now },
      status: 'dispute_window_open',
    });

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      nodeId: cronConfig.nodeId,
      services: {
        mongodb: 'connected',
        cronService: 'running',
      },
      jobs: jobs.reduce((acc, job) => {
        acc[job.jobName] = {
          lastRun: job.lastRun,
          lastStatus: job.lastStatus,
          executionCount: job.executionCount,
          consecutiveFailures: job.consecutiveFailures,
          lastDuration: job.lastDuration,
          lastProcessed: job.lastProcessed,
        };
        return acc;
      }, {}),
      pending: {
        roomDeletions: pendingRoomDeletions,
        bookingCompletions: pendingCompletions,
        failedActions: failedActionsCount,
        orphanedPayments: await Payment.countDocuments({
          // ✅ ADD THIS
          status: 'captured_unlinked',
          createdAt: {
            $lt: new Date(
              Date.now() - cronConfig.paymentReconciliation.orphanedThresholdMinutes * 60 * 1000
            ),
          },
        }),
        stuckSlots: await GeneratedSlot.countDocuments({
          // ✅ ADD THIS
          status: 'booked',
          isBooked: true,
          updatedAt: {
            $lt: new Date(
              Date.now() - cronConfig.paymentReconciliation.stuckSlotThresholdMinutes * 60 * 1000
            ),
          },
        }),
      },
    };
  } catch (error) {
    logger.error(`Health check failed: ${error.message}`);
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

export default healthCheck;
