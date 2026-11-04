import { Request, Response, NextFunction } from 'express';
import userService from '../services/userService';
import auditLogService from '../services/auditLogService';

class UserController {
  // Registro público: cria admin + tenant do cliente
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;
      const user = await userService.createAdminWithTenant({ name, email, password, role: 'admin' });
      const { password: _password, ...userSafe } = user.toJSON();
      res.status(201).json(userSafe);
    } catch (err) {
      next(err);
    }
  }

  // Equipe: o administrador cria usuários de acesso limitado na própria empresa
  async createMember(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const { name, email, password } = req.body;
      const user = await userService.createMember(tenantId, { name, email, password });
      await auditLogService.create({
        tenantId,
        userId: req.user!.id,
        action: 'create',
        entity: 'user',
        entityId: user.id,
        description: `Usuário da equipe criado: ${user.name}`,
      });
      const { password: _password, ...userSafe } = user.toJSON();
      res.status(201).json(userSafe);
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const users = await userService.getAll(tenantId);
      const safeUsers = users.map((u) => {
        const { password, ...rest } = u.toJSON();
        return rest;
      });
      res.json(safeUsers);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const user = await userService.getById(Number(req.params.id), tenantId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const { password, ...safeUser } = user.toJSON();
      return res.json(safeUser);
    } catch (err) {
      return next(err);
    }
  }

  async updateById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const user = await userService.updateById(Number(req.params.id), tenantId, req.body);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const { password, ...safeUser } = user.toJSON();
      return res.json(safeUser);
    } catch (err) {
      return next(err);
    }
  }

  async deleteById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const userId = Number(req.params.id);
      const success = await userService.deleteById(userId, tenantId);
      if (!success) return res.status(404).json({ error: 'User not found' });
      await auditLogService.create({
        tenantId,
        userId: req.user!.id,
        action: 'delete',
        entity: 'user',
        entityId: userId,
        description: `Usuário da equipe removido: ${userId}`,
      });
      return res.status(204).send();
    } catch (err) {
      return next(err);
    }
  }

  async restore(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const user = await userService.restore(Number(req.params.id), tenantId);
      if (!user) return res.status(404).json({ error: 'User not found or not deleted' });
      const { password, ...safeUser } = user.toJSON();
      return res.json(safeUser);
    } catch (err) {
      return next(err);
    }
  }
}

export default new UserController();
