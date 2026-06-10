import { useAuth } from "@/contexts/AuthContext";

export function useUserRole() {
  const { user, loading } = useAuth();
  const role = (user as any)?.role || null;

  return {
    role,
    loading,
    isAdmin: role === "admin",
  };
}
