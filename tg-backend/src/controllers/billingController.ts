import { NextFunction, Request, Response } from 'express';
import billingService from '../services/billingService';
import auditLogService from '../services/auditLogService';

class BillingController {
  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      return res.json(await billingService.getStatus(req.user!.tenantId));
    } catch (err) {
      return next(err);
    }
  }

  async createCheckout(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const checkout = await billingService.createCheckout(tenantId, req.user!.email);
      await auditLogService.create({
        tenantId,
        userId: req.user!.id,
        action: 'create',
        entity: 'subscription',
        entityId: null,
        description: 'Checkout de assinatura iniciado no Mercado Pago',
      });
      return res.status(201).json(checkout);
    } catch (err) {
      return next(err);
    }
  }

  async sync(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const preapprovalId = req.body?.preapprovalId as string | undefined;
      const status = preapprovalId
        ? await billingService.syncFromPreapproval(preapprovalId, tenantId)
        : await billingService.syncTenant(tenantId);
      return res.json(status);
    } catch (err) {
      return next(err);
    }
  }

  async webhook(req: Request, res: Response) {
    const type = req.body?.type || req.query.type || req.query.topic;
    const resourceId = req.body?.data?.id || req.query['data.id'] || req.query.id;

    res.status(200).send();

    if (type !== 'subscription_preapproval' || !resourceId) return;

    try {
      await billingService.syncFromPreapproval(String(resourceId));
    } catch (error) {
      console.error('Falha ao processar webhook do Mercado Pago:', error);
    }
  }
}

export default new BillingController();
