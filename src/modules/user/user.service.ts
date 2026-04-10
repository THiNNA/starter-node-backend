import { NotFoundError } from '../../core';
import { UserRepository } from './user.repository';
import { UserResponse } from './user.types';
import { User } from '@prisma/client';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  private toResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getUsers(page: number, limit: number): Promise<{ users: UserResponse[]; total: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userRepository.findMany({ skip, take: limit }),
      this.userRepository.count(),
    ]);
    return { users: users.map((u) => this.toResponse(u)), total };
  }

  async getUserById(id: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return this.toResponse(user);
  }
}
