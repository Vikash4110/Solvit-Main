/**
 * ERROR HANDLER FOR CRON JOBS
 * Implements retry logic and error categorization
 */

import { logger } from '../../utils/logger.js';

class CronErrorHandler {
  /**
   * Determine if error is retryable
   */
  static isRetryable(error) {
    // Network errors - retry
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return true;
    }

    // MongoDB errors - retry
    if (error.name === 'MongoNetworkError' || error.name === 'MongoTimeoutError') {
      return true;
    }

    // VideoSDK temporary errors - retry
    if (
      error.response?.status === 500 ||
      error.response?.status === 502 ||
      error.response?.status === 503
    ) {
      return true;
    }

    // Rate limiting - retry
    if (error.response?.status === 429) {
      return true;
    }

    // Everything else - don't retry
    return false;
  }

  /**
   * Should we skip this error (non-critical)?
   */
  static isSkippable(error) {
    // 404 errors (room already deleted)
    if (error.response?.status === 404 || error.message?.toLowerCase().includes('not found')) {
      return true;
    }

    // Already in desired state
    if (error.message?.toLowerCase().includes('already deleted')) {
      return true;
    }

    if (error.message?.toLowerCase().includes('already completed')) {
      return true;
    }

    return false;
  }

  /**
   * Execute with retry logic
   */
  static async withRetry(fn, options = {}) {
    const {
      maxRetries = 3,
      delayMs = 1000,
      exponentialBackoff = true,
      operationName = 'Operation',
    } = options;

    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // If skippable, don't retry
        if (this.isSkippable(error)) {
          logger.info(`[${operationName}] Skipping non-critical error: ${error.message}`);
          return { skipped: true, reason: error.message };
        }

        // If not retryable, throw immediately
        if (!this.isRetryable(error)) {
          logger.error(`[${operationName}] Non-retryable error: ${error.message}`);
          throw error;
        }

        // If last attempt, throw
        if (attempt === maxRetries) {
          logger.error(`[${operationName}] Failed after ${maxRetries} attempts`);
          throw error;
        }

        // Calculate delay
        const delay = exponentialBackoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;

        logger.warn(
          `[${operationName}] Attempt ${attempt}/${maxRetries} failed: ${error.message}. ` +
            `Retrying in ${delay}ms...`
        );

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Safe execution wrapper (catches all errors)
   */
  static async safe(fn, fallback = null) {
    try {
      return await fn();
    } catch (error) {
      logger.error(`Safe execution caught error: ${error.message}`);
      return fallback;
    }
  }
}

export default CronErrorHandler;
