import { Router } from 'express';
import UploadController from '../controllers/uploadController';
import { authenticateToken, requireAdmin } from '../middlewares/auth';
import { requireActiveSubscription } from '../middlewares/subscription';

const uploadsRouter = Router();

uploadsRouter.use(authenticateToken, requireActiveSubscription, requireAdmin);
uploadsRouter.post('/product-image', (req, res) => UploadController.uploadProductImage(req, res));

export default uploadsRouter;
