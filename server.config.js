module.exports = {
  apps: [
    {
      name: 'gbs-rt-server',
      script: './dist/index.js',
      exec_mode: 'fork',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      instances: 1,
      // 再起動
      // cron_restart: '0,15,30,45 * * * *',
    },
  ],
};
