/**
 * Worker process for job execution
 * Handles all job processing with error handling and retry logic
 *
 * HOW TO START WORKER:
 * Run: node src/queue/worker.js
 * For multiple workers (horizontal scaling): run the same command in multiple terminals/processes
 * Workers are stateless and can be scaled horizontally without issues
 */
import { Worker } from 'bullmq';
import axios from 'axios';
import { createRedisConnection } from '../config/redis.js';
import { QUEUE_NAMES, JOB_TYPES } from '../constants.js';
import {logger} from '../utils/logger.js';

// Create Redis connection for worker (persistent, never gives up)
const connection = createRedisConnection(true);

/**
 * Job Processors
 * Each processor handles a specific job type
 */

/**
 * Add slots to database
 * Runs daily at midnight to create mentor availability slots
 */
const processAddSlots = async (job) => {
  logger.info(`Processing addSlots job ${job.id} with data:`, job.data);

  try {
    // Example: Call your database or API to add slots
    // const result = await createMentorSlots(job.data);

    // Simulate slot creation
    const { mentorId, date, slots } = job.data;

    // Your actual DB logic here
    logger.info(`Creating ${slots?.length || 0} slots for mentor ${mentorId} on ${date}`);

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      success: true,
      mentorId,
      slotsCreated: slots?.length || 0,
      date,
    };
  } catch (error) {
    logger.error(`Error in addSlots job ${job.id}: ${error.message}`);
    throw error; // Will trigger retry logic
  }
};

/**
 * Delete old slots from database
 * Runs daily at 11:59 PM to clean up expired slots
 */
const processDeleteSlots = async (job) => {
  logger.info(`Processing deleteSlots job ${job.id}`);

  try {
    const { beforeDate } = job.data;

    // Example: Call your database to delete old slots
    // const result = await deleteExpiredSlots(beforeDate);

    logger.info(`Deleting slots before date: ${beforeDate}`);

    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      success: true,
      deletedCount: 15, // Example count
      beforeDate,
    };
  } catch (error) {
    logger.error(`Error in deleteSlots job ${job.id}: ${error.message}`);
    throw error;
  }
};

/**
 * Delete VideoSDK room and remove participants
 * Called at scheduled meeting end time
 */
const processDeleteRoom = async (job) => {
  logger.info(`Processing deleteRoom job ${job.id}`);

  try {
    const { roomId, meetingId } = job.data;
    const apiKey = process.env.VIDEOSDK_API_KEY;

    if (!apiKey) {
      throw new Error('VIDEOSDK_API_KEY not configured');
    }

    // Delete room via VideoSDK API
    const response = await axios.delete(`https://api.videosdk.live/v2/rooms/${roomId}`, {
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    logger.info(`VideoSDK room ${roomId} deleted successfully`);

    // Optional: Update your database to mark meeting as ended
    // await updateMeetingStatus(meetingId, 'completed');

    return {
      success: true,
      roomId,
      meetingId,
      deletedAt: new Date().toISOString(),
    };
  } catch (error) {
    // Handle specific API errors
    if (error.response) {
      logger.error(`VideoSDK API error: ${error.response.status} - ${error.response.data}`);
    } else {
      logger.error(`Error in deleteRoom job ${job.id}: ${error.message}`);
    }
    throw error;
  }
};

/**
 * Main job processor router
 * Routes jobs to appropriate handlers based on job type
 */
const processJob = async (job) => {
  logger.info(
    `Starting job ${job.name} (ID: ${job.id}), attempt ${job.attemptsMade + 1}/${job.opts.attempts}`
  );

  try {
    let result;

    switch (job.name) {
      case JOB_TYPES.ADD_SLOTS:
        result = await processAddSlots(job);
        break;

      case JOB_TYPES.DELETE_SLOTS:
        result = await processDeleteSlots(job);
        break;

      case JOB_TYPES.DELETE_ROOM:
        result = await processDeleteRoom(job);
        break;

      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }

    logger.info(`Job ${job.name} (ID: ${job.id}) completed successfully`);
    return result;
  } catch (error) {
    logger.error(`Job ${job.name} (ID: ${job.id}) failed: ${error.message}`);
    throw error; // Re-throw to trigger retry mechanism
  }
};

/**
 * Create workers for both queues
 */
const schedulerWorker = new Worker(QUEUE_NAMES.SCHEDULER, processJob, {
  connection,
  concurrency: parseInt(process.env.QUEUE_CONCURRENCY) || 2,
  settings: {
    stalledInterval: 300000,    // Check for stalled jobs every 60s (default: 30s)
    maxStalledCount: 2,         // Max times a job can be recovered
    lockDuration: 60000,        // Lock duration in ms
  },
  limiter: {
    max: 50, // Max 100 jobs
    duration: 60000, // per 60 seconds
  },
});

const immediateWorker = new Worker(QUEUE_NAMES.IMMEDIATE, processJob, {
  connection,
  concurrency: parseInt(process.env.QUEUE_CONCURRENCY) || 2,
  
  // ⭐ 5-MINUTE POLLING INTERVAL
  settings: {
    stalledInterval: 300000, // 5 minutes
    maxStalledCount: 2,
    lockDuration: 60000,
  },
});

/**
 * Worker event handlers
 */

// Scheduler Worker Events
schedulerWorker.on('completed', (job, result) => {
  logger.info(`✓ Scheduler job ${job.id} completed:`, result);
});

schedulerWorker.on('failed', (job, err) => {
  logger.error(
    `✗ Scheduler job ${job?.id} failed after ${job?.attemptsMade} attempts: ${err.message}`
  );
});

schedulerWorker.on('error', (err) => {
  logger.error(`Scheduler Worker error: ${err.message}`);
});

schedulerWorker.on('stalled', (jobId) => {
  logger.warn(`Scheduler job ${jobId} stalled and will be retried`);
});

// Immediate Worker Events
immediateWorker.on('completed', (job, result) => {
  logger.info(`✓ Immediate job ${job.id} completed:`, result);
});

immediateWorker.on('failed', (job, err) => {
  logger.error(
    `✗ Immediate job ${job?.id} failed after ${job?.attemptsMade} attempts: ${err.message}`
  );
});

immediateWorker.on('error', (err) => {
  logger.error(`Immediate Worker error: ${err.message}`);
});

immediateWorker.on('stalled', (jobId) => {
  logger.warn(`Immediate job ${jobId} stalled and will be retried`);
});

/**
 * Graceful shutdown handler
 * Ensures all running jobs complete before worker shuts down
 */
const gracefulShutdown = async (signal) => {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);

  try {
    // Close workers (waits for active jobs to complete)
    logger.info('Closing workers...');
    await Promise.all([schedulerWorker.close(), immediateWorker.close()]);

    // Close Redis connection
    logger.info('Closing Redis connection...');
    await connection.quit();

    logger.info('Graceful shutdown completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error(`Error during shutdown: ${error.message}`);
    process.exit(1);
  }
};

// Register shutdown handlers
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

logger.info('Worker started successfully and waiting for jobs...');
logger.info(`Concurrency: ${parseInt(process.env.QUEUE_CONCURRENCY) || 5}`);

/**
 * SCALING INSTRUCTIONS:
 *
 * To scale horizontally (recommended for production):
 * 1. Run multiple instances of this worker file on different processes/servers
 * 2. All workers connect to the same Redis instance
 * 3. BullMQ automatically distributes jobs across all available workers
 * 4. Example with PM2:
 *    pm2 start src/queue/worker.js -i 4  // Start 4 worker instances
 * 5. Example with Docker:
 *    docker-compose scale worker=5  // Scale to 5 worker containers
 * 6. Workers are stateless - add/remove instances anytime without data loss
 */

export { schedulerWorker, immediateWorker };
