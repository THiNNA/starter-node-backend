import { prisma } from '../../database';
import { AppConfig } from '@prisma/client';

export class AppConfigRepository {
  async findByKey(key: string): Promise<AppConfig | null> {
    return prisma.appConfig.findUnique({ where: { config_key: key } });
  }

  async findAll(): Promise<AppConfig[]> {
    return prisma.appConfig.findMany({ orderBy: { config_key: 'asc' } });
  }

  async upsert(key: string, value: string, description?: string): Promise<AppConfig> {
    return prisma.appConfig.upsert({
      where: { config_key: key },
      update: { value, ...(description !== undefined && { description }) },
      create: { config_key: key, value, description: description ?? null },
    });
  }
}
