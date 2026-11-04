import { Navigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SubscriptionProtectedRouteProps {
  children: React.ReactNode;
}

export default function SubscriptionProtectedRoute({ children }: SubscriptionProtectedRouteProps) {
  const { signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const { data: billing, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!billing || billing.hasAccess) {
    return <>{children}</>;
  }

  if (isAdmin) {
    return <Navigate to="/assinatura" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="max-w-md">
        <CardHeader>
          <Lock className="h-8 w-8 text-muted-foreground" />
          <CardTitle>Acesso suspenso</CardTitle>
          <CardDescription>
            O período de teste da sua empresa terminou e a assinatura ainda não foi ativada.
            Fale com o administrador da conta para regularizar o acesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" onClick={signOut}>
            Sair
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
