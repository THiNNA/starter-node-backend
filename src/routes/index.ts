import { Router, Request, Response } from 'express';
import { authRouter } from '../modules/auth';
import { userRouter } from '../modules/user';

const router = Router();

// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// Module routes
router.use('/auth', authRouter);
router.use('/users', userRouter);

export default router;
