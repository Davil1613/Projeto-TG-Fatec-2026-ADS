import { Router } from 'express';
import AuditLogController from '../controllers/auditLogController';
import { authenticateToken } from '../middlewares/auth';

const auditLogRouter = Router();
auditLogRouter.use(authenticateToken);

auditLogRouter.get('/', (req, res, next) =>
  AuditLogController.getAll(req, res, next));

export default auditLogRouter;
