/**
 * PRODUCTION-GRADE JOB LOGGER
 * Provides structured logging for cron jobs with performance metrics
 */

import { logger } from '../../utils/logger.js';

class JobLogger {
  constructor(jobName) {
    this.jobName = jobName;
    this.startTime = null;
    this.metrics = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: [],
    };
  }

  start() {
    this.startTime = Date.now();
    logger.info(`[${this.jobName}] ▶ Job started`);
  }

  incrementProcessed(count = 1) {
    this.metrics.processed += count;
  }

  incrementSucceeded(count = 1) {
    this.metrics.succeeded += count;
  }

  incrementFailed(error, count = 1) {
    this.metrics.failed += count;
    this.metrics.errors.push({
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }

  complete() {
    const duration = Date.now() - this.startTime;
    const { processed, succeeded, failed } = this.metrics;

    if (processed === 0) {
      logger.info(`[${this.jobName}] ✓ No actions needed (${duration}ms)`);
      return;
    }

    const status = failed === 0 ? '✅' : '⚠️';
    logger.info(
      `[${this.jobName}] ${status} Completed in ${duration}ms | ` +
        `Processed: ${processed} | Succeeded: ${succeeded} | Failed: ${failed}`
    );

    // Log errors if any
    if (failed > 0) {
      logger.error(`[${this.jobName}] Errors encountered:`, {
        count: failed,
        samples: this.metrics.errors.slice(0, 5), // Log first 5 errors
      });
    }

    // Performance warning
    if (duration > 30000) {
      logger.warn(`[${this.jobName}] Performance warning: Job took ${duration}ms (>30s)`);
    }
  }

  error(error) {
    const duration = this.startTime ? Date.now() - this.startTime : 0;
    logger.error(`[${this.jobName}] ❌ Job failed after ${duration}ms: ${error.message}`, {
      stack: error.stack,
    });
  }
}

export default JobLogger;
