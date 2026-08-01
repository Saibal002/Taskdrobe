module.exports = {
  apps: [
    {
      name: 'TaskDrobe',
      namespace: 'SAIBAL',
      script: './app.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      time: true,
      env: {
        NODE_ENV: 'production'
        // PM2 will also read your .env via dotenv inside app.js
      }
    }
  ]
};