import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const nodeEnv = process.env.NODE_ENV ?? 'development';
const isProduction = nodeEnv === 'production';

const env = {
  nodeEnv,
  port: parseInt(process.env.PORT ?? '3000', 10),
  databaseUrl: isProduction ? requireEnv('DATABASE_URL') : (process.env.DATABASE_URL ?? ''),
  jwt: {
    accessSecret: isProduction
      ? requireEnv('JWT_ACCESS_SECRET')
      : (process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret'),
    refreshSecret: isProduction
      ? requireEnv('JWT_REFRESH_SECRET')
      : (process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret'),
  },
  cors: {
    origin: process.env.CORS_ORIGIN ?? '*',
  },
  isDevelopment: nodeEnv === 'development',
  isProduction,
} as const;

export default env;
