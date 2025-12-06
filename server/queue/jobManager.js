/**
 * OPTIMIZED Job Manager
 * Removed unnecessary getJob() calls and Redis queries
 */

import { addRepeatableJob, addDelayedJob, immediateQueue } from './queue.js';
import { JOB_TYPES } from '../constants.js';
import { logger } from '../utils/logger.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { timeZone } from '../constants.js';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Initialize scheduled jobs
 * OPTIMIZATION: Removed unnecessary getRepeatableJobs() query
 */
export const initializeScheduledJobs = async () => {
  try {
    logger.info('Initializing scheduled jobs...');

    // ============ OPTIMIZATION: Skip clearing existing jobs ============
    // SAVES: 1 Redis query on every startup
    // Repeatable jobs are idempotent - duplicates won't be created if jobId is same
    // REMOVED: getRepeatableJobs() and removeRepeatableByKey() loop

    // Job 1: Add slots daily at midnight
    await addRepeatableJob(
      JOB_TYPES.ADD_SLOTS,
      {
        mentorId: 'auto',
        autoGenerate: true,
      },
      '0 0 * * *',
      {
        jobId: 'recurring-add-slots', // Prevents duplicates
      }
    );
    logger.info('✓ Scheduled: addSlots (daily at midnight)');

    // Job 2: Delete old slots daily at 11:59 PM
    const beforeDate = dayjs().tz(timeZone).toISOString();
    await addRepeatableJob(
      JOB_TYPES.DELETE_SLOTS,
      {
        beforeDate,
      },
      '59 23 * * *',
      {
        jobId: 'recurring-delete-slots',
      }
    );
    logger.info('✓ Scheduled: deleteSlots (daily at 11:59 PM)');

    logger.info('All scheduled jobs initialized');
  } catch (error) {
    logger.error(`Failed to initialize scheduled jobs: ${error.message}`);
    throw error;
  }
};

/**
 * Schedule room deletion + updating booking status
 */
export const scheduleRoomDeletion = async (roomId, scheduledTime, bookingId) => {
  try {
    const targetTime = dayjs(scheduledTime).tz(timeZone);
    const now = dayjs().tz(timeZone);
    const delay = targetTime.diff(now, 'millisecond');

    if (delay <= 0) {
      throw new Error('Scheduled time must be in the future');
    }

    const job = await addDelayedJob(
      JOB_TYPES.DELETE_ROOM,
      {
        roomId,
        scheduledFor: scheduledTime,
        bookingId,
      },
      delay,
      {
        jobId: `delete-room-${roomId}`,
        priority: 2,
      }
    );

    logger.info(`Room deletion scheduled: ${roomId} at ${targetTime.format()}`);
    return job;
  } catch (error) {
    logger.error(`Failed to schedule room deletion: ${error.message}`);
    throw error;
  }
};

/**
 * Cancel room deletion
 * OPTIMIZATION: Fail gracefully if job not found (no throw)
 */
export const cancelRoomDeletion = async (roomId) => {
  try {
    const jobId = `delete-room-${roomId}`;

    // ============ OPTIMIZATION: Wrap getJob in try-catch ============
    // SAVES: Prevents unnecessary error logging on missing jobs
    try {
      const job = await immediateQueue.getJob(jobId);

      if (job) {
        await job.remove();
        logger.info(`Cancelled room deletion for: ${roomId}`);
        return true;
      }

      return false;
    } catch (err) {
      // Job not found - this is OK, don't log as error
      logger.info(`Room deletion job not found: ${roomId}`);
      return false;
    }
  } catch (error) {
    logger.error(`Failed to cancel room deletion: ${error.message}`);
    return false; // Don't throw, return false
  }
};

/**
 * Schedule auto complete the booking
 */
export const scheduleAutoCompleteBooking = async (bookingId, autoCompleteAt, slotData) => {
  try {
    const targetTime = dayjs(autoCompleteAt).tz(timeZone);
    const now = dayjs().tz(timeZone);
    const delay = targetTime.diff(now, 'millisecond');

    if (delay <= 0) {
      throw new Error('Scheduled time must be in the future');
    }
    const job = await addDelayedJob(
      JOB_TYPES.Auto_Complete_Booking,
      {
        bookingId,
        autoCompleteAt,
        slotData,
      },
      delay,
      {
        jobId: `auto-complete-booking-${bookingId}`,
        priority: 2,
      }
    );

    logger.info(`Auto Complete Booking scheduled: ${bookingId} at ${targetTime.format()}`);
    return job;
  } catch (error) {
    logger.error(`Failed to schedule auto complete: ${error.message}`);
    throw error;
  }
};

/**
 * Cancel auto Complete Booking
 * OPTIMIZATION: Fail gracefully if job not found (no throw)
 */
export const cancelAutoCompleteBooking = async (bookingId) => {
  try {
    const jobId = `auto-complete-booking-${bookingId}`;

    // ============ OPTIMIZATION: Wrap getJob in try-catch ============
    // SAVES: Prevents unnecessary error logging on missing jobs
    try {
      const job = await immediateQueue.getJob(jobId);

      if (job) {
        await job.remove();
        logger.info(`Cancelled Auto Complete Booking for: ${bookingId}`);
        return true;
      }

      return false;
    } catch (err) {
      // Job not found - this is OK, don't log as error
      logger.info(`Auto Complete Booking job not found: ${bookingId}`);
      return false;
    }
  } catch (error) {
    logger.error(`Failed to  auto complete the room : ${error.message}`);
    return false; // Don't throw, return false
  }
};

export default {
  initializeScheduledJobs,
  scheduleRoomDeletion,
  cancelRoomDeletion,
  scheduleAutoCompleteBooking,
  cancelAutoCompleteBooking,
};
