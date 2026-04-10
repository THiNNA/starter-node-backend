import { Router } from 'express';
import { validate, authRateLimiter } from '../../middlewares';
import { registerSchema, loginSchema, refreshSchema, logoutSchema } from './auth.validation';
import * as authController from './auth.controller';

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', validate(logoutSchema), authController.logout);

export default router;
