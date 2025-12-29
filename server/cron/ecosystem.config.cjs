/**
 * PM2 ECOSYSTEM CONFIGURATION
 * Manages both Express server and Cron service
 */

module.exports = {
  apps: [
    // ════════════════════════════════════════════════════════════════
    // Main Express Server
    // ════════════════════════════════════════════════════════════════
    {
      name: 'solvit-server',
      script: './src/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
      },
      error_file: './logs/server-error.log',
      out_file: './logs/server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      time: true,
      max_memory_restart: '500M',
      autorestart: true,
      restart_delay: 5000,
    },

    // ════════════════════════════════════════════════════════════════
    // Cron Service
    // ════════════════════════════════════════════════════════════════
    {
      name: 'solvit-cron',
      script: './src/cron/cronService.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/cron-error.log',
      out_file: './logs/cron-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      time: true,
      max_memory_restart: '300M',
      autorestart: true,
      restart_delay: 10000, // Wait 10s before restart
      max_restarts: 10,
      min_uptime: '10s',
      // Optional: Restart daily at midnight (helps with memory leaks)
      cron_restart: '0 0 * * *',
    },
  ],
};
