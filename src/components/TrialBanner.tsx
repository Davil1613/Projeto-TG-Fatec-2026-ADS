import { AlertCircle, Clock } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TrialBanner() {
  const { isInTrial, trialEndDate, isSubscriptionActive, tenant } = useSubscription();

  // Calculate days remaining for trial
  const getTrialDaysRemaining = () => {
    if (!trialEndDate) return 0;
    const now = new Date();
    const diff = trialEndDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  // Calculate days until subscription renewal
  const getRenewalDaysRemaining = () => {
    if (!tenant?.plan_expires_at) return null;
    const expiresAt = new Date(tenant.plan_expires_at);
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : null;
  };

  const trialDays = isInTrial ? getTrialDaysRemaining() : 0;
  const renewalDays = isSubscriptionActive ? getRenewalDaysRemaining() : null;

  // Show trial banner if in trial
  if (isInTrial && trialDays > 0) {
    return (
      <Alert className="mb-6 border-warning bg-warning/10">
        <Clock className="h-4 w-4 text-warning" />
        <AlertDescription className="text-foreground">
          <strong>Teste grátis:</strong> Você tem {trialDays} {trialDays === 1 ? 'dia' : 'dias'} restantes do seu período de avaliação gratuita.
        </AlertDescription>
      </Alert>
    );
  }

  // Show renewal warning if subscription is active and expiring in 5 days or less
  if (renewalDays !== null && renewalDays <= 5 && renewalDays > 0) {
    return (
      <Alert className="mb-6 border-primary bg-primary/10">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertDescription className="text-foreground">
          Sua assinatura será renovada em {renewalDays} {renewalDays === 1 ? 'dia' : 'dias'}.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
