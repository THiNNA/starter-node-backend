import { AuthError, ConflictError } from '../../core';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from '../../utils';
import { UserRepository } from '../user/user.repository';
import { AuthRepository } from './auth.repository';
import { RegisterInput, LoginInput, AuthTokens } from './auth.types';
import { appConfigService, CONFIG_KEYS } from '../app-config';

export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private userRepository: UserRepository,
  ) {}

  async register(input: RegisterInput): Promise<AuthTokens> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const hashedPassword = await hashPassword(input.password);
    const user = await this.userRepository.create({
      email: input.email,
      password: hashedPassword,
    });

    const tokenPayload: TokenPayload = {
      userId: user.user_id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await this.storeRefreshToken(refreshToken, user.user_id);

    return { accessToken, refreshToken };
  }

  async login(input: LoginInput): Promise<AuthTokens> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user || !user.is_active) {
      throw new AuthError('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(input.password, user.password);
    if (!isPasswordValid) {
      throw new AuthError('Invalid email or password');
    }

    const tokenPayload: TokenPayload = {
      userId: user.user_id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await this.storeRefreshToken(refreshToken, user.user_id);

    return { accessToken, refreshToken };
  }

  async refresh(oldRefreshToken: string): Promise<AuthTokens> {
    let payload: TokenPayload;
    try {
      payload = verifyRefreshToken(oldRefreshToken);
    } catch {
      throw new AuthError('Invalid refresh token');
    }

    const storedToken = await this.authRepository.findRefreshToken(oldRefreshToken);
    if (!storedToken) {
      // Token reuse detected — revoke all tokens for this user
      await this.authRepository.deleteUserRefreshTokens(payload.userId);
      throw new AuthError('Refresh token reuse detected');
    }

    if (storedToken.expires_at < new Date()) {
      await this.authRepository.deleteRefreshToken(oldRefreshToken);
      throw new AuthError('Refresh token expired');
    }

    // Rotate: delete old token, issue new pair
    await this.authRepository.deleteRefreshToken(oldRefreshToken);

    const tokenPayload: TokenPayload = {
      userId: storedToken.user.user_id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await this.storeRefreshToken(refreshToken, storedToken.user.user_id);

    return { accessToken, refreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.authRepository.deleteRefreshToken(refreshToken);
  }

  private async storeRefreshToken(token: string, userId: string): Promise<void> {
    const refreshTokenDays = appConfigService.getNumber(CONFIG_KEYS.REFRESH_TOKEN_DAYS);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshTokenDays);

    await this.authRepository.createRefreshToken({
      token,
      user_id: userId,
      expires_at: expiresAt,
    });
  }
}
