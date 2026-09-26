module.exports = {
  apps: [
    {
      name: "TaskDrobe",
      namespace: "SAIBAL",
      script: "./app.js",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "500M",
      time: true,

      // Graceful Shutdown & Crash Recovery Tuning
      kill_timeout: 5000,         // Give app.js 5s to close Socket.IO, Redis & PostgreSQL pool
      autorestart: true,          // Automatically restart if the app crashes
      max_restarts: 10,           // Prevent infinite restart loops on fatal config errors
      min_uptime: "10s",          // App must stay up 10s to be considered a clean boot
      restart_delay: 2000,        // Wait 2s before restarting after a crash

      // Centralized Log Files
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      merge_logs: true,

      // Default Environment (pm2 start ecosystem.config.js)
      env: {
        NODE_ENV: "development",
      },

      // Production Environment (pm2 start ecosystem.config.js --env production)
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};