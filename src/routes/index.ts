import { Router, Request, Response } from 'express';
import { rateLimiter } from '../middlewares';
import { authRouter } from '../modules/auth';
import { userRouter } from '../modules/user';
import { productRouter } from '../modules/product';

const router = Router();

// Global rate limiter (applied via function reference so refreshes take effect)
router.use((req, res, next) => rateLimiter(req, res, next));

// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    head: {
      model: 'health',
      method: 'check',
      errorcode: '0',
      errorflag: 'N',
      errordesc: '',
    },
    body: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// Module routes
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/products', productRouter);

export default router;
