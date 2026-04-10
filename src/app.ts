import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';

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
app.use(cors());
app.use(rateLimiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
