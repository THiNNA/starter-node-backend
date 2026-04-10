import { prisma } from '../../database';
import { AppConfig } from '@prisma/client';

export class AppConfigRepository {
  async findByKey(key: string): Promise<AppConfig | null> {
    return prisma.appConfig.findUnique({ where: { key } });
  }

  async findAll(): Promise<AppConfig[]> {
    return prisma.appConfig.findMany({ orderBy: { key: 'asc' } });
  }

  async upsert(key: string, value: string, description?: string): Promise<AppConfig> {
    return prisma.appConfig.upsert({
      where: { key },
      update: { value, ...(description !== undefined && { description }) },
      create: { key, value, description: description ?? null },
    });
  }
}
