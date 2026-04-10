import { Request, Response } from 'express';
import { asyncHandler, sendSuccess, sendPaginated } from '../../core';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';

const userService = new UserService(new UserRepository());

export const getUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { users, total } = await userService.getUsers(page, limit);
  sendPaginated(res, users, { page, limit, total });
});

export const getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const user = await userService.getUserById(req.params.id);
  sendSuccess(res, user);
});
