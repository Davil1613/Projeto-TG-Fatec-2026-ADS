import { Request, Response, NextFunction } from 'express';
import categoryService from '../services/categoryService';
import auditLogService from '../services/auditLogService';

class CategoryController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const category = await categoryService.create(tenantId, req.body);
      await auditLogService.create({
        tenantId,
        userId: req.user!.id,
        action: 'create',
        entity: 'category',
        entityId: category.id,
        description: `Categoria criada: ${category.name}`,
      });
      res.status(201).json(category);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const categories = await categoryService.getAll(tenantId);
      res.json(categories);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const category = await categoryService.getById(Number(req.params.id), tenantId);
      if (!category) return res.status(404).json({ error: 'Categoria nao encontrada' });
      return res.json(category);
    } catch (err) {
      return next(err);
    }
  }

  async updateById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const category = await categoryService.updateById(Number(req.params.id), tenantId, req.body);
      if (!category) return res.status(404).json({ error: 'Categoria nao encontrada' });
      await auditLogService.create({
        tenantId,
        userId: req.user!.id,
        action: 'update',
        entity: 'category',
        entityId: category.id,
        description: `Categoria atualizada: ${category.name}`,
      });
      return res.json(category);
    } catch (err) {
      return next(err);
    }
  }

  async deleteById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const categoryId = Number(req.params.id);
      const success = await categoryService.deleteById(categoryId, tenantId);
      if (!success) return res.status(404).json({ error: 'Categoria nao encontrada' });
      await auditLogService.create({
        tenantId,
        userId: req.user!.id,
        action: 'delete',
        entity: 'category',
        entityId: categoryId,
        description: `Categoria excluida: ${categoryId}`,
      });
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }
}

export default new CategoryController();
