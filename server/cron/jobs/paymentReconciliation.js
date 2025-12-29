// jobs/paymentReconciliation.js

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { Payment } from '../../models/payment-model.js';
import { Booking } from '../../models/booking-model.js';
import { initiateRefund } from '../../services/refundService.js'; // ✅ Import from service
import { logger } from '../../utils/logger.js';
import pLimit from 'p-limit';

dayjs.extend(utc);

const limit = pLimit(5); // Process 5 refunds concurrently

class JobLogger {
  constructor(jobName) {
    this.jobName = jobName;
    this.startTime = null;
    this.processed = 0;
    this.succeeded = 0;
    this.failed = 0;
    this.errors = [];
  }

  start() {
    this.startTime = Date.now();
    logger.info(`[${this.jobName}] Job started`);
  }

  incrementProcessed(count = 1) {
    this.processed += count;
  }

  incrementSucceeded() {
    this.succeeded++;
  }

  incrementFailed(error) {
    this.failed++;
    this.errors.push(error.message || error);
  }

  complete() {
    const duration = Date.now() - this.startTime;
    logger.info(`[${this.jobName}] Job completed`, {
      duration: `${duration}ms`,
      processed: this.processed,
      succeeded: this.succeeded,
      failed: this.failed,
    });

    if (this.errors.length > 0) {
      logger.error(`[${this.jobName}] Errors:`, this.errors.slice(0, 10));
    }
  }
}

/**
 * Process orphaned payments (captured but no booking after 30 minutes)
 */
async function processOrphanedPayments(jobLogger) {
  try {
    const cutoffTime = dayjs().utc().subtract(30, 'minutes').toDate();

    const orphanedPayments = await Payment.find({
      status: 'captured_unlinked',
      bookingStatus: 'payment_captured',
      createdAt: { $lt: cutoffTime },
    })
      .select('_id razorpay_payment_id amount createdAt clientId slotId')
      .limit(50)
      .lean();

    if (orphanedPayments.length === 0) {
      return 0;
    }

    jobLogger.incrementProcessed(orphanedPayments.length);

    const refundPromises = orphanedPayments.map((paymentDoc) =>
      limit(async () => {
        try {
          const ageMinutes = dayjs().diff(dayjs(paymentDoc.createdAt), 'minutes');

          logger.info(`Processing orphaned payment: ${paymentDoc._id}, age: ${ageMinutes}min`);

          const result = await initiateRefund(
            paymentDoc,
            'booking_failed',
            `phase=CRON_RECONCILIATION | age=${ageMinutes}min | threshold=30min`,
            null,
            3,
            logger
          );

          if (result.success) {
            jobLogger.incrementSucceeded();
          } else {
            jobLogger.incrementFailed(new Error(result.error));
          }
        } catch (error) {
          jobLogger.incrementFailed(error);
          logger.error(`Orphaned payment refund failed: ${paymentDoc._id}`, error);
        }
      })
    );

    await Promise.all(refundPromises);
    return orphanedPayments.length;
  } catch (error) {
    jobLogger.incrementFailed(error);
    throw error;
  }
}

/**
 * Process stuck payments (pending_resources for > 10 minutes)
 */
async function processMismatchedBookings(jobLogger) {
  try {
    const stuckPayments = await Payment.find({
      bookingStatus: 'pending_resources',
      createdAt: { $lt: dayjs().utc().subtract(10, 'minutes').toDate() },
    })
      .select('_id bookingId createdAt')
      .limit(50)
      .lean();

    if (stuckPayments.length === 0) return 0;

    jobLogger.incrementProcessed(stuckPayments.length);
    let fixed = 0;

    for (const payment of stuckPayments) {
      try {
        const booking = await Booking.findById(payment.bookingId).lean();
        if (!booking) continue;

        // ✅ Check videoSDKRoomId directly on booking (no Session model)
        if (booking.videoSDKRoomId) {
          await Payment.findByIdAndUpdate(payment._id, {
            $set: { bookingStatus: 'completed' },
          });
          fixed++;
          jobLogger.incrementSucceeded();
        } else {
          // Still no VideoSDK room - needs manual intervention
          logger.warn(`Booking ${booking._id} has no VideoSDK room`, {
            paymentId: payment._id,
            ageMinutes: dayjs().diff(dayjs(payment.createdAt), 'minutes'),
          });
          jobLogger.incrementSucceeded();
        }
      } catch (error) {
        jobLogger.incrementFailed(error);
      }
    }

    return fixed;
  } catch (error) {
    jobLogger.incrementFailed(error);
    throw error;
  }
}

/**
 * Main reconciliation function
 */
export async function reconcilePayments() {
  const jobLogger = new JobLogger('PaymentReconciliation');
  jobLogger.start();

  try {
    const [orphanedCount, mismatchedCount] = await Promise.all([
      processOrphanedPayments(jobLogger),
      processMismatchedBookings(jobLogger),
    ]);

    jobLogger.complete();

    return {
      success: true,
      orphanedProcessed: orphanedCount,
      mismatchedFixed: mismatchedCount,
      totalProcessed: jobLogger.processed,
      succeeded: jobLogger.succeeded,
      failed: jobLogger.failed,
    };
  } catch (error) {
    logger.error('Payment reconciliation failed:', error);
    jobLogger.complete();

    return {
      success: false,
      error: error.message,
    };
  }
}
