/**
 * PAYMENT RECONCILIATION JOB - PRODUCTION OPTIMIZED
 * Features:
 * - Detect orphaned payments (captured but not linked to bookings)
 * - Unlock slots with missing/failed bookings
 * - Fix data inconsistencies
 * - Alert on anomalies
 * - Auto-refund stuck payments
 * Runs: Every 15 minutes
 */

import { Payment } from '../../models/payment-model.js';
import { Booking } from '../../models/booking-model.js';
import { GeneratedSlot } from '../../models/generatedSlots-model.js';
import { Session } from '../../models/session.model.js';

import { FailedAction } from '../../models/failedAction.model.js';
import { initiateRefund } from '../../controllers/payment-controller.js';
import JobLogger from '../utils/jobLogger.js';
import CronErrorHandler from '../utils/errorHandler.js';
import JobScheduler from '../utils/jobScheduler.js';
import AlertingService from '../utils/alerting.js';
import cronConfig from '../../config/cronConfig.js';
import dayjs from 'dayjs';
import pLimit from 'p-limit';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════
const ORPHANED_PAYMENT_THRESHOLD_MINUTES = 10; // Payments older than 10 min
const STUCK_SLOT_THRESHOLD_MINUTES = 15; // Slots locked > 15 min without booking
const MAX_PER_RUN = 100; // Process max 100 anomalies per run
const CONCURRENCY = 3; // Process 3 at a time (refunds are slow)

// ═══════════════════════════════════════════════════════════════
// PROCESS ORPHANED PAYMENTS
// ═══════════════════════════════════════════════════════════════
/**
 * Find payments that are captured_unlinked for too long
 * This indicates payment verification crashed/failed
 */
async function processOrphanedPayments(jobLogger) {
  const cutoffTime = dayjs().utc().subtract(ORPHANED_PAYMENT_THRESHOLD_MINUTES, 'minutes').toDate();

  const limit = pLimit(CONCURRENCY);
  let totalProcessed = 0;

  try {
    // Find orphaned payments
    const orphanedPayments = await Payment.find({
      status: 'captured_unlinked',
      createdAt: { $lt: cutoffTime },
    })
      .select('_id razorpay_payment_id amount clientId bookingId createdAt')
      .sort({ createdAt: 1 })
      .limit(MAX_PER_RUN)
      .lean();

    if (orphanedPayments.length === 0) {
      return totalProcessed;
    }

    jobLogger.incrementProcessed(orphanedPayments.length);

    // Alert if too many orphaned payments
    if (orphanedPayments.length >= 10) {
      await AlertingService.sendSlackAlert(
        'High Orphaned Payments Detected',
        `Found ${orphanedPayments.length} payments stuck in captured_unlinked state. ` +
          `This may indicate payment verification failures.`,
        'critical'
      );
    }

    // ✅ Process concurrently
    const promises = orphanedPayments.map((payment) =>
      limit(async () => {
        try {
          // Check if booking exists
          const booking = await Booking.findOne({ paymentId: payment._id });

          if (booking) {
            // Booking exists, just update payment status
            await Payment.findByIdAndUpdate(payment._id, {
              $set: {
                status: 'captured',
                bookingStatus: 'completed',
              },
            });

            jobLogger.incrementSucceeded();
            return { paymentId: payment._id, action: 'linked', success: true };
          }

          // No booking found - this is a real orphan
          // Check age - if > 30 minutes, initiate refund
          const ageMinutes = dayjs().diff(dayjs(payment.createdAt), 'minutes');

          if (ageMinutes > 30) {
            // Initiate refund with retry
            const paymentDoc = await Payment.findById(payment._id);

            const refundResult = await CronErrorHandler.withRetry(
              async () => {
                // Import initiateRefund from controller (make sure it's exported)
                // Or create a service for refunds
                return await initiateRefund(
                  paymentDoc,
                  'Payment orphaned - booking creation failed',
                  null
                );
              },
              {
                maxRetries: 2,
                operationName: `RefundOrphanedPayment-${payment._id}`,
              }
            );

            if (refundResult.success) {
              jobLogger.incrementSucceeded();
              return { paymentId: payment._id, action: 'refunded', success: true };
            } else {
              throw new Error(`Refund failed: ${refundResult.error}`);
            }
          } else {
            // Still within grace period, just log to FailedAction
            await FailedAction.create({
              type: 'orphaned_payment',
              paymentId: payment._id,
              razorpay_payment_id: payment.razorpay_payment_id,
              amount: payment.amount,
              ageMinutes,
              error: 'Payment captured but no booking created',
              metadata: {
                clientId: payment.clientId,
                createdAt: payment.createdAt,
              },
            });

            jobLogger.incrementSucceeded();
            return { paymentId: payment._id, action: 'logged', success: true };
          }
        } catch (error) {
          jobLogger.incrementFailed(error);

          // Log to FailedAction
          await FailedAction.create({
            type: 'orphaned_payment_processing_failed',
            paymentId: payment._id,
            error: error.message,
            errorStack: error.stack,
          });

          return { paymentId: payment._id, success: false };
        }
      })
    );

    await Promise.all(promises);
    totalProcessed += orphanedPayments.length;

    return totalProcessed;
  } catch (error) {
    jobLogger.incrementFailed(error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════
// PROCESS STUCK SLOTS
// ═══════════════════════════════════════════════════════════════
/**
 * Find slots that are marked as booked but have no valid booking
 * This happens when transaction fails but slot lock doesn't rollback
 */
async function processStuckSlots(jobLogger) {
  const cutoffTime = dayjs().utc().subtract(STUCK_SLOT_THRESHOLD_MINUTES, 'minutes').toDate();

  try {
    // Find slots that are booked
    const bookedSlots = await GeneratedSlot.find({
      status: 'booked',
      isBooked: true,
      updatedAt: { $lt: cutoffTime }, // Locked for > 15 minutes
    })
      .select('_id bookingId counselorId startTime endTime updatedAt')
      .limit(MAX_PER_RUN)
      .lean();

    if (bookedSlots.length === 0) {
      return 0;
    }

    jobLogger.incrementProcessed(bookedSlots.length);

    let unlocked = 0;

    for (const slot of bookedSlots) {
      try {
        // Check if valid booking exists
        const booking = await Booking.findOne({
          slotId: slot._id,
          status: 'confirmed',
        });

        if (!booking) {
          // No valid booking - unlock the slot
          await GeneratedSlot.findByIdAndUpdate(slot._id, {
            $set: {
              status: 'available',
              isBooked: false,
              bookingId: null,
            },
          });

          unlocked++;
          jobLogger.incrementSucceeded();

          // Log to FailedAction for audit
          await FailedAction.create({
            type: 'stuck_slot_unlocked',
            slotId: slot._id,
            error: 'Slot was locked but no valid booking found',
            metadata: {
              counselorId: slot.counselorId,
              startTime: slot.startTime,
              lockedDuration: dayjs().diff(dayjs(slot.updatedAt), 'minutes'),
            },
          });
        } else {
          // Valid booking exists, slot is correctly locked
          jobLogger.incrementSucceeded();
        }
      } catch (error) {
        jobLogger.incrementFailed(error);
      }
    }

    // Alert if too many stuck slots
    if (unlocked >= 5) {
      await AlertingService.sendSlackAlert(
        'High Stuck Slots Detected',
        `Unlocked ${unlocked} slots that were stuck without valid bookings. ` +
          `This may indicate transaction rollback issues.`,
        'warning'
      );
    }

    return unlocked;
  } catch (error) {
    jobLogger.incrementFailed(error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════
// PROCESS MISMATCHED BOOKINGS
// ═══════════════════════════════════════════════════════════════
/**
 * Find bookings where payment status doesn't match booking status
 */
async function processMismatchedBookings(jobLogger) {
  try {
    // Find payments stuck in pending_resources > 10 min
    const stuckPayments = await Payment.find({
      bookingStatus: 'pending_resources',
      createdAt: {
        $lt: dayjs().utc().subtract(10, 'minutes').toDate(),
      },
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

        const session = await Session.findOne({ bookingId: booking._id });

        if (session && session.videoSDKRoomId) {
          // Session exists → mark payment bookingStatus as completed
          await Payment.findByIdAndUpdate(payment._id, {
            $set: { bookingStatus: 'completed' },
          });
          fixed++;
          jobLogger.incrementSucceeded();
        } else {
          await FailedAction.create({
            type: 'payment_stuck_pending_resources',
            bookingId: booking._id,
            paymentId: payment._id,
            error: 'Payment stuck in pending_resources without session',
            metadata: {
              createdAt: payment.createdAt,
              ageMinutes: dayjs().diff(dayjs(payment.createdAt), 'minutes'),
            },
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

// ═══════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════
export async function reconcilePayments() {
  const jobLogger = new JobLogger('PaymentReconciliation');
  jobLogger.start();

  try {
    const orphanedProcessed = await processOrphanedPayments(jobLogger);
    const slotsUnlocked = await processStuckSlots(jobLogger);
    const bookingsFixed = await processMismatchedBookings(jobLogger);

    jobLogger.complete();

    // ✅ Update job execution record
    await JobScheduler.updateJobExecution('paymentReconciliation', {
      status: 'success',
      duration: Date.now() - jobLogger.startTime,
      processed: jobLogger.metrics.processed,
      succeeded: jobLogger.metrics.succeeded,
      failed: jobLogger.metrics.failed,
    });

    return {
      success: true,
      orphanedProcessed,
      slotsUnlocked,
      bookingsFixed,
    };
  } catch (error) {
    jobLogger.error(error);

    await JobScheduler.updateJobExecution('paymentReconciliation', {
      status: 'failed',
      duration: Date.now() - jobLogger.startTime,
      error: error.message,
    });

    throw error;
  }
}

export default reconcilePayments;
