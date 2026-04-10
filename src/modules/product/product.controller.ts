import { Request, Response } from 'express';
import { asyncHandler, sendSuccess, sendPaginated } from '../../core';
import { AuthenticatedRequest } from '../../types';
import { ProductService } from './product.service';
import { ProductRepository } from './product.repository';

const productService = new ProductService(new ProductRepository());

export const createProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const product = await productService.create(req.body, authReq.user!.userId);
  sendSuccess(res, product, { model: 'product', method: 'createProduct' }, 201);
});

export const getProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search as string | undefined;
  const { products, total } = await productService.getAll(page, limit, search);
  sendPaginated(res, products, { page, limit, total }, { model: 'product', method: 'getProducts' });
});

export const getProductById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const product = await productService.getById(req.params.id);
  sendSuccess(res, product, { model: 'product', method: 'getProductById' });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const product = await productService.update(req.params.id, req.body, authReq.user!.userId);
  sendSuccess(res, product, { model: 'product', method: 'updateProduct' });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  await productService.delete(req.params.id);
  sendSuccess(res, null, { model: 'product', method: 'deleteProduct' });
});
