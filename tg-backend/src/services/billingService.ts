import TenantModel, { SubscriptionStatus } from '../models/Tenant';
import BaseError from '../errors/BaseError';
import NotFoundError from '../errors/NotFoundError';

const MP_API_URL = 'https://api.mercadopago.com';
const DAY_MS = 1000 * 60 * 60 * 24;

export const TRIAL_DAYS = 7;

const MP_STATUS_MAP: Record<string, SubscriptionStatus> = {
  pending: 'pending',
  authorized: 'active',
  paused: 'past_due',
  cancelled: 'canceled',
};

function subscriptionPrice() {
  return Number(process.env.SUBSCRIPTION_PRICE || 50);
}

function accessToken() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    throw new BaseError('Pagamento não configurado: defina MP_ACCESS_TOKEN no .env do backend.', 503);
  }
  return token;
}

async function mercadoPagoRequest(path: string, init: { method?: string; body?: unknown } = {}) {
  const response = await fetch(`${MP_API_URL}${path}`, {
    method: init.method || 'GET',
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      'Content-Type': 'application/json',
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });

  const data: any = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.message || data?.error || response.statusText;
    throw new BaseError(`Mercado Pago recusou a solicitação: ${detail}`, 502);
  }
  return data;
}

class BillingService {
  trialEndDate(from = new Date()) {
    return new Date(from.getTime() + TRIAL_DAYS * DAY_MS);
  }

  hasAccess(tenant: TenantModel) {
    if (tenant.status !== 'active') return false;
    if (tenant.subscriptionStatus === 'active') return true;

    const inTrial = tenant.subscriptionStatus === 'trial' || tenant.subscriptionStatus === 'pending';
    return inTrial && !!tenant.trialEndsAt && tenant.trialEndsAt.getTime() > Date.now();
  }

  async getTenant(tenantId: number) {
    const tenant = await TenantModel.findByPk(tenantId);
    if (!tenant) throw new NotFoundError('Empresa não encontrada.');
    return tenant;
  }

  async getStatus(tenantId: number) {
    const tenant = await this.getTenant(tenantId);
    const trialEndsAt = tenant.trialEndsAt;
    const daysLeft = trialEndsAt
      ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / DAY_MS))
      : 0;

    return {
      subscriptionStatus: tenant.subscriptionStatus,
      trialEndsAt,
      trialDaysLeft: tenant.subscriptionStatus === 'active' ? null : daysLeft,
      hasAccess: this.hasAccess(tenant),
      price: subscriptionPrice(),
      paymentConfigured: !!process.env.MP_ACCESS_TOKEN,
    };
  }

  async createCheckout(tenantId: number, payerEmail: string) {
    const tenant = await this.getTenant(tenantId);
    if (tenant.subscriptionStatus === 'active') {
      throw new BaseError('A assinatura desta empresa já está ativa.', 409);
    }

    const backUrl = process.env.MP_BACK_URL || 'http://localhost:8080/assinatura';
    const preapproval = await mercadoPagoRequest('/preapproval', {
      method: 'POST',
      body: {
        reason: 'StockPro - Assinatura mensal',
        external_reference: `tenant-${tenant.id}`,
        payer_email: process.env.MP_TEST_PAYER_EMAIL || payerEmail,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: subscriptionPrice(),
          currency_id: 'BRL',
        },
        back_url: backUrl,
        status: 'pending',
      },
    });

    await tenant.update({ mpPreapprovalId: preapproval.id, subscriptionStatus: 'pending' });
    return { checkoutUrl: preapproval.init_point as string, preapprovalId: preapproval.id as string };
  }

  async syncFromPreapproval(preapprovalId: string, expectedTenantId?: number) {
    const preapproval = await mercadoPagoRequest(`/preapproval/${encodeURIComponent(preapprovalId)}`);
    const reference = String(preapproval.external_reference || '');
    const tenantId = Number(reference.replace('tenant-', ''));

    if (!reference.startsWith('tenant-') || !tenantId) {
      throw new BaseError('Assinatura sem referência de empresa do StockPro.', 400);
    }
    if (expectedTenantId && tenantId !== expectedTenantId) {
      throw new BaseError('Esta assinatura pertence a outra empresa.', 403);
    }

    const tenant = await this.getTenant(tenantId);
    const mapped = MP_STATUS_MAP[preapproval.status];
    if (mapped) {
      await tenant.update({ subscriptionStatus: mapped, mpPreapprovalId: preapproval.id });
    }
    return this.getStatus(tenantId);
  }

  async syncTenant(tenantId: number) {
    const tenant = await this.getTenant(tenantId);
    if (!tenant.mpPreapprovalId) return this.getStatus(tenantId);
    return this.syncFromPreapproval(tenant.mpPreapprovalId, tenantId);
  }
}

export default new BillingService();
