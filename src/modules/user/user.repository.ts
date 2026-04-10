import { prisma } from '../../database';
import { User } from '@prisma/client';

export class UserRepository {
  async create(data: { email: string; password: string }): Promise<User> {
    return prisma.user.create({ data });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { user_id: id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findMany(params: { skip: number; take: number }): Promise<User[]> {
    return prisma.user.findMany({
      skip: params.skip,
      take: params.take,
      orderBy: { created_at: 'desc' },
    });
  }

  async count(): Promise<number> {
    return prisma.user.count();
  }
}
