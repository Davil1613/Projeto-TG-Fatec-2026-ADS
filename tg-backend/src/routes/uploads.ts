import { Router } from 'express';
import UploadController from '../controllers/uploadController';
import { authenticateToken } from '../middlewares/auth';

const uploadsRouter = Router();

uploadsRouter.use(authenticateToken);
uploadsRouter.post('/product-image', (req, res) => UploadController.uploadProductImage(req, res));

export default uploadsRouter;
