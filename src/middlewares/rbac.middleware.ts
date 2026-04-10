import { Response, NextFunction } from 'express';
import { ForbiddenError } from '../core';
import { AuthenticatedRequest } from '../types';

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new ForbiddenError('Access denied');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
};
