import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config';
import { appConfigService, CONFIG_KEYS } from '../modules/app-config';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: appConfigService.getString(CONFIG_KEYS.JWT_ACCESS_EXPIRES_IN) as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.jwt.accessSecret, options);
}

export function generateRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: appConfigService.getString(CONFIG_KEYS.JWT_REFRESH_EXPIRES_IN) as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.jwt.refreshSecret, options);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwt.accessSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwt.refreshSecret) as TokenPayload;
}
