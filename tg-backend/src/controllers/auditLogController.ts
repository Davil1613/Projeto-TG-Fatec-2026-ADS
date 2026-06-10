import { NextFunction, Request, Response } from 'express';
import auditLogService from '../services/auditLogService';

class AuditLogController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const logs = await auditLogService.getAll(tenantId);
      return res.json(logs);
    } catch (err) {
      return next(err);
    }
  }
}

export default new AuditLogController();
