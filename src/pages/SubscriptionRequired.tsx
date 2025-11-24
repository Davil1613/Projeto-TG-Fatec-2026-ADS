import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function SubscriptionRequired() {
  const navigate = useNavigate();
  const { isSubscriptionActive, isInTrial, trialEndDate, loading } = useSubscription();
  const checkoutUrl = "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=3e61f1af5985402f89e1ddb1a13c5da9";

  useEffect(() => {
    // Se a assinatura estiver ativa, redirecionar para dashboard
    if (!loading && (isSubscriptionActive || isInTrial)) {
      navigate("/");
    }
  }, [isSubscriptionActive, isInTrial, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verificando assinatura...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {isInTrial ? (
            <>
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Você está no período de teste</CardTitle>
              <CardDescription>
                Seu período de teste expira em{" "}
                {trialEndDate && format(trialEndDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Sua assinatura não está ativa</CardTitle>
              <CardDescription>
                Para acessar o sistema, você precisa de uma assinatura ativa
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-sm text-muted-foreground">Plano Mensal</span>
              <div>
                <span className="text-3xl font-bold">R$ 50</span>
                <span className="text-muted-foreground">/mês</span>
              </div>
            </div>
            <ul className="space-y-2 mt-4">
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                Acesso completo ao sistema
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                Gestão de produtos e estoque
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                Relatórios detalhados
              </li>
              <li className="flex items-center text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                Suporte prioritário
              </li>
            </ul>
          </div>

          <Button 
            className="w-full" 
            size="lg"
            onClick={() => window.open(checkoutUrl, "_blank")}
          >
            Assinar agora R$ 50/mês
          </Button>

          {isInTrial && (
            <p className="text-xs text-center text-muted-foreground">
              Você pode continuar usando o sistema gratuitamente até o fim do período de teste
            </p>
          )}

          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/auth")}
            >
              Voltar para login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
