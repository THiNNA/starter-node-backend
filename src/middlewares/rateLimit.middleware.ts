import rateLimit from 'express-rate-limit';
import { appConfigService, CONFIG_KEYS } from '../modules/app-config';

export function createRateLimiter() {
  return rateLimit({
    windowMs: appConfigService.getNumber(CONFIG_KEYS.RATE_LIMIT_WINDOW_MS),
    limit: appConfigService.getNumber(CONFIG_KEYS.RATE_LIMIT_MAX),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      message: 'Too many requests, please try again later.',
    },
  });
}

export function createAuthRateLimiter() {
  return rateLimit({
    windowMs: appConfigService.getNumber(CONFIG_KEYS.AUTH_RATE_LIMIT_WINDOW_MS),
    limit: appConfigService.getNumber(CONFIG_KEYS.AUTH_RATE_LIMIT_MAX),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
      message: 'Too many authentication attempts, please try again later.',
    },
  });
}

// Keep backward-compatible exports (initialized with defaults, replaced after DB load)
export let rateLimiter = createRateLimiter();
export let authRateLimiter = createAuthRateLimiter();

/**
 * Reinitialize rate limiters with current DB config values.
 * Called after appConfigService.loadAll() completes.
 */
export function refreshRateLimiters(): void {
  rateLimiter = createRateLimiter();
  authRateLimiter = createAuthRateLimiter();
}
