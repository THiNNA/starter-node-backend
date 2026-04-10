import { Request, Response } from 'express';
import { NotFoundError } from '../core';

export const notFoundHandler = (_req: Request, _res: Response): void => {
  throw new NotFoundError('Route not found');
};
