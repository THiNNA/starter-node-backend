import { Router } from 'express';
import { authenticate, validate } from '../../middlewares';
import {
  createProductSchema,
  updateProductSchema,
  getProductByIdSchema,
  getProductsSchema,
} from './product.validation';
import * as productController from './product.controller';

const router = Router();

// All product routes require authentication
router.use(authenticate);

router.post('/', validate(createProductSchema), productController.createProduct);
router.get('/', validate(getProductsSchema, 'query'), productController.getProducts);
router.get('/:id', validate(getProductByIdSchema, 'params'), productController.getProductById);
router.put('/:id', validate(getProductByIdSchema, 'params'), validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', validate(getProductByIdSchema, 'params'), productController.deleteProduct);

export default router;
