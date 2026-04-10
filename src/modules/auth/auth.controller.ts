import { Request, Response } from 'express';
import { asyncHandler, sendSuccess } from '../../core';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { UserRepository } from '../user/user.repository';

const authService = new AuthService(new AuthRepository(), new UserRepository());

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const tokens = await authService.register(req.body);
  sendSuccess(res, tokens, { model: 'auth', method: 'register' }, 201);
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const tokens = await authService.login(req.body);
  sendSuccess(res, tokens, { model: 'auth', method: 'login' });
});

export const refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const tokens = await authService.refresh(req.body.refreshToken);
  sendSuccess(res, tokens, { model: 'auth', method: 'refresh' });
});

export const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  await authService.logout(req.body.refreshToken);
  sendSuccess(res, null, { model: 'auth', method: 'logout' });
});
