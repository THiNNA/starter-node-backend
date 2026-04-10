import app from './app';
import { env, logger } from './config';
import { prisma } from './database';

// Cleanup expired refresh tokens every hour
const CLEANUP_INTERVAL = 60 * 60 * 1000;
let cleanupTimer: ReturnType<typeof setInterval>;

const startTokenCleanup = (): void => {
  cleanupTimer = setInterval(async () => {
    try {
      const result = await prisma.refreshToken.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      });
      if (result.count > 0) {
        logger.info(`Cleaned up ${result.count} expired refresh tokens`);
      }
    } catch (err) {
      logger.error(err, 'Failed to cleanup expired tokens');
    }
  }, CLEANUP_INTERVAL);
};

const server = app.listen(env.port, () => {
  logger.info(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
  startTokenCleanup();
});

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  clearInterval(cleanupTimer);

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await prisma.$disconnect();
      logger.info('Database connection closed');
    } catch (err) {
      logger.error(err, 'Error disconnecting from database');
    }

    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error(reason, 'Unhandled Rejection');
});

process.on('uncaughtException', (error) => {
  logger.fatal(error, 'Uncaught Exception');
  process.exit(1);
});

export default server;
