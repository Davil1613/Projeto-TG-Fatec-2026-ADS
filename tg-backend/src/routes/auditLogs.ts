import { Router } from 'express';
import AuditLogController from '../controllers/auditLogController';
import { authenticateToken, requireAdmin } from '../middlewares/auth';
import { requireActiveSubscription } from '../middlewares/subscription';

const auditLogRouter = Router();
auditLogRouter.use(authenticateToken, requireActiveSubscription, requireAdmin);

auditLogRouter.get('/', (req, res, next) =>
  AuditLogController.getAll(req, res, next));

export default auditLogRouter;
