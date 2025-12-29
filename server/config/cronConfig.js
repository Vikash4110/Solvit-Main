/**
 * CRON CONFIGURATION
 * All tunable parameters in one place
 */
import { timeZone } from '../constants.js';
import dotenv from 'dotenv';
dotenv.config();
const cronConfig = {
  // ════════════════════════════════════════════════════════════════
  // Pending Actions Job
  // ════════════════════════════════════════════════════════════════
  pendingActions: {
    interval: process.env.PENDING_ACTIONS_INTERVAL, // Every 30 min
    intervalInMinutes: process.env.PENDING_ACTIONS_INTERVAL_IN_MINUTES,
    batchSize: parseInt(process.env.PENDING_ACTIONS_BATCH_SIZE) || 50,
    maxPerRun: parseInt(process.env.PENDING_ACTIONS_MAX_PER_RUN) || 500,
    concurrency: parseInt(process.env.PENDING_ACTIONS_CONCURRENCY) || 2, // NEW
    rateLimitDelay: parseInt(process.env.RATE_LIMIT_DELAY) || 1000, // ms between API calls
    maxExecutionTime: parseInt(process.env.MAX_EXECUTION_TIME) || 25 * 60 * 1000, // 25 min
  },

  // ════════════════════════════════════════════════════════════════
  // Slot Management Job
  // ════════════════════════════════════════════════════════════════
  slotManagement: {
    schedule: process.env.SLOT_MANAGEMENT_SCHEDULE || '0 0 * * *', // Daily at midnight
    daysAhead: parseInt(process.env.SLOT_DAYS_AHEAD) || 30,
    bulkInsertSize: parseInt(process.env.SLOT_BULK_INSERT_SIZE) || 100,
    retryAttempts: parseInt(process.env.SLOT_RETRY_ATTEMPTS) || 3,
    concurrency: parseInt(process.env.SLOT_CONCURRENCY) || 10,
  },

  // Payment Reconciliation Job
  paymentReconciliation: {
    intervalInMinutes: parseInt(process.env.PAYMENT_RECONCILIATION_INTERVAL_IN_MINUTES) || 15, // ✅ ADD parseInt + fallback
    interval: process.env.PAYMENT_RECONCILIATION_INTERVAL || '*/15 * * * *', // ✅ ADD fallback
    orphanedThresholdMinutes:
      parseInt(process.env.PAYMENT_RECONCILIATION_ORPHANED_THRESHOLD_MINUTES) || 10, // ✅ ADD parseInt + fallback
    stuckSlotThresholdMinutes:
      parseInt(process.env.PAYMENT_RECONCILIATION_STUCK_SLOT_THRESHOLD_MINUTES) || 15, // ✅ ADD parseInt + fallback
    maxPerRun: parseInt(process.env.PAYMENT_RECONCILIATION_MAX_PER_RUN) || 100, // ✅ ADD parseInt + fallback
    concurrency: parseInt(process.env.PAYMENT_RECONCILIATION_CONCURRENCY) || 3, // ✅ ADD parseInt + fallback
  },

  // ════════════════════════════════════════════════════════════════
  // Error Handling
  // ════════════════════════════════════════════════════════════════
  errorHandling: {
    maxRetries: parseInt(process.env.ERROR_MAX_RETRIES) || 3,
    initialDelayMs: parseInt(process.env.ERROR_INITIAL_DELAY) || 1000,
    maxDelayMs: parseInt(process.env.ERROR_MAX_DELAY) || 30000, // 30 sec
    exponentialBackoff: process.env.ERROR_EXPONENTIAL_BACKOFF !== 'false',
  },

  // ════════════════════════════════════════════════════════════════
  // Monitoring & Alerts
  // ════════════════════════════════════════════════════════════════
  monitoring: {
    alertOnConsecutiveFailures: parseInt(process.env.ALERT_CONSECUTIVE_FAILURES) || 3,
    alertOnExecutionTime: parseInt(process.env.ALERT_EXECUTION_TIME) || 20 * 60 * 1000, // 20 min
    alertOnFailedActionsThreshold: parseInt(process.env.ALERT_FAILED_ACTIONS_THRESHOLD) || 50,
    slackWebhookUrl: process.env.SLACK_WEBHOOK_URL || null,
    alertEmail: process.env.ALERT_EMAIL || null,
  },

  // ════════════════════════════════════════════════════════════════
  // Distributed Locks (Multi-Node)
  // ════════════════════════════════════════════════════════════════
  locks: {
    enabled: process.env.DISTRIBUTED_LOCKS_ENABLED === 'true',
    ttl: parseInt(process.env.LOCK_TTL) || 30 * 60 * 1000, // 30 min
    retryCount: parseInt(process.env.LOCK_RETRY_COUNT) || 3,
  },

  // ════════════════════════════════════════════════════════════════
  // General
  // ════════════════════════════════════════════════════════════════
  timezone: timeZone,
  gracefulShutdownTimeout: parseInt(process.env.GRACEFUL_SHUTDOWN_TIMEOUT),
  nodeId: process.env.NODE_ID || `node-${Math.random().toString(36).substring(7)}`,
};

export default cronConfig;
