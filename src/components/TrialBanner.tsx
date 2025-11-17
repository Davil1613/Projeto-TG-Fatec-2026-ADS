import { useTenant } from "@/hooks/useTenant";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, Crown } from "lucide-react";

export default function TrialBanner() {
  const { tenant, isTrialActive, daysLeftInTrial, isPremium } = useTenant();

  if (!tenant || isPremium) return null;

  if (isTrialActive) {
    return (
      <Alert className="border-warning bg-warning/10">
        <Clock className="h-4 w-4 text-warning" />
        <AlertTitle>Trial Gratuito</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>
            Você tem <strong>{daysLeftInTrial} dias</strong> restantes no seu período de teste.
          </span>
          <Button size="sm" className="ml-4">
            <Crown className="mr-2 h-4 w-4" />
            Assinar Premium
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // Trial expired or free plan
  return (
    <Alert variant="destructive">
      <Crown className="h-4 w-4" />
      <AlertTitle>Plano Gratuito</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          Faça upgrade para o plano Premium e desbloqueie todos os recursos.
        </span>
        <Button size="sm" variant="default" className="ml-4">
          <Crown className="mr-2 h-4 w-4" />
          Fazer Upgrade
        </Button>
      </AlertDescription>
    </Alert>
  );
}
