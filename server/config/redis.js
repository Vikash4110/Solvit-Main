/**
 * Redis connection configuration for BullMQ with Upstash
 * Upstash requires TLS connection
 */
import Redis from 'ioredis';
import dotenv from 'dotenv';

import {logger} from '../utils/logger.js';

dotenv.config();

/**
 * Create Upstash Redis connection with TLS
 * @param {boolean} isWorker - Whether this connection is for a worker
 * @returns {Redis} Redis connection instance
 */
export const createRedisConnection = (isWorker = false) => {
  const connection = new Redis({
    host: process.env.UPSTASH_REDIS_REST_URL, // Your Upstash endpoint
    port: parseInt(process.env.UPSTASH_REDIS_PORT) || 6379,
    password: process.env.UPSTASH_REDIS_REST_TOKEN,

    // CRITICAL: TLS is required for Upstash
    tls: {
      rejectUnauthorized: true, // Enforce SSL certificate validation
    },

    // Enable read-only support (if using Upstash read replicas)
    enableReadyCheck: false,

    // Critical for workers - must be null to prevent job failures
    maxRetriesPerRequest: isWorker ? null : 20,

    // Enable offline queue for workers, disable for queues (fail fast)
    enableOfflineQueue: isWorker,

    // Retry strategy with exponential backoff
    retryStrategy: (times) => {
      const delay = Math.max(Math.min(Math.exp(times), 20000), 1000);
      logger.warn(`Redis reconnection attempt ${times}, retrying in ${delay}ms`);
      return delay;
    },

    // Connection timeout
    connectTimeout: 10000,

    // Keep connection alive
    keepAlive: 30000,
  });

  // Error handling
  connection.on('error', (err) => {
    logger.error(`Redis connection error: ${err.message}`);
  });

  connection.on('connect', () => {
    logger.info('✓ Connected to Upstash Redis');
  });

  connection.on('ready', () => {
    logger.info('✓ Upstash Redis ready to accept commands');
  });

  connection.on('close', () => {
    logger.warn('Upstash Redis connection closed');
  });

  connection.on('reconnecting', () => {
    logger.info('Reconnecting to Upstash Redis...');
  });

  return connection;
};

export default createRedisConnection;
