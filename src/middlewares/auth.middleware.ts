import { Response, NextFunction } from 'express';
import { AuthError } from '../core';
import { verifyAccessToken } from '../utils';
import { AuthenticatedRequest } from '../types';

export const authenticate = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Access token is required');
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch {
    throw new AuthError('Invalid or expired access token');
  }
};
