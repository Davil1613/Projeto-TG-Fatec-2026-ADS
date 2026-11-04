import { NextFunction, Request, Response } from 'express';
import billingService from '../services/billingService';

export async function requireActiveSubscription(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = await billingService.getTenant(req.user!.tenantId);

    if (!billingService.hasAccess(tenant)) {
      return res.status(402).json({
        error: 'O período de teste terminou. Assine o StockPro para continuar usando o sistema.',
        code: 'SUBSCRIPTION_REQUIRED',
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
}
