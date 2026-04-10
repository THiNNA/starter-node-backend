import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be at most 200 characters'),
  description: z.string().max(5000, 'Description must be at most 5000 characters').optional(),
  price: z.number().nonnegative('Price must be non-negative'),
  stock: z.number().int('Stock must be an integer').nonnegative('Stock must be non-negative').optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be at most 200 characters').optional(),
  description: z.string().max(5000, 'Description must be at most 5000 characters').optional(),
  price: z.number().nonnegative('Price must be non-negative').optional(),
  stock: z.number().int('Stock must be an integer').nonnegative('Stock must be non-negative').optional(),
  isActive: z.boolean().optional(),
});

export const getProductByIdSchema = z.object({
  id: z.string().uuid('Invalid product ID'),
});

export const getProductsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
});
