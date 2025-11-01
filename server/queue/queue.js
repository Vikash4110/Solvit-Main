/**
 * OPTIMIZED Queue initialization
 * Focus: Shared connections, minimal event listeners
 */

import { Queue } from 'bullmq';
import { getSharedRedisConnection } from '../config/redis.js';
import { QUEUE_NAMES, JOB_OPTIONS } from '../constants.js';
import { logger } from '../utils/logger.js';

// ============ OPTIMIZATION: Single shared connection for ALL queues ============
// SAVES: 2 connections per queue (down from 3 to 1 shared connection)
const sharedQueueConnection = getSharedRedisConnection(false);

/**
 * Optimized scheduler queue
 * REMOVED: Event listeners that cause unnecessary Redis polling
 */
export const schedulerQueue = new Queue(QUEUE_NAMES.SCHEDULER, {
  connection: sharedQueueConnection, // Reuse shared connection
  defaultJobOptions: JOB_OPTIONS.DEFAULT,

  // ============ OPTIMIZATION: Disable metrics collection ============
  // SAVES: Frequent Redis calls for job counts and stats
  metrics: {
    maxDataPoints: 0, // Disable metrics (saves ~100 commands/hour)
  },
});

/**
 * Optimized immediate queue
 */
export const immediateQueue = new Queue(QUEUE_NAMES.IMMEDIATE, {
  connection: sharedQueueConnection,
  defaultJobOptions: JOB_OPTIONS.DEFAULT,
  metrics: {
    maxDataPoints: 0,
  },
});

// ============ OPTIMIZATION: Remove event listeners ============
// Event listeners cause continuous Redis polling even when idle
// REMOVED: 'error', 'waiting', 'active', 'completed' listeners
// Only log critical errors to console, not via Redis polling

// Log errors only (no Redis polling)
schedulerQueue.on('error', (err) => {
  console.error(`Scheduler Queue Error: ${err.message}`);
});

immediateQueue.on('error', (err) => {
  console.error(`Immediate Queue Error: ${err.message}`);
});

/**
 * Add job with optimized options
 * OPTIMIZATION: Aggressive cleanup to reduce Redis storage
 */
export const addJob = async (jobType, data = {}, options = {}) => {
  try {
    const job = await immediateQueue.add(jobType, data, {
      ...JOB_OPTIONS.DEFAULT,
      ...options,

      // ============ AGGRESSIVE CLEANUP ============
      // SAVES: Storage space and reduces key count
      removeOnComplete: {
        age: 3600, // Keep completed jobs for only 1 hour (down from 24h)
        count: 100, // Keep only last 100 jobs (down from 1000)
      },
      removeOnFail: {
        age: 7200, // Keep failed jobs for 2 hours (down from 7 days)
        count: 50, // Keep only last 50 failed jobs
      },
    });

    // REMOVED: Timestamp logging (reduces string operations)
    logger.info(`Job ${jobType} added: ${job.id}`);
    return job;
  } catch (error) {
    logger.error(`Failed to add job ${jobType}: ${error.message}`);
    throw error;
  }
};

/**
 * Add repeatable job with minimal overhead
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

      // Aggressive cleanup for repeatable jobs
      removeOnComplete: {
        age: 1800, // 30 minutes
        count: 50,
      },
      removeOnFail: {
        age: 3600, // 1 hour
        count: 20,
      },
    });

    logger.info(`Repeatable job ${jobType} scheduled: ${cronExpression}`);
    return job;
  } catch (error) {
    logger.error(`Failed to add repeatable job ${jobType}: ${error.message}`);
    throw error;
  }
};

/**
 * Add delayed job
 */
export const addDelayedJob = async (jobType, data, delay, options = {}) => {
  try {
    const job = await immediateQueue.add(jobType, data, {
      delay,
      ...JOB_OPTIONS.DEFAULT,
      ...options,
      removeOnComplete: {
        age: 3600,
        count: 50,
      },
      removeOnFail: {
        age: 7200,
        count: 20,
      },
    });

    logger.info(`Delayed job ${jobType} scheduled (${delay}ms delay)`);
    return job;
  } catch (error) {
    logger.error(`Failed to add delayed job ${jobType}: ${error.message}`);
    throw error;
  }
};

/**
 * Remove repeatable job
 */
export const removeRepeatableJob = async (jobType, repeatOpts) => {
  try {
    await schedulerQueue.removeRepeatable(jobType, repeatOpts);
    logger.info(`Repeatable job ${jobType} removed`);
  } catch (error) {
    logger.error(`Failed to remove repeatable job ${jobType}: ${error.message}`);
    throw error;
  }
};

/**
 * Gracefully close queues (does NOT close shared connection)
 * Shared connection will be closed by redis.js closeAllConnections()
 */
export const closeQueues = async () => {
  try {
    // Close queues but NOT the shared connection
    await Promise.all([schedulerQueue.close(), immediateQueue.close()]);

    logger.info('All queues closed');
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
