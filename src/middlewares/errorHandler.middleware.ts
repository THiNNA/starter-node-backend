import { Request, Response, NextFunction } from 'express';
import { BaseError, ValidationError } from '../core';
import type { ApiResponse, ResponseHead } from '../core';
import { logger } from '../config';

function extractModelFromUrl(url: string): string {
  // Extract module name from URL path, e.g. /api/v1/auth/login → auth
  const segments = url.replace(/^\/api\/v\d+\//, '').split('/');
  return segments[0] || 'unknown';
}

function extractMethodFromUrl(url: string): string {
  // Extract method from URL path, e.g. /api/v1/auth/login → login
  const segments = url.replace(/^\/api\/v\d+\//, '').split('/');
  return segments[1] || segments[0] || 'unknown';
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

  const model = extractModelFromUrl(req.originalUrl || req.url);
  const method = extractMethodFromUrl(req.originalUrl || req.url);

  if (err instanceof ValidationError) {
    const head: ResponseHead = {
      model,
      method,
      errorcode: String(err.statusCode),
      errorflag: 'Y',
      errordesc: err.message,
    };
    const response: ApiResponse<{ errors: Record<string, string[]> }> = {
      head,
      body: { errors: err.errors },
    };
    res.status(err.statusCode).json(response);
    return;
  }

  if (err instanceof BaseError) {
    const head: ResponseHead = {
      model,
      method,
      errorcode: String(err.statusCode),
      errorflag: 'Y',
      errordesc: err.message,
    };
    const response: ApiResponse<null> = {
      head,
      body: null,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  const head: ResponseHead = {
    model,
    method,
    errorcode: '500',
    errorflag: 'Y',
    errordesc: 'Internal server error',
  };
  const response: ApiResponse<{ stack?: string } | null> = {
    head,
    body: process.env.NODE_ENV === 'development' ? { stack: err.stack } : null,
  };
  res.status(500).json(response);
};
