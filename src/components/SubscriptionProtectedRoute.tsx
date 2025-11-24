import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";

interface SubscriptionProtectedRouteProps {
  children: React.ReactNode;
}

export default function SubscriptionProtectedRoute({ children }: SubscriptionProtectedRouteProps) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isSubscriptionActive, isInTrial, loading: subscriptionLoading } = useSubscription();

  useEffect(() => {
    // Wait for both auth and subscription to load
    if (authLoading || subscriptionLoading) return;

    // If not authenticated, redirect to auth
    if (!user) {
      navigate("/auth");
      return;
    }

    // If authenticated but no active subscription or trial, redirect to subscription page
    if (!isSubscriptionActive && !isInTrial) {
      navigate("/assinatura-necessaria");
    }
  }, [user, isSubscriptionActive, isInTrial, authLoading, subscriptionLoading, navigate]);

  // Show loading while checking
  if (authLoading || subscriptionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // If authenticated and has active subscription or trial, render children
  if (user && (isSubscriptionActive || isInTrial)) {
    return <>{children}</>;
  }

  // Otherwise don't render anything (will redirect)
  return null;
}
