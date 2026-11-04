import { Router } from 'express';
import BillingController from '../controllers/billingController';
import { authenticateToken, requireAdmin } from '../middlewares/auth';

const billingRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Assinatura
 *   description: Período de teste e assinatura mensal via Mercado Pago
 */

billingRouter
  /**
   * @swagger
   * /api/v1/billing/webhook:
   *   post:
   *     tags:
   *       - Assinatura
   *     summary: Recebe notificações do Mercado Pago (tópico subscription_preapproval)
   *     description: O status é sempre reconsultado na API do Mercado Pago; o corpo da notificação não é usado como fonte de verdade.
   *     responses:
   *       200:
   *         description: Notificação recebida
   */
  .post('/webhook', (req, res) => BillingController.webhook(req, res))
  .use(authenticateToken)

  /**
   * @swagger
   * /api/v1/billing/status:
   *   get:
   *     tags:
   *       - Assinatura
   *     summary: Situação da assinatura da empresa (teste, ativa, pendente)
   *     responses:
   *       200:
   *         description: Situação atual, dias restantes de teste e se há acesso liberado
   */
  .get('/status', (req, res, next) => BillingController.getStatus(req, res, next))

  /**
   * @swagger
   * /api/v1/billing/checkout:
   *   post:
   *     tags:
   *       - Assinatura
   *     summary: Cria a assinatura no Mercado Pago e retorna o link de pagamento (somente administrador)
   *     responses:
   *       201:
   *         description: Link do checkout (init_point) gerado
   *       503:
   *         description: Mercado Pago não configurado
   */
  .post('/checkout', requireAdmin, (req, res, next) => BillingController.createCheckout(req, res, next))

  /**
   * @swagger
   * /api/v1/billing/sync:
   *   post:
   *     tags:
   *       - Assinatura
   *     summary: Reconsulta o status da assinatura no Mercado Pago (retorno do checkout)
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               preapprovalId:
   *                 type: string
   *     responses:
   *       200:
   *         description: Situação atualizada
   */
  .post('/sync', requireAdmin, (req, res, next) => BillingController.sync(req, res, next));

export default billingRouter;
