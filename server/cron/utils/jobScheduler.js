/**
 * JOB SCHEDULER with MongoDB Persistence
 * Replaces file-based tracking for production
 */

import { JobExecution } from '../../models/jobExecution.model.js';
import { logger } from '../../utils/logger.js';
import AlertingService from './alerting.js';
import cronConfig from '../../config/cronConfig.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

class JobScheduler {
  /**
   * Get last run info for a job
   */
  static async getLastRun(jobName) {
    const execution = await JobExecution.findOne({ jobName });
    return execution;
  }

  /**
   * Update job execution record
   */
  static async updateJobExecution(jobName, metrics) {
    const {
      status = 'success',
      duration = 0,
      processed = 0,
      succeeded = 0,
      failed = 0,
      error = null,
    } = metrics;

    const update = {
      lastRun: new Date(),
      lastStatus: status,
      lastDuration: duration,
      lastProcessed: processed,
      lastSucceeded: succeeded,
      lastFailed: failed,
      lastError: error,
      nodeId: cronConfig.nodeId,
      $inc: { executionCount: 1 },
    };

    if (status === 'success') {
      update.consecutiveFailures = 0;
    } else {
      update.$inc.consecutiveFailures = 1;
    }

    const execution = await JobExecution.findOneAndUpdate({ jobName }, update, {
      upsert: true,
      new: true,
    });

    // ✅ Send alerts if needed
    if (status === 'failed') {
      await AlertingService.alertConsecutiveFailures(jobName, execution.consecutiveFailures, error);
    }

    if (duration > cronConfig.monitoring.alertOnExecutionTime) {
      await AlertingService.alertLongExecution(jobName, duration);
    }

    return execution;
  }

  /**
   * Check if daily job was missed
   */
  static async wasDailyJobMissed(jobName, scheduledHour = 0, scheduledMinute = 0) {
    const now = dayjs().tz(cronConfig.timezone);
    const execution = await this.getLastRun(jobName);

    if (!execution || !execution.lastRun) {
      return true;
    }

    const lastRun = dayjs(execution.lastRun).tz(cronConfig.timezone);
    const todayScheduled = now.hour(scheduledHour).minute(scheduledMinute).second(0);

    if (now.isAfter(todayScheduled) && lastRun.isBefore(todayScheduled)) {
      logger.warn(
        `[JobScheduler] Daily job "${jobName}" was missed! ` +
          `Should have run at ${todayScheduled.format()}, last run: ${lastRun.format()}`
      );
      return true;
    }

    return false;
  }

  /**
   * Check if periodic job was missed
   */
  static async wasPeriodicJobMissed(jobName, intervalMinutes) {
    const now = dayjs().tz(cronConfig.timezone);
    const execution = await this.getLastRun(jobName);

    if (!execution || !execution.lastRun) {
      return true;
    }

    const lastRun = dayjs(execution.lastRun).tz(cronConfig.timezone);
    const minutesSinceLastRun = now.diff(lastRun, 'minute');

    if (minutesSinceLastRun > intervalMinutes + 10) {
      logger.warn(
        `[JobScheduler] Periodic job "${jobName}" may have been missed. ` +
          `Last run: ${minutesSinceLastRun} minutes ago (expected: ${intervalMinutes} min)`
      );
      return true;
    }

    return false;
  }
}

export default JobScheduler;
