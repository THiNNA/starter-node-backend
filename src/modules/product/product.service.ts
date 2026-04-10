import { NotFoundError } from '../../core';
import { ProductRepository } from './product.repository';
import { ProductResponse, CreateProductInput, UpdateProductInput } from './product.types';
import { Product, Prisma } from '@prisma/client';

export class ProductService {
  constructor(private productRepository: ProductRepository) {}

  private toResponse(product: Product): ProductResponse {
    return {
      id: product.product_id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      stock: product.stock,
      isActive: product.is_active,
      createdBy: product.created_by,
      updatedBy: product.updated_by,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    };
  }

  async create(input: CreateProductInput, userId: string): Promise<ProductResponse> {
    const product = await this.productRepository.create({
      name: input.name,
      description: input.description,
      price: input.price,
      stock: input.stock ?? 0,
      created_by: userId,
    });
    return this.toResponse(product);
  }

  async getAll(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ products: ProductResponse[]; total: number }> {
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      ...(search && {
        OR: [
          { name: { contains: search } },
          { description: { contains: search } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      this.productRepository.findMany({ skip, take: limit, where }),
      this.productRepository.count(where),
    ]);

    return { products: products.map((p) => this.toResponse(p)), total };
  }

  async getById(id: string): Promise<ProductResponse> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return this.toResponse(product);
  }

  async update(id: string, input: UpdateProductInput, userId: string): Promise<ProductResponse> {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Product not found');
    }

    const product = await this.productRepository.update(id, {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.price !== undefined && { price: input.price }),
      ...(input.stock !== undefined && { stock: input.stock }),
      ...(input.isActive !== undefined && { is_active: input.isActive }),
      updated_by: userId,
    });

    return this.toResponse(product);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.productRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Product not found');
    }
    await this.productRepository.delete(id);
  }
}
