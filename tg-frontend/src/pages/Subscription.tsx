import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle, CheckCircle2, CreditCard, Loader2, RefreshCw } from "lucide-react";
import Layout from "@/components/Layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/hooks/useSubscription";
import { createCheckout, syncSubscription, type SubscriptionStatus } from "@/integrations/billingApi";

const statusInfo: Record<SubscriptionStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  trial: { label: "Teste grátis", variant: "secondary" },
  pending: { label: "Pagamento pendente", variant: "outline" },
  active: { label: "Assinatura ativa", variant: "default" },
  past_due: { label: "Pagamento em atraso", variant: "destructive" },
  canceled: { label: "Cancelada", variant: "destructive" },
};

const benefits = [
  "Produtos, categorias e movimentações ilimitados",
  "Usuários da equipe com acesso limitado",
  "Dashboard, relatórios e alertas de estoque baixo",
  "Histórico completo e auditoria das operações",
];

export default function Subscription() {
  const { data: billing, isLoading } = useSubscription();
  const [searchParams, setSearchParams] = useSearchParams();
  const [redirecting, setRedirecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const refreshStatus = async (preapprovalId?: string | null) => {
    setSyncing(true);
    try {
      const status = await syncSubscription(preapprovalId);
      await queryClient.invalidateQueries({ queryKey: ["billing-status"] });
      if (status.subscriptionStatus === "active") {
        toast({ title: "Assinatura ativa", description: "Pagamento confirmado pelo Mercado Pago." });
      }
    } catch (error: any) {
      toast({ title: "Não foi possível consultar a assinatura", description: error.message, variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const preapprovalId = searchParams.get("preapproval_id");
    if (preapprovalId) {
      refreshStatus(preapprovalId).then(() => setSearchParams({}, { replace: true }));
    }
  }, []);

  const handleSubscribe = async () => {
    setRedirecting(true);
    try {
      const { checkoutUrl } = await createCheckout();
      window.location.href = checkoutUrl;
    } catch (error: any) {
      setRedirecting(false);
      toast({ title: "Erro ao iniciar assinatura", description: error.message, variant: "destructive" });
    }
  };

  const status = billing ? statusInfo[billing.subscriptionStatus] : null;
  const trialEnd = billing?.trialEndsAt
    ? format(new Date(billing.trialEndsAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : null;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Assinatura</h1>
          <p className="text-muted-foreground mt-2">Plano da sua empresa e pagamento pelo Mercado Pago</p>
        </div>

        {billing && !billing.hasAccess && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Acesso bloqueado</AlertTitle>
            <AlertDescription>
              O período de teste terminou. Assine para voltar a usar o sistema; seus dados continuam salvos.
            </AlertDescription>
          </Alert>
        )}

        {billing && !billing.paymentConfigured && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Pagamento não configurado</AlertTitle>
            <AlertDescription>
              Defina MP_ACCESS_TOKEN (credencial de teste do Mercado Pago) no .env do backend para habilitar o checkout.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Situação atual</CardTitle>
              <CardDescription>Atualizada a partir do Mercado Pago</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading || !billing || !status ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <Badge variant={status.variant} className="text-sm">{status.label}</Badge>
                  {billing.subscriptionStatus !== "active" && trialEnd && (
                    <p className="text-sm text-muted-foreground">
                      Teste grátis até <strong className="text-foreground">{trialEnd}</strong>
                      {billing.trialDaysLeft !== null && ` (${billing.trialDaysLeft} dia(s) restante(s))`}.
                    </p>
                  )}
                  {billing.subscriptionStatus === "active" && (
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      Cobrança mensal recorrente ativa no Mercado Pago.
                    </p>
                  )}
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => refreshStatus()} disabled={syncing}>
                <RefreshCw className={syncing ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
                Verificar pagamento
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-primary/40">
            <CardHeader>
              <CardTitle>StockPro Profissional</CardTitle>
              <CardDescription>Cobrança mensal, cancele quando quiser</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-4xl font-bold text-foreground">
                {(billing?.price ?? 50).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                <span className="text-base font-normal text-muted-foreground">/mês</span>
              </p>
              <ul className="space-y-2">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={handleSubscribe}
                disabled={redirecting || billing?.subscriptionStatus === "active"}
              >
                {redirecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CreditCard className="mr-2 h-4 w-4" />}
                {billing?.subscriptionStatus === "active" ? "Plano ativo" : "Assinar com Mercado Pago"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
