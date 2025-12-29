/**
 * DISTRIBUTED LOCK
 * Prevents duplicate job execution across multiple nodes
 * MongoDB-based implementation (no Redis needed)
 */

import mongoose from 'mongoose';
import { logger } from '../../utils/logger.js';
import cronConfig from '../../config/cronConfig.js';

const lockSchema = new mongoose.Schema({
  lockKey: { type: String, required: true, unique: true, index: true },
  nodeId: { type: String, required: true },
  acquiredAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true, index: true },
});

// Auto-delete expired locks
lockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Lock = mongoose.model('Lock', lockSchema);

class DistributedLock {
  /**
   * Acquire lock for a job
   */
  static async acquire(lockKey, ttl = cronConfig.locks.ttl) {
    if (!cronConfig.locks.enabled) {
      return { acquired: true, lock: null }; // Locks disabled
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttl);
    const nodeId = cronConfig.nodeId;

    try {
      // Try to create lock
      const lock = await Lock.create({
        lockKey,
        nodeId,
        acquiredAt: now,
        expiresAt,
      });

      logger.info(`[DistributedLock] Lock acquired: ${lockKey} by ${nodeId}`);
      return { acquired: true, lock };
    } catch (error) {
      // Lock already exists
      if (error.code === 11000) {
        // Check if lock is expired
        const existingLock = await Lock.findOne({ lockKey });

        if (existingLock && existingLock.expiresAt < now) {
          // Lock expired, try to steal it
          const updated = await Lock.findOneAndUpdate(
            { lockKey, expiresAt: { $lt: now } },
            { nodeId, acquiredAt: now, expiresAt },
            { new: true }
          );

          if (updated) {
            logger.info(`[DistributedLock] Stale lock stolen: ${lockKey} by ${nodeId}`);
            return { acquired: true, lock: updated };
          }
        }

        logger.warn(`[DistributedLock] Lock already held: ${lockKey} by ${existingLock?.nodeId}`);
        return { acquired: false, lock: null };
      }

      throw error;
    }
  }

  /**
   * Release lock
   */
  static async release(lockKey) {
    if (!cronConfig.locks.enabled) {
      return;
    }

    try {
      await Lock.deleteOne({ lockKey, nodeId: cronConfig.nodeId });
      logger.info(`[DistributedLock] Lock released: ${lockKey}`);
    } catch (error) {
      logger.error(`[DistributedLock] Failed to release lock ${lockKey}: ${error.message}`);
    }
  }

  /**
   * Execute function with lock
   */
  static async withLock(lockKey, fn, ttl = cronConfig.locks.ttl) {
    const { acquired, lock } = await this.acquire(lockKey, ttl);

    if (!acquired) {
      logger.warn(`[DistributedLock] Could not acquire lock: ${lockKey}. Skipping execution.`);
      return { skipped: true, reason: 'lock_not_acquired' };
    }

    try {
      const result = await fn();
      return result;
    } finally {
      await this.release(lockKey);
    }
  }
}

export default DistributedLock;
