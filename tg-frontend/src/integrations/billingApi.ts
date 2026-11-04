import { apiRequest } from "@/integrations/apiClient";

export type SubscriptionStatus = "trial" | "pending" | "active" | "past_due" | "canceled";

export interface BillingStatus {
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: string | null;
  trialDaysLeft: number | null;
  hasAccess: boolean;
  price: number;
  paymentConfigured: boolean;
}

export async function getBillingStatus(): Promise<BillingStatus> {
  return apiRequest("/billing/status");
}

export async function createCheckout(): Promise<{ checkoutUrl: string; preapprovalId: string }> {
  return apiRequest("/billing/checkout", { method: "POST" });
}

export async function syncSubscription(preapprovalId?: string | null): Promise<BillingStatus> {
  return apiRequest("/billing/sync", {
    method: "POST",
    body: preapprovalId ? { preapprovalId } : {},
  });
}
