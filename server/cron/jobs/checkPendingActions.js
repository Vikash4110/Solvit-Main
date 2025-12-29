/**
 * CHECK PENDING ACTIONS - PRODUCTION OPTIMIZED
 * Features:
 * - Concurrent API calls (5-10 at a time)
 * - Bulk database updates
 * - Rate limit handling
 * - Failed action tracking
 */

import { Booking } from '../../models/booking-model.js';
import { Session } from '../../models/session.model.js';
import { FailedAction } from '../../models/failedAction.model.js';
import VideoSDKService from '../../services/videoSDK.service.js';
import JobLogger from '../utils/jobLogger.js';
import CronErrorHandler from '../utils/errorHandler.js';
import JobScheduler from '../utils/jobScheduler.js';
import cronConfig from '../../config/cronConfig.js';
import dayjs from 'dayjs';
import pLimit from 'p-limit'; // npm install p-limit
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);
/**
 * Process room deletions with concurrency
 */
async function processRoomDeletions(jobLogger) {
  const now = dayjs().utc().toDate();

  const { batchSize, concurrency, rateLimitDelay } = cronConfig.pendingActions;

  // ✅ Concurrent limiter (process how many api call at a time at a time)
  const limit = pLimit(concurrency);

  let totalProcessed = 0;
  let hasMore = true;

  while (hasMore && totalProcessed < cronConfig.pendingActions.maxPerRun) {
    // Fetch batch
    const roomsToDelete = await Booking.find({
      'completion.disputeWindowOpenAt': { $lte: now },
      status: 'confirmed',
    })
      .select('_id sessionId slotId status')
      .populate('sessionId')
      .sort({ 'completion.disputeWindowOpenAt': 1 })
      .limit(batchSize)
      .lean();
    console.log(roomsToDelete);
    if (roomsToDelete.length === 0) {
      hasMore = false;
      break;
    }

    // ✅ Process concurrently
    const promises = roomsToDelete.map((booking) =>
      limit(async () => {
        jobLogger.incrementProcessed();

        try {
          // Delete room with retry
          await CronErrorHandler.withRetry(
            async () => VideoSDKService.deleteRoom(booking.sessionId?.videoSDKRoomId),
            {
              operationName: `DeleteRoom-${booking.sessionId?.videoSDKRoomId}`,
            }
          );

          jobLogger.incrementSucceeded();

          return { bookingId: booking._id, success: true };
        } catch (error) {
          jobLogger.incrementFailed(error);

          // ✅ Log to FailedAction for manual review
          await FailedAction.create({
            type: 'room_deletion',
            bookingId: booking._id,
            roomId: booking.sessionId?.videoSDKRoomId,
            error: error.message,
            errorStack: error.stack,
          });

          return { bookingId: booking._id, success: false };
        }
      })
    );

    const results = await Promise.all(promises);

    // ✅ Bulk update successful bookings to 'dispute_window_open'
    const successfulIds = results.filter((r) => r.success).map((r) => r.bookingId);

    if (successfulIds.length > 0) {
      await Booking.updateMany(
        { _id: { $in: successfulIds } },
        {
          $set: {
            status: 'dispute_window_open',
          },
        }
      );
    }

    totalProcessed += roomsToDelete.length;

    // ✅ Rate limit delay between batches
    if (hasMore) {
      await new Promise((resolve) => setTimeout(resolve, rateLimitDelay));
    }
  }

  return totalProcessed;
}

/**
 * Process auto-completions (similar optimization)
 */
async function processAutoCompletions(jobLogger) {
  const now = dayjs().utc().toDate();
  const { batchSize } = cronConfig.pendingActions;

  let totalProcessed = 0;
  let hasMore = true;

  while (hasMore && totalProcessed < cronConfig.pendingActions.maxPerRun) {
    const bookingsToComplete = await Booking.find({
      'completion.autoCompleteAt': { $lte: now },
      status: 'dispute_window_open',
      'dispute.isDisputed': false,
    })
      .select('_id slotId sessionId status')
      .sort({ 'completion.autoCompleteAt': 1 })
      .limit(batchSize)
      .lean();

    if (bookingsToComplete.length === 0) {
      hasMore = false;
      break;
    }

    // ✅ Bulk update all at once
    try {
      const bookingIds = bookingsToComplete.map((b) => b._id);

      await Booking.updateMany(
        { _id: { $in: bookingIds } },
        {
          $set: {
            status: 'completed',
            'completion.completedAt': now,
            'payout.status': 'pending',
          },
        }
      );

      // Update payout amounts individually (can't bulk update with different values easily)
      for (const booking of bookingsToComplete) {
        await Booking.updateOne(
          { _id: booking._id },
          {
            $set: {
              'payout.amountToPayToCounselor': Number(booking.slotData?.basePrice),
            },
          }
        );
      }

      jobLogger.incrementProcessed(bookingsToComplete.length);
      jobLogger.incrementSucceeded(bookingsToComplete.length);
    } catch (error) {
      jobLogger.incrementFailed(error);
    }

    totalProcessed += bookingsToComplete.length;
  }

  return totalProcessed;
}

/**
 * Main execution
 */
export async function checkPendingActions() {
  const jobLogger = new JobLogger('CheckPendingActions');
  jobLogger.start();

  try {
    const roomsProcessed = await processRoomDeletions(jobLogger);
    const bookingsProcessed = await processAutoCompletions(jobLogger);

    jobLogger.complete();

    // ✅ Update job execution record
    await JobScheduler.updateJobExecution('pendingActions', {
      status: 'success',
      duration: Date.now() - jobLogger.startTime,
      processed: jobLogger.metrics.processed,
      succeeded: jobLogger.metrics.succeeded,
      failed: jobLogger.metrics.failed,
    });

    return { success: true, roomsProcessed, bookingsProcessed };
  } catch (error) {
    jobLogger.error(error);

    await JobScheduler.updateJobExecution('pendingActions', {
      status: 'failed',
      duration: Date.now() - jobLogger.startTime,
      error: error.message,
    });

    throw error;
  }
}

export default checkPendingActions;
