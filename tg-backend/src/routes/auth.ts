import { Router } from 'express';
import AuthController from '../controllers/authController';

const router = Router();

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags:
 *       - Autenticação
 *     summary: Realiza login do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', AuthController.login);
router.post('/forgot-password', (req, res) => AuthController.forgotPassword(req, res));
router.post('/reset-password', (req, res) => AuthController.resetPassword(req, res));

export default router;
