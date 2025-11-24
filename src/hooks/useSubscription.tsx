import { useTenant } from "./useTenant";

export function useSubscription() {
  const { tenant, loading } = useTenant();

  const isSubscriptionActive = () => {
    if (!tenant) return false;

    // Check if plan_status is active
    if (tenant.plan_status !== "active") {
      return false;
    }

    // Check if subscription hasn't expired
    if (tenant.plan_expires_at) {
      const expiresAt = new Date(tenant.plan_expires_at);
      const now = new Date();
      if (expiresAt < now) {
        return false;
      }
    }

    return true;
  };

  const isInTrial = () => {
    if (!tenant || !tenant.trial_until) return false;
    
    const trialUntil = new Date(tenant.trial_until);
    const now = new Date();
    return trialUntil > now;
  };

  const getTrialEndDate = () => {
    if (!tenant?.trial_until) return null;
    return new Date(tenant.trial_until);
  };

  const needsSubscription = () => {
    return !isSubscriptionActive() && !isInTrial();
  };

  return {
    isSubscriptionActive: isSubscriptionActive(),
    isInTrial: isInTrial(),
    trialEndDate: getTrialEndDate(),
    needsSubscription: needsSubscription(),
    loading,
    tenant,
  };
}
