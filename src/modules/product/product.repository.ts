import { prisma } from '../../database';
import { Product, Prisma } from '@prisma/client';

export class ProductRepository {
  async create(data: Prisma.ProductUncheckedCreateInput): Promise<Product> {
    return prisma.product.create({ data });
  }

  async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { product_id: id } });
  }

  async findMany(params: {
    skip: number;
    take: number;
    where?: Prisma.ProductWhereInput;
  }): Promise<Product[]> {
    return prisma.product.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: { created_at: 'desc' },
    });
  }

  async count(where?: Prisma.ProductWhereInput): Promise<number> {
    return prisma.product.count({ where });
  }

  async update(id: string, data: Prisma.ProductUncheckedUpdateInput): Promise<Product> {
    return prisma.product.update({
      where: { product_id: id },
      data,
    });
  }

  async delete(id: string): Promise<Product> {
    return prisma.product.delete({ where: { product_id: id } });
  }
}
