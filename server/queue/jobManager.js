/**
 * Job Manager - Schedules recurring and delayed jobs
 * Run this file once on application startup to initialize recurring jobs
 *
 * HOW TO USE:
 * 1. Import and call initializeScheduledJobs() in your server.js
 * 2. Use the exported functions to schedule one-off delayed jobs
 */

import { addRepeatableJob, addDelayedJob, schedulerQueue } from './queue.js';
import { JOB_TYPES } from '../constants.js';
import { logger } from '../utils/logger.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

// Extend plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Define your timezone (you can also import this from constants if needed)
import { timeZone } from '../constants.js';

/**
 * Initialize all recurring jobs
 * Should be called once on application startup
 */
export const initializeScheduledJobs = async () => {
  try {
    logger.info('Initializing scheduled jobs...');

    // Clear existing repeatable jobs to avoid duplicates
    const repeatableJobs = await schedulerQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await schedulerQueue.removeRepeatableByKey(job.key);
    }
    logger.info('Cleared existing repeatable jobs');

    // Job 1: Add slots daily at midnight (00:00)
    await addRepeatableJob(
      JOB_TYPES.ADD_SLOTS,
      {
        mentorId: 'auto', // Process all mentors
        autoGenerate: true,
      },
      '0 0 * * *', // Cron: Every day at midnight
      {
        jobId: 'recurring-add-slots',
      }
    );
    logger.info('✓ Scheduled: addSlots (daily at midnight)');

    // Job 2: Delete old slots daily at 11:59 PM (use timezone)
    const beforeDate = dayjs().tz(timeZone).toISOString();

    await addRepeatableJob(
      JOB_TYPES.DELETE_SLOTS,
      {
        beforeDate, // Pass timezone-aware date
      },
      '59 23 * * *', // Cron: Every day at 11:59 PM
      {
        jobId: 'recurring-delete-slots',
      }
    );
    logger.info('✓ Scheduled: deleteSlots (daily at 11:59 PM)');

    logger.info('All scheduled jobs initialized successfully');
  } catch (error) {
    logger.error(`Failed to initialize scheduled jobs: ${error.message}`);
    throw error;
  }
};

/**
 * Schedule a room deletion at a specific time
 * Called when a meeting is created with a specific end time
 *
 * @param {string} roomId - VideoSDK room ID
 * @param {string} meetingId - Your internal meeting ID
 * @param {Date|string} scheduledTime - When to delete the room
 */
export const scheduleRoomDeletion = async (roomId, meetingId, scheduledTime) => {
  try {
    // Convert to Day.js object in the correct timezone
    const targetTime = dayjs.tz(scheduledTime, timeZone);
    const now = dayjs().tz(timeZone);

    const delay = targetTime.diff(now, 'millisecond');

    if (delay <= 0) {
      throw new Error('Scheduled time must be in the future');
    }

    const job = await addDelayedJob(
      JOB_TYPES.DELETE_ROOM,
      {
        roomId,
        meetingId,
        scheduledFor: targetTime.toISOString(),
      },
      delay,
      {
        jobId: `delete-room-${roomId}`, // Prevents duplicates
        priority: 2, // Higher priority than regular jobs
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
 * Cancel a scheduled room deletion
 * @param {string} roomId - VideoSDK room ID
 */
export const cancelRoomDeletion = async (roomId) => {
  try {
    const jobId = `delete-room-${roomId}`;
    const job = await schedulerQueue.getJob(jobId);

    if (job) {
      await job.remove();
      logger.info(`Cancelled room deletion for: ${roomId}`);
      return true;
    }

    return false;
  } catch (error) {
    logger.error(`Failed to cancel room deletion: ${error.message}`);
    throw error;
  }
};

/**
 * Add a new job type handler:
 *
 * 1. Add job type to constants.js:
 *    export const JOB_TYPES = {
 *      ...existing,
 *      NEW_JOB: 'newJob',
 *    };
 *
 * 2. Add processor in worker.js:
 *    const processNewJob = async (job) => {
 *      // Your logic here
 *    };
 *
 *    // Add to switch statement in processJob()
 *    case JOB_TYPES.NEW_JOB:
 *      result = await processNewJob(job);
 *      break;
 *
 * 3. Add scheduler function here (optional):
 *    export const scheduleNewJob = async (data, cronExpression) => {
 *      return await addRepeatableJob(JOB_TYPES.NEW_JOB, data, cronExpression);
 *    };
 *
 * 4. Initialize in initializeScheduledJobs() if recurring
 */

export default {
  initializeScheduledJobs,
  scheduleRoomDeletion,
  cancelRoomDeletion,
};
