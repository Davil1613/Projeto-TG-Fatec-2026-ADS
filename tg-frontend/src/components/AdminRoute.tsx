import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useUserRole();

  if (loading) return null;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
