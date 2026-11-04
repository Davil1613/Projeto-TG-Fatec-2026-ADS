import { Request, Response, NextFunction } from 'express';
import productService from '../services/productService';
import auditLogService from '../services/auditLogService';
import ProductModel from '../models/Product';

function forRole(product: ProductModel, role: 'admin' | 'user') {
  const data = product.toJSON() as Record<string, unknown>;
  if (role !== 'admin') delete data.costPrice;
  return data;
}

class ProductController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const product = await productService.create(tenantId, req.body);
      await auditLogService.create({
        tenantId,
        userId: req.user!.id,
        action: 'create',
        entity: 'product',
        entityId: product?.id,
        description: `Produto criado: ${product?.name || req.body.name}`,
      });
      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const products = await productService.getAll(tenantId);
      res.json(products.map((product) => forRole(product, req.user!.role)));
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const product = await productService.getById(Number(req.params.id), tenantId);
      if (!product) return res.status(404).json({ error: 'Produto nao encontrado' });
      return res.json(forRole(product, req.user!.role));
    } catch (err) {
      return next(err);
    }
  }

  async updateById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const product = await productService.updateById(Number(req.params.id), tenantId, req.body);
      if (!product) return res.status(404).json({ error: 'Produto nao encontrado' });
      await auditLogService.create({
        tenantId,
        userId: req.user!.id,
        action: 'update',
        entity: 'product',
        entityId: product.id,
        description: `Produto atualizado: ${product.name}`,
      });
      return res.json(product);
    } catch (err) {
      return next(err);
    }
  }

  async deleteById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const productId = Number(req.params.id);
      const success = await productService.deleteById(productId, tenantId);
      if (!success) return res.status(404).json({ error: 'Produto nao encontrado' });
      await auditLogService.create({
        tenantId,
        userId: req.user!.id,
        action: 'delete',
        entity: 'product',
        entityId: productId,
        description: `Produto excluido: ${productId}`,
      });
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }
}

export default new ProductController();
