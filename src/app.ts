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
  rateLimiter,
} from './middlewares';
import router from './routes';

const app: Application = express();

// Security middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.cors.origin === '*' ? true : env.cors.origin.split(','),
    credentials: true,
  }),
);
app.use(rateLimiter);

// Body parsing with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request ID & logging
app.use(requestIdMiddleware);
app.use(requestLogger);

// API routes
app.use(API_PREFIX, router);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export default app;
