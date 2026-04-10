export const CONFIG_KEYS = {
  // JWT
  JWT_ACCESS_EXPIRES_IN: 'jwt.accessExpiresIn',
  JWT_REFRESH_EXPIRES_IN: 'jwt.refreshExpiresIn',
  REFRESH_TOKEN_DAYS: 'auth.refreshTokenDays',

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 'rateLimit.windowMs',
  RATE_LIMIT_MAX: 'rateLimit.max',
  AUTH_RATE_LIMIT_WINDOW_MS: 'rateLimit.auth.windowMs',
  AUTH_RATE_LIMIT_MAX: 'rateLimit.auth.max',

  // Security
  BCRYPT_SALT_ROUNDS: 'security.bcryptSaltRounds',
  BODY_MAX_SIZE: 'security.bodyMaxSize',

  // Server
  CLEANUP_INTERVAL_MS: 'server.cleanupIntervalMs',
  SHUTDOWN_TIMEOUT_MS: 'server.shutdownTimeoutMs',
} as const;

export type ConfigKey = (typeof CONFIG_KEYS)[keyof typeof CONFIG_KEYS];

export interface AppConfigEntry {
  key: string;
  value: string;
  description: string | null;
  updatedAt: Date;
}

export interface DefaultConfig {
  key: string;
  value: string;
  description: string;
}
