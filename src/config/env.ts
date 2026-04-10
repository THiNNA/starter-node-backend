import dotenv from 'dotenv';

dotenv.config();

const env = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
};

export default env;
