import { env, logger } from './config';
import { prisma } from './database';
import { appConfigService, CONFIG_KEYS } from './modules/app-config';
import { refreshRateLimiters } from './middlewares';
import { createApp } from './app';

let cleanupTimer: ReturnType<typeof setInterval>;

const startTokenCleanup = (): void => {
  const intervalMs = appConfigService.getNumber(CONFIG_KEYS.CLEANUP_INTERVAL_MS);
  cleanupTimer = setInterval(async () => {
    try {
      const result = await prisma.refreshToken.deleteMany({
        where: { expires_at: { lt: new Date() } },
      });
      if (result.count > 0) {
        logger.info(`Cleaned up ${result.count} expired refresh tokens`);
      }
    } catch (err) {
      logger.error(err, 'Failed to cleanup expired tokens');
    }
  }, intervalMs);
  logger.info(`Token cleanup scheduled every ${intervalMs}ms`);
};

async function bootstrap(): Promise<void> {
  // 1. Load config from DB (seed defaults first)
  await appConfigService.seedDefaults();
  await appConfigService.loadAll();

  // 2. Reinitialize rate limiters with DB config values
  refreshRateLimiters();

  // 3. Create Express app (uses DB config for body size, etc.)
  const app = createApp();

  // 4. Start HTTP server
  const server = app.listen(env.port, () => {
    logger.info(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
    startTokenCleanup();
  });

  // Graceful shutdown
  const shutdownTimeoutMs = appConfigService.getNumber(CONFIG_KEYS.SHUTDOWN_TIMEOUT_MS);

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

    // Force shutdown after timeout
    setTimeout(() => {
      logger.error('Forced shutdown due to timeout');
      process.exit(1);
    }, shutdownTimeoutMs);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

process.on('unhandledRejection', (reason) => {
  logger.error(reason, 'Unhandled Rejection');
});

process.on('uncaughtException', (error) => {
  logger.fatal(error, 'Uncaught Exception');
  process.exit(1);
});

bootstrap().catch((err) => {
  logger.fatal(err, 'Failed to start server');
  process.exit(1);
});
