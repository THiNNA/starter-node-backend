import { Request, Response, NextFunction } from 'express';
import { BaseError, ValidationError } from '../core';
import { logger } from '../config';

interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  stack?: string;
}

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction): void => {
  logger.error(
    {
      err,
      requestId: req.requestId,
      method: req.method,
      url: req.url,
    },
    err.message,
  );

  if (err instanceof ValidationError) {
    const response: ErrorResponse = {
      success: false,
      message: err.message,
      errors: err.errors,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  if (err instanceof BaseError) {
    const response: ErrorResponse = {
      success: false,
      message: err.message,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  const response: ErrorResponse = {
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };
  res.status(500).json(response);
};
