import { Router } from 'express';
import { authenticate, authorize, validate } from '../../middlewares';
import { getUsersSchema, getUserByIdSchema } from './user.validation';
import * as userController from './user.controller';

const router = Router();

router.get('/', authenticate, validate(getUsersSchema, 'query'), userController.getUsers);
router.get('/:id', authenticate, validate(getUserByIdSchema, 'params'), userController.getUserById);

// Example: admin-only route
router.get(
  '/admin/all',
  authenticate,
  authorize('ADMIN'),
  validate(getUsersSchema, 'query'),
  userController.getUsers,
);

export default router;
