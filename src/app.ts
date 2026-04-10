import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { env } from './config';
import { API_PREFIX } from './constants';
import {
  requestIdMiddleware,
  requestLogger,
  errorHandler,
  notFoundHandler,
} from './middlewares';
import router from './routes';
import { appConfigService, CONFIG_KEYS } from './modules/app-config';

export function createApp(): Application {
  const app: Application = express();

  const bodyMaxSize = appConfigService.getString(CONFIG_KEYS.BODY_MAX_SIZE);

  // Security middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: env.cors.origin === '*' ? true : env.cors.origin.split(','),
      credentials: true,
    }),
  );

  // Body parsing with size limits from DB config
  app.use(express.json({ limit: bodyMaxSize }));
  app.use(express.urlencoded({ extended: true, limit: bodyMaxSize }));

  // Request ID & logging
  app.use(requestIdMiddleware);
  app.use(requestLogger);

  // API routes
  app.use(API_PREFIX, router);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler
  app.use(errorHandler);

  return app;
}
