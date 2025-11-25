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
    // Se a assinatura estiver ativa ou em trial, redirecionar para dashboard
    if (!loading && (isSubscriptionActive || isInTrial)) {
      navigate("/dashboard");
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
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Período de Teste Ativo - 7 Dias Grátis</CardTitle>
              <CardDescription>
                Seu teste grátis expira em{" "}
                {trialEndDate && format(trialEndDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Período de teste expirado</CardTitle>
              <CardDescription>
                Para continuar acessando o sistema, assine por apenas R$50/mês
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
            {!isInTrial && (
              <p className="text-xs text-primary font-semibold mb-2">7 dias de teste GRÁTIS</p>
            )}
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
                Dashboard completo
              </li>
            </ul>
          </div>

          <Button 
            className="w-full" 
            size="lg"
            onClick={() => window.open(checkoutUrl, "_blank")}
          >
            {isInTrial ? "Assinar agora - R$ 50/mês" : "Assinar agora"}
          </Button>

          {isInTrial && (
            <p className="text-xs text-center text-muted-foreground">
              Aproveite os 7 dias restantes e assine para continuar usando todas as funcionalidades após o teste
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
