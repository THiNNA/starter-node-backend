import { z } from 'zod';

export const getUsersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const getUserByIdSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
});
