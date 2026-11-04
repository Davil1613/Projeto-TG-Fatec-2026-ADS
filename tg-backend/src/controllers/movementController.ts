import { NextFunction, Request, Response } from 'express';
import movementService from '../services/movementService';
import auditLogService from '../services/auditLogService';

class MovementController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const movement = await movementService.create(tenantId, req.body);
      await auditLogService.create({
        tenantId,
        userId: req.user!.id,
        action: 'create',
        entity: 'movement',
        entityId: movement.id,
        description: `${req.body.movementType} de ${req.body.quantity} unidade(s)`,
      });
      res.status(201).json(movement);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const movements = await movementService.getAll(tenantId);
      res.json(movements);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const movement = await movementService.getById(Number(req.params.id), tenantId);
      if (!movement) return res.status(404).json({ error: 'Movimentacao nao encontrada' });
      return res.json(movement);
    } catch (err) {
      return next(err);
    }
  }
}

export default new MovementController();
