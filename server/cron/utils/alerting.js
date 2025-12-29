/**
 * ALERTING SYSTEM
 * Sends alerts via Slack/Email when jobs fail
 */

import axios from 'axios';
import { logger } from '../../utils/logger.js';
import cronConfig from '../../config/cronConfig.js';

class AlertingService {
  /**
   * Send alert to Slack
   */
  static async sendSlackAlert(title, message, severity = 'warning') {
    console.log(cronConfig.monitoring.slackWebhookUrl);
    if (!cronConfig.monitoring.slackWebhookUrl) {
      return;
    }

    const color = severity === 'critical' ? '#FF0000' : '#FFA500';
    const emoji = severity === 'critical' ? '🚨' : '⚠️';

    try {
      await axios.post(cronConfig.monitoring.slackWebhookUrl, {
        text: `${emoji} *${title}*`,
        attachments: [
          {
            color,
            text: message,
            ts: Math.floor(Date.now() / 1000),
          },
        ],
      });

      logger.info(`[Alerting] Slack alert sent: ${title}`);
    } catch (error) {
      logger.error(`[Alerting] Failed to send Slack alert: ${error.message}`);
    }
  }

  /**
   * Alert on consecutive job failures
   */
  static async alertConsecutiveFailures(jobName, failureCount, lastError) {
    const threshold = cronConfig.monitoring.alertOnConsecutiveFailures;

    if (failureCount >= threshold) {
      await this.sendSlackAlert(
        `Job Failing Repeatedly: ${jobName}`,
        `Job "${jobName}" has failed ${failureCount} times in a row.\n\nLast error: ${lastError}`,
        'critical'
      );
    }
  }

  /**
   * Alert on long execution time
   */
  static async alertLongExecution(jobName, duration) {
    const threshold = cronConfig.monitoring.alertOnExecutionTime;

    if (duration > threshold) {
      await this.sendSlackAlert(
        `Job Taking Too Long: ${jobName}`,
        `Job "${jobName}" took ${(duration / 1000).toFixed(0)}s to complete (threshold: ${(threshold / 1000).toFixed(0)}s)`,
        'warning'
      );
    }
  }

  /**
   * Alert on high failed actions count
   */
  static async alertFailedActionsThreshold(count) {
    const threshold = cronConfig.monitoring.alertOnFailedActionsThreshold;

    if (count >= threshold) {
      await this.sendSlackAlert(
        `High Failed Actions Count`,
        `${count} failed actions pending manual review (threshold: ${threshold})`,
        'warning'
      );
    }
  }
}

export default AlertingService;
