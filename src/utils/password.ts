import bcrypt from 'bcrypt';
import { appConfigService, CONFIG_KEYS } from '../modules/app-config';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = appConfigService.getNumber(CONFIG_KEYS.BCRYPT_SALT_ROUNDS);
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
