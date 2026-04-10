import { Request, Response, NextFunction } from 'express';
import { BaseError, ValidationError } from '../core';
import { logger } from '../config';

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
    res.status(err.statusCode).json({
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  if (err instanceof BaseError) {
    res.status(err.statusCode).json({
      message: err.message,
    });
    return;
  }

  res.status(500).json({
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
