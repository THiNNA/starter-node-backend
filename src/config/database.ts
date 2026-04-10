import env from './env';

const database = {
  url: env.databaseUrl,
} as const;

export default database;
