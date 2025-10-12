/**
 * Queue initialization and job addition
 * Handles all queue creation and job dispatching logic
 */
import { Queue } from 'bullmq';
import { createRedisConnection } from '../config/redis.js';
import { QUEUE_NAMES, JOB_TYPES, JOB_OPTIONS } from '../constants.js';
import { logger } from '../utils/logger.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

// Extend Day.js plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Define timezone (can be loaded from ENV or constants)
import { timeZone } from '../constants.js';

// Create Redis connection for queues (fail fast on disconnect)
const connection = createRedisConnection(false);

/**
 * Initialize scheduler queue for recurring/delayed jobs
 */
export const schedulerQueue = new Queue(QUEUE_NAMES.SCHEDULER, {
  connection,
  defaultJobOptions: JOB_OPTIONS.DEFAULT,
});

/**
 * Initialize immediate queue for on-demand jobs
 */
export const immediateQueue = new Queue(QUEUE_NAMES.IMMEDIATE, {
  connection,
  defaultJobOptions: JOB_OPTIONS.DEFAULT,
});

// Queue error handlers
schedulerQueue.on('error', (err) => {
  logger.error(`Scheduler Queue Error: ${err.message}`);
});

immediateQueue.on('error', (err) => {
  logger.error(`Immediate Queue Error: ${err.message}`);
});

/**
 * Add a job to the queue
 * @param {string} jobType - Type of job (from JOB_TYPES)
 * @param {object} data - Job data
 * @param {object} options - Additional job options
 * @returns {Promise<Job>} Created job
 */
export const addJob = async (jobType, data = {}, options = {}) => {
  try {
    const job = await immediateQueue.add(jobType, data, {
      ...JOB_OPTIONS.DEFAULT,
      ...options,
    });

    const now = dayjs().tz(timeZone).format('YYYY-MM-DD HH:mm:ss');
    logger.info(`[${now}] Job ${jobType} added with ID: ${job.id}`);
    return job;
  } catch (error) {
    logger.error(`Failed to add job ${jobType}: ${error.message}`);
    throw error;
  }
};

/**
 * Add a repeatable job (cron-based)
 * @param {string} jobType - Type of job
 * @param {object} data - Job data
 * @param {string} cronExpression - Cron expression
 * @param {object} options - Additional options
 */
export const addRepeatableJob = async (jobType, data, cronExpression, options = {}) => {
  try {
    const job = await schedulerQueue.add(jobType, data, {
      repeat: {
        pattern: cronExpression,
        ...options.repeat,
      },
      ...JOB_OPTIONS.DEFAULT,
      ...options,
    });

    const now = dayjs().tz(timeZone).format('YYYY-MM-DD HH:mm:ss');
    logger.info(`[${now}] Repeatable job ${jobType} scheduled with pattern: ${cronExpression}`);
    return job;
  } catch (error) {
    logger.error(`Failed to add repeatable job ${jobType}: ${error.message}`);
    throw error;
  }
};

/**
 * Add a delayed job
 * @param {string} jobType - Type of job
 * @param {object} data - Job data
 * @param {number} delay - Delay in milliseconds
 * @param {object} options - Additional options
 */
export const addDelayedJob = async (jobType, data, delay, options = {}) => {
  try {
    const job = await immediateQueue.add(jobType, data, {
      delay,
      ...JOB_OPTIONS.DEFAULT,
      ...options,
    });

    const scheduledTime = dayjs().tz(timeZone).add(delay, 'millisecond').format('YYYY-MM-DD HH:mm:ss');
    logger.info(`[${scheduledTime}] Delayed job ${jobType} scheduled to run in ${delay}ms`);
    return job;
  } catch (error) {
    logger.error(`Failed to add delayed job ${jobType}: ${error.message}`);
    throw error;
  }
};

/**
 * Remove a repeatable job
 * @param {string} jobType - Type of job
 * @param {object} repeatOpts - Repeat options used when job was created
 */
export const removeRepeatableJob = async (jobType, repeatOpts) => {
  try {
    await schedulerQueue.removeRepeatable(jobType, repeatOpts);
    const now = dayjs().tz(timeZone).format('YYYY-MM-DD HH:mm:ss');
    logger.info(`[${now}] Repeatable job ${jobType} removed`);
  } catch (error) {
    logger.error(`Failed to remove repeatable job ${jobType}: ${error.message}`);
    throw error;
  }
};

/**
 * Gracefully close all queues
 */
export const closeQueues = async () => {
  try {
    await Promise.all([schedulerQueue.close(), immediateQueue.close()]);
    await connection.quit();
    const now = dayjs().tz(timeZone).format('YYYY-MM-DD HH:mm:ss');
    logger.info(`[${now}] All queues closed gracefully`);
  } catch (error) {
    logger.error(`Error closing queues: ${error.message}`);
  }
};

export default {
  schedulerQueue,
  immediateQueue,
  addJob,
  addRepeatableJob,
  addDelayedJob,
  removeRepeatableJob,
  closeQueues,
};
