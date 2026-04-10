import app from './app';
import env from './config/env';

const server = app.listen(env.port, () => {
  console.log(`[server]: Running in ${env.nodeEnv} mode on port ${env.port}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

export default server;
