/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SLOT MANAGEMENT JOB - PRODUCTION OPTIMIZED
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * - Generates 31st day slots for all counselors based on recurring availability
 * - Deletes old unbooked slots (before current time)
 * - Triple-layer duplicate prevention (pre-check + upsert + unique index)
 * - Concurrent processing (10 counselors at a time)
 * - Bulk database operations (100 slots per batch)
 * - Comprehensive error handling with retry logic
 * - Failed action tracking for manual review
 * - Slack alerts on anomalies
 * - Health checks for data integrity
 *
 * Runs: Daily at midnight (00:00 Asia/Kolkata)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { RecurringAvailability } from '../../models/recurringAvailability-model.js';
import { GeneratedSlot } from '../../models/generatedSlots-model.js';
import { Counselor } from '../../models/counselor-model.js';
import { FailedAction } from '../../models/failedAction.model.js';
import JobLogger from '../utils/jobLogger.js';
import CronErrorHandler from '../utils/errorHandler.js';
import JobScheduler from '../utils/jobScheduler.js';
import AlertingService from '../utils/alerting.js';
import cronConfig from '../../config/cronConfig.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import pLimit from 'p-limit';
import mongoose from 'mongoose';
import { logger } from '../../utils/logger.js';
import { timeZone, slotDuration, paltformFeePercentage } from '../../constants.js';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const TIMEZONE = timeZone;
const SLOT_DURATION = slotDuration; // minutes
const PLATFORM_FEE_PERCENTAGE = paltformFeePercentage; // 15%
const DAYS_AHEAD = cronConfig.slotManagement.daysAhead; // Always maintain 30 days of slots
const CONCURRENCY = cronConfig.slotManagement.concurrency; // Process 10 counselors at a time
const BULK_INSERT_SIZE = cronConfig.slotManagement.bulkInsertSize; // Insert slots in batches of 100

// ═══════════════════════════════════════════════════════════════════════════
// ADD NEW SLOTS (31st DAY)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate slots for the 31st day for all counselors
 * Based on their recurring availability settings
 */
async function addSlotsFor31stDay(jobLogger) {
  try {
    // Calculate the 31st day from now
    const today = dayjs().tz(TIMEZONE).startOf('day');
    const targetDate = today.add(DAYS_AHEAD, 'day'); // Day 31
    const targetDayOfWeek = targetDate.format('dddd'); // e.g., "Monday"

    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info(
      `[SlotManagement] 📅 Generating slots for ${targetDate.format('YYYY-MM-DD')} (${targetDayOfWeek})`
    );
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Get all active counselors
    const activeCounselors = await Counselor.find({
      isBlocked: { $ne: true },
    })
      .select('_id')
      .lean();

    if (activeCounselors.length === 0) {
      logger.info('[SlotManagement] ⚠️ No active counselors found');
      return 0;
    }

    logger.info(`[SlotManagement] 👥 Processing ${activeCounselors.length} counselors`);
    jobLogger.incrementProcessed(activeCounselors.length);

    // ✅ Concurrent processing with p-limit
    const limit = pLimit(CONCURRENCY);
    let totalSlotsCreated = 0;
    let totalSlotsSkipped = 0;
    let counselorsWithSlots = 0;
    let counselorsWithErrors = 0;

    const promises = activeCounselors.map((counselor) =>
      limit(async () => {
        try {
          const result = await generateSlotsForCounselor(
            counselor._id,
            targetDate,
            targetDayOfWeek,
            jobLogger
          );

          totalSlotsCreated += result.inserted;
          totalSlotsSkipped += result.skipped;

          if (result.inserted > 0) {
            counselorsWithSlots++;
          }

          jobLogger.incrementSucceeded();
          return { counselorId: counselor._id, ...result, success: true };
        } catch (error) {
          counselorsWithErrors++;
          jobLogger.incrementFailed(error);

          // Log to FailedAction for manual review
          await FailedAction.create({
            type: 'slot_generation_failed',
            counselorId: counselor._id,
            targetDate: targetDate.toDate(),
            error: error.message,
            errorStack: error.stack,
            metadata: {
              dayOfWeek: targetDayOfWeek,
              timestamp: new Date(),
            },
          });

          logger.error(
            `[SlotManagement] ❌ Failed for counselor ${counselor._id}: ${error.message}`
          );
          return { counselorId: counselor._id, success: false, error: error.message };
        }
      })
    );

    await Promise.all(promises);

    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('[SlotManagement] 📊 Generation Summary:');
    logger.info(`  • Total counselors processed: ${activeCounselors.length}`);
    logger.info(`  • Counselors with new slots: ${counselorsWithSlots}`);
    logger.info(`  • Counselors with errors: ${counselorsWithErrors}`);
    logger.info(`  • Slots created: ${totalSlotsCreated}`);
    logger.info(`  • Slots skipped (duplicates): ${totalSlotsSkipped}`);
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Alert if high error rate
    if (counselorsWithErrors > activeCounselors.length * 0.1) {
      await AlertingService.sendSlackAlert(
        'High Slot Generation Error Rate',
        `${counselorsWithErrors} out of ${activeCounselors.length} counselors failed slot generation (${Math.round((counselorsWithErrors / activeCounselors.length) * 100)}%)`,
        'warning'
      );
    }

    return totalSlotsCreated;
  } catch (error) {
    jobLogger.incrementFailed(error);
    logger.error(`[SlotManagement] ❌ Critical error in addSlotsFor31stDay: ${error.message}`);
    throw error;
  }
}

/**
 * Generate slots for a single counselor on a specific date
 * with triple-layer duplicate prevention
 */
async function generateSlotsForCounselor(counselorId, targetDate, targetDayOfWeek, jobLogger) {
  // Get counselor's recurring availability for this day
  const availability = await RecurringAvailability.findOne({
    counselorId,
    dayOfWeek: targetDayOfWeek,
    isAvailable: true,
  }).lean();

  if (!availability || !availability.timeRanges || availability.timeRanges.length === 0) {
    // This is normal - counselor may not have availability for this day
    logger.debug(
      `[SlotManagement] No availability for counselor ${counselorId} on ${targetDayOfWeek}`
    );
    return { inserted: 0, skipped: 0 };
  }

  // ═══════════════════════════════════════════════════════════════
  // DUPLICATE PREVENTION LAYER 1: Pre-check existing slots
  // ═══════════════════════════════════════════════════════════════

  const startOfTargetDay = targetDate.clone().startOf('day').utc().toDate();
  const endOfTargetDay = targetDate.clone().endOf('day').utc().toDate();

  const existingSlots = await GeneratedSlot.find({
    counselorId,
    startTime: { $gte: startOfTargetDay, $lte: endOfTargetDay },
  })
    .select('startTime')
    .lean();

  // Create a Set for O(1) lookup performance
  const existingSlotTimes = new Set(existingSlots.map((slot) => slot.startTime.toISOString()));

  logger.info(
    `[SlotManagement] 🔍 Counselor ${counselorId}: Found ${existingSlotTimes.size} existing slots on ${targetDate.format('YYYY-MM-DD')}`
  );

  const slotsToCreate = [];
  let duplicatesSkippedInMemory = 0;

  // ═══════════════════════════════════════════════════════════════
  // Generate slots from time ranges
  // ═══════════════════════════════════════════════════════════════

  for (const range of availability.timeRanges) {
    const { startTime, endTime } = range;

    if (!startTime || !endTime) {
      logger.warn(
        `[SlotManagement] ⚠️ Invalid time range for counselor ${counselorId}: ` +
          `startTime=${startTime}, endTime=${endTime}`
      );
      continue;
    }

    // Parse start and end times for the target date
    const rangeStart = dayjs.tz(
      `${targetDate.format('YYYY-MM-DD')} ${startTime}`,
      'YYYY-MM-DD hh:mm A',
      TIMEZONE
    );

    const rangeEnd = dayjs.tz(
      `${targetDate.format('YYYY-MM-DD')} ${endTime}`,
      'YYYY-MM-DD hh:mm A',
      TIMEZONE
    );

    // Validate parsed times
    if (!rangeStart.isValid() || !rangeEnd.isValid()) {
      logger.warn(
        `[SlotManagement] ⚠️ Failed to parse times for counselor ${counselorId}: ` +
          `${startTime} - ${endTime}`
      );
      continue;
    }

    if (rangeEnd.isSameOrBefore(rangeStart)) {
      logger.warn(
        `[SlotManagement] ⚠️ End time before/equal to start time for counselor ${counselorId}: ` +
          `${startTime} - ${endTime}`
      );
      continue;
    }

    // Generate 45-minute slots within this time range
    let slotStart = rangeStart.clone();

    while (
      slotStart.isBefore(rangeEnd) &&
      slotStart.clone().add(SLOT_DURATION, 'minutes').isSameOrBefore(rangeEnd)
    ) {
      const slotEnd = slotStart.clone().add(SLOT_DURATION, 'minutes');
      const slotStartUTC = slotStart.utc().toDate();
      const slotStartISO = slotStartUTC.toISOString();

      // ═══════════════════════════════════════════════════════════════
      // DUPLICATE PREVENTION LAYER 2: In-memory check
      // ═══════════════════════════════════════════════════════════════

      if (existingSlotTimes.has(slotStartISO)) {
        duplicatesSkippedInMemory++;
        logger.debug(
          `[SlotManagement] ⏭️ Skipping duplicate slot: ${slotStart.format('YYYY-MM-DD HH:mm')} ` +
            `(counselor ${counselorId})`
        );
        slotStart = slotStart.add(SLOT_DURATION, 'minutes');
        continue; // Skip this slot
      }

      // Calculate pricing
      const platformFee = availability.price * PLATFORM_FEE_PERCENTAGE;
      const totalPriceAfterPlatformFee = availability.price + platformFee;

      slotsToCreate.push({
        counselorId: new mongoose.Types.ObjectId(counselorId),
        startTime: slotStartUTC,
        endTime: slotEnd.utc().toDate(),
        basePrice: availability.price,
        totalPriceAfterPlatformFee,
        status: 'available',
      });

      slotStart = slotStart.add(SLOT_DURATION, 'minutes');
    }
  }

  // Check if there are any new slots to create
  if (slotsToCreate.length === 0) {
    if (duplicatesSkippedInMemory > 0) {
      logger.info(
        `[SlotManagement] ✓ No new slots needed for counselor ${counselorId} ` +
          `(${duplicatesSkippedInMemory} duplicates skipped)`
      );
    } else {
      logger.info(
        `[SlotManagement] ✓ No slots generated for counselor ${counselorId} ` +
          `on ${targetDate.format('YYYY-MM-DD')}`
      );
    }
    return { inserted: 0, skipped: duplicatesSkippedInMemory };
  }

  logger.info(
    `[SlotManagement] 🔨 Creating ${slotsToCreate.length} new slots for counselor ${counselorId}`
  );

  // ═══════════════════════════════════════════════════════════════
  // DUPLICATE PREVENTION LAYER 3: Upsert + Unique Index
  // ═══════════════════════════════════════════════════════════════

  let insertedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < slotsToCreate.length; i += BULK_INSERT_SIZE) {
    const chunk = slotsToCreate.slice(i, i + BULK_INSERT_SIZE);

    await CronErrorHandler.withRetry(
      async () => {
        const bulkOps = chunk.map((slot) => ({
          updateOne: {
            filter: {
              counselorId: slot.counselorId,
              startTime: slot.startTime,
            },
            update: { $setOnInsert: slot }, // Only insert if doesn't exist
            upsert: true,
          },
        }));

        const result = await GeneratedSlot.bulkWrite(bulkOps, { ordered: false });

        // Track inserts vs skips
        const chunkInserted = result.upsertedCount || 0;
        const chunkSkipped = chunk.length - chunkInserted;

        insertedCount += chunkInserted;
        skippedCount += chunkSkipped;

        if (chunkSkipped > 0) {
          logger.info(
            `[SlotManagement] 📝 Counselor ${counselorId}: ` +
              `Inserted ${chunkInserted}, Skipped ${chunkSkipped} duplicates (DB level)`
          );
        }
      },
      {
        maxRetries: 3,
        operationName: `BulkInsertSlots-${counselorId}`,
      }
    );
  }

  const totalSkipped = duplicatesSkippedInMemory + skippedCount;

  logger.info(
    `[SlotManagement] ✅ Counselor ${counselorId} complete: ` +
      `${insertedCount} inserted, ${totalSkipped} skipped ` +
      `(${duplicatesSkippedInMemory} pre-check, ${skippedCount} upsert)`
  );

  return { inserted: insertedCount, skipped: totalSkipped };
}

// ═══════════════════════════════════════════════════════════════════════════
// DELETE OLD SLOTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Delete old unbooked slots (before current time)
 * Keeps booked slots for historical records and payment tracking
 */
async function deleteOldSlots(jobLogger) {
  try {
    const now = dayjs().tz(TIMEZONE).toDate();

    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info(
      `[SlotManagement] 🗑️ Deleting old slots (endTime < ${dayjs(now).tz(TIMEZONE).format('YYYY-MM-DD HH:mm')})`
    );
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Delete slots that:
    // 1. End time is in the past
    // 2. Status is NOT 'booked' (keep booked slots for history & payment records)
    const result = await CronErrorHandler.withRetry(
      async () => {
        return await GeneratedSlot.deleteMany({
          endTime: { $lt: now },
          status: { $ne: 'booked' }, // Keep booked slots for audit trail
        });
      },
      {
        maxRetries: 3,
        operationName: 'DeleteOldSlots',
      }
    );

    const deletedCount = result.deletedCount || 0;

    if (deletedCount > 0) {
      logger.info(`[SlotManagement] ✅ Deleted ${deletedCount} old unbooked slots`);
      jobLogger.incrementProcessed(deletedCount);
      jobLogger.incrementSucceeded(deletedCount);
    } else {
      logger.info('[SlotManagement] ✓ No old slots to delete');
    }

    // ✅ Alert if unusually high deletion (possible data issue or config problem)
    if (deletedCount > 1000) {
      await AlertingService.sendSlackAlert(
        'High Slot Deletion Count',
        `Deleted ${deletedCount} old slots. This is higher than usual (threshold: 1000) and may indicate:\n` +
          `• Many counselors with no bookings\n` +
          `• Configuration issue with slot generation\n` +
          `• System downtime causing slot buildup`,
        'warning'
      );
    }

    return deletedCount;
  } catch (error) {
    jobLogger.incrementFailed(error);
    logger.error(`[SlotManagement] ❌ Error deleting old slots: ${error.message}`);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HEALTH CHECK & ALERTING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check for counselors with no slots in next 7 days
 * This indicates missing recurring availability or generation failures
 */
async function checkSlotHealth(jobLogger) {
  try {
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('[SlotManagement] 🏥 Running health check...');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const sevenDaysFromNow = dayjs().tz(TIMEZONE).add(7, 'days').endOf('day').toDate();
    const now = dayjs().tz(TIMEZONE).toDate();

    // Find counselors with recurring availability but no future slots
    const counselorsWithAvailability = await RecurringAvailability.distinct('counselorId', {
      isAvailable: true,
    });

    logger.info(
      `[SlotManagement] Found ${counselorsWithAvailability.length} counselors with availability settings`
    );

    let counselorsWithoutSlots = [];
    let counselorsChecked = 0;

    for (const counselorId of counselorsWithAvailability) {
      counselorsChecked++;

      const slotCount = await GeneratedSlot.countDocuments({
        counselorId,
        startTime: { $gte: now, $lte: sevenDaysFromNow },
        status: { $ne: 'unavailable' },
      });

      if (slotCount === 0) {
        counselorsWithoutSlots.push(counselorId);
      }

      // Log progress every 50 counselors
      if (counselorsChecked % 50 === 0) {
        logger.info(
          `[SlotManagement] Health check progress: ${counselorsChecked}/${counselorsWithAvailability.length}`
        );
      }
    }

    if (counselorsWithoutSlots.length > 0) {
      logger.warn(
        `[SlotManagement] ⚠️ ${counselorsWithoutSlots.length} counselors have availability ` +
          `but no slots in next 7 days`
      );

      await AlertingService.sendSlackAlert(
        'Counselors Missing Slots',
        `${counselorsWithoutSlots.length} out of ${counselorsWithAvailability.length} counselors ` +
          `have recurring availability set but no available slots in the next 7 days.\n\n` +
          `This may indicate:\n` +
          `• Slot generation failures\n` +
          `• All slots marked unavailable\n` +
          `• All slots booked (good problem!)`,
        'warning'
      );

      // Log to FailedAction for investigation
      await FailedAction.create({
        type: 'counselors_missing_slots',
        metadata: {
          counselorIds: counselorsWithoutSlots.slice(0, 20), // First 20
          totalCount: counselorsWithoutSlots.length,
          totalWithAvailability: counselorsWithAvailability.length,
          checkDate: new Date(),
        },
        error: 'Counselors have availability but no generated slots in next 7 days',
      });
    } else {
      logger.info('[SlotManagement] ✅ All counselors with availability have slots');
    }

    return counselorsWithoutSlots.length;
  } catch (error) {
    logger.error(`[SlotManagement] ❌ Health check failed: ${error.message}`);
    // Don't throw - this is optional check, shouldn't block main job
    return 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

export async function manageSlots() {
  const jobLogger = new JobLogger('SlotManagement');
  jobLogger.start();

  try {
    logger.info('');
    logger.info('═══════════════════════════════════════════════════════════════════════════');
    logger.info('                    🕐 SLOT MANAGEMENT JOB STARTED                         ');
    logger.info('═══════════════════════════════════════════════════════════════════════════');
    logger.info('');

    // Step 1: Delete old slots first (free up space and reduce clutter)
    const slotsDeleted = await deleteOldSlots(jobLogger);

    // Step 2: Generate new slots for 31st day
    const slotsCreated = await addSlotsFor31stDay(jobLogger);

    // Step 3: Health check (optional, non-blocking)
    const counselorsMissingSlots = await checkSlotHealth(jobLogger);

    jobLogger.complete();

    // ✅ Update job execution record
    await JobScheduler.updateJobExecution('slotManagement', {
      status: 'success',
      duration: Date.now() - jobLogger.startTime,
      processed: jobLogger.metrics.processed,
      succeeded: jobLogger.metrics.succeeded,
      failed: jobLogger.metrics.failed,
    });

    logger.info('');
    logger.info('═══════════════════════════════════════════════════════════════════════════');
    logger.info('                    ✅ SLOT MANAGEMENT COMPLETED                           ');
    logger.info('═══════════════════════════════════════════════════════════════════════════');
    logger.info(`  📊 Statistics:`);
    logger.info(`     • Slots created: ${slotsCreated}`);
    logger.info(`     • Slots deleted: ${slotsDeleted}`);
    logger.info(`     • Counselors missing slots: ${counselorsMissingSlots}`);
    logger.info(`     • Duration: ${Date.now() - jobLogger.startTime}ms`);
    logger.info('═══════════════════════════════════════════════════════════════════════════');
    logger.info('');

    return {
      success: true,
      slotsCreated,
      slotsDeleted,
      counselorsMissingSlots,
      duration: Date.now() - jobLogger.startTime,
    };
  } catch (error) {
    jobLogger.error(error);

    await JobScheduler.updateJobExecution('slotManagement', {
      status: 'failed',
      duration: Date.now() - jobLogger.startTime,
      error: error.message,
    });

    // Send critical alert
    await AlertingService.sendSlackAlert(
      '🚨 Slot Management Job Failed',
      `The daily slot management job failed with error:\n\n` +
        `**Error:** ${error.message}\n\n` +
        `**Stack:**\n\`\`\`${error.stack}\`\`\`\n\n` +
        `**Impact:** New slots may not be generated and old slots may not be deleted. ` +
        `Manual intervention required.`,
      'critical'
    );

    logger.error('');
    logger.error('═══════════════════════════════════════════════════════════════════════════');
    logger.error('                    ❌ SLOT MANAGEMENT FAILED                              ');
    logger.error('═══════════════════════════════════════════════════════════════════════════');
    logger.error(`  Error: ${error.message}`);
    logger.error('═══════════════════════════════════════════════════════════════════════════');
    logger.error('');

    throw error;
  }
}

export default manageSlots;
