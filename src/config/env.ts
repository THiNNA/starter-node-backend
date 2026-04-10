import dotenv from 'dotenv';

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'access-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret-change-me',
    accessExpiresIn: '15m',
    refreshExpiresIn: '7d',
  },
  isDevelopment: (process.env.NODE_ENV ?? 'development') === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

export default env;
