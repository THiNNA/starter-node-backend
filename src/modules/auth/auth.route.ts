import { Router } from 'express';
import { validate, authenticate, authRateLimiter } from '../../middlewares';
import { registerSchema, loginSchema, refreshSchema, logoutSchema } from './auth.validation';
import * as authController from './auth.controller';

const router = Router();

// Use function wrapper so refreshed authRateLimiter is picked up
router.post('/register', (req, res, next) => authRateLimiter(req, res, next), validate(registerSchema), authController.register);
router.post('/login', (req, res, next) => authRateLimiter(req, res, next), validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', authenticate, validate(logoutSchema), authController.logout);

export default router;
