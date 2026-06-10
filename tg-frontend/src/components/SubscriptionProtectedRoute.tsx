import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface SubscriptionProtectedRouteProps {
  children: React.ReactNode;
}

export default function SubscriptionProtectedRoute({ children }: SubscriptionProtectedRouteProps) {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (user) {
    return <>{children}</>;
  }

  return null;
}
