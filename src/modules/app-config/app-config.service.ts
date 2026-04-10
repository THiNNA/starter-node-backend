import { logger } from '../../config';
import { AppConfigRepository } from './app-config.repository';
import { CONFIG_KEYS, ConfigKey, DefaultConfig } from './app-config.types';

const DEFAULT_CONFIGS: DefaultConfig[] = [
  // JWT
  { key: CONFIG_KEYS.JWT_ACCESS_EXPIRES_IN, value: '15m', description: 'JWT access token expiration (e.g. 15m, 1h)' },
  { key: CONFIG_KEYS.JWT_REFRESH_EXPIRES_IN, value: '7d', description: 'JWT refresh token expiration (e.g. 7d, 30d)' },
  { key: CONFIG_KEYS.REFRESH_TOKEN_DAYS, value: '7', description: 'Refresh token storage duration in days' },

  // Rate limiting
  { key: CONFIG_KEYS.RATE_LIMIT_WINDOW_MS, value: '900000', description: 'Global rate limit window in milliseconds (default: 15 min)' },
  { key: CONFIG_KEYS.RATE_LIMIT_MAX, value: '100', description: 'Max requests per rate limit window' },
  { key: CONFIG_KEYS.AUTH_RATE_LIMIT_WINDOW_MS, value: '900000', description: 'Auth rate limit window in milliseconds (default: 15 min)' },
  { key: CONFIG_KEYS.AUTH_RATE_LIMIT_MAX, value: '20', description: 'Max auth requests per rate limit window' },

  // Security
  { key: CONFIG_KEYS.BCRYPT_SALT_ROUNDS, value: '12', description: 'bcrypt salt rounds for password hashing' },
  { key: CONFIG_KEYS.BODY_MAX_SIZE, value: '10kb', description: 'Max request body size (e.g. 10kb, 1mb)' },

  // Server
  { key: CONFIG_KEYS.CLEANUP_INTERVAL_MS, value: '3600000', description: 'Expired token cleanup interval in milliseconds (default: 1 hour)' },
  { key: CONFIG_KEYS.SHUTDOWN_TIMEOUT_MS, value: '10000', description: 'Graceful shutdown timeout in milliseconds' },
];

/**
 * In-memory cache for app configs loaded from DB.
 * Values are loaded at startup and can be refreshed at runtime.
 */
const configCache = new Map<string, string>();

export class AppConfigService {
  constructor(private repository: AppConfigRepository) {}

  /**
   * Seed default config values into DB (upsert — won't overwrite existing).
   * Called once at server startup.
   */
  async seedDefaults(): Promise<void> {
    for (const config of DEFAULT_CONFIGS) {
      const existing = await this.repository.findByKey(config.key);
      if (!existing) {
        await this.repository.upsert(config.key, config.value, config.description);
        logger.info(`Seeded config: ${config.key} = ${config.value}`);
      }
    }
  }

  /**
   * Load all configs from DB into in-memory cache.
   * Called once at startup after seeding.
   */
  async loadAll(): Promise<void> {
    const configs = await this.repository.findAll();
    configCache.clear();
    for (const c of configs) {
      configCache.set(c.config_key, c.value);
    }
    logger.info(`Loaded ${configs.length} app configs from database`);
  }

  /**
   * Reload all configs from DB (can be called at runtime to pick up changes).
   */
  async reload(): Promise<void> {
    await this.loadAll();
  }

  /**
   * Get a config value from the in-memory cache.
   * Falls back to the hardcoded default if not found.
   */
  getString(key: ConfigKey): string {
    const cached = configCache.get(key);
    if (cached !== undefined) return cached;

    const defaultEntry = DEFAULT_CONFIGS.find((c) => c.key === key);
    return defaultEntry?.value ?? '';
  }

  getNumber(key: ConfigKey): number {
    return parseInt(this.getString(key), 10);
  }

  /**
   * Update a config value in both DB and cache.
   */
  async set(key: string, value: string): Promise<void> {
    await this.repository.upsert(key, value);
    configCache.set(key, value);
    logger.info(`Updated config: ${key} = ${value}`);
  }
}

// Singleton instances
const appConfigRepository = new AppConfigRepository();
export const appConfigService = new AppConfigService(appConfigRepository);
