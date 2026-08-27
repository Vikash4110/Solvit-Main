/**
 * PM2 ECOSYSTEM CONFIGURATION - PRODUCTION DEPLOYMENT
 * Enables Multi-Core CPU Clustering for Express and Standalone Worker for Cron
 */

module.exports = {
  apps: [
    // ════════════════════════════════════════════════════════════════
    // 1. Main Express HTTP API (Cluster Mode - Multi-Core)
    // ════════════════════════════════════════════════════════════════
    {
      name: 'solvit-server',
      script: './server.js',
      instances: 'max', // Automatically spawns 1 worker per CPU core
      exec_mode: 'cluster', // Enables Node.js cluster load balancing
      watch: false,
      max_memory_restart: '500M',
      autorestart: true,
      restart_delay: 3000,
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      error_file: './logs/server-error.log',
      out_file: './logs/server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      time: true,
    },

    // ════════════════════════════════════════════════════════════════
    // 2. Background Scheduled Cron Service (Fork Mode - Single Worker)
    // ════════════════════════════════════════════════════════════════
    {
      name: 'solvit-cron',
      script: './cron/cronService.js',
      instances: 1, // Must be 1 to prevent duplicate job executions
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '300M',
      autorestart: true,
      restart_delay: 5000,
      min_uptime: '10s',
      max_restarts: 10,
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      error_file: './logs/cron-error.log',
      out_file: './logs/cron-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      time: true,
    },
  ],
};
