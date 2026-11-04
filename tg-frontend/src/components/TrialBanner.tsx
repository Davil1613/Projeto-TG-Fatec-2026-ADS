import { Link } from "react-router-dom";
import { Clock, Loader2 } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";

export default function TrialBanner() {
  const { isAdmin } = useUserRole();
  const { data: billing } = useSubscription();

  if (!isAdmin || !billing || billing.subscriptionStatus === "active") return null;

  const pending = billing.subscriptionStatus === "pending";
  const days = billing.trialDaysLeft ?? 0;
  const price = billing.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const message = !billing.hasAccess
    ? `Seu teste grátis terminou. Assine por ${price}/mês para liberar o acesso.`
    : pending
      ? "Assinatura iniciada no Mercado Pago. Assim que o pagamento for confirmado, o plano é ativado."
      : `Teste grátis: ${days === 1 ? "resta 1 dia" : `restam ${days} dias`}. Assine por ${price}/mês para não perder o acesso.`;

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {pending ? <Loader2 className="h-5 w-5 text-primary" /> : <Clock className="h-5 w-5 text-primary" />}
        <p className="text-sm text-foreground">{message}</p>
      </div>
      <Button asChild size="sm">
        <Link to="/assinatura">{pending ? "Ver assinatura" : "Assinar agora"}</Link>
      </Button>
    </div>
  );
}
