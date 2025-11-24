import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useUserRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setLoading(false);
      return;
    }

    loadRole();
  }, [user]);

  const loadRole = async () => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .single();

      if (error) throw error;
      setRole(data?.role || null);
    } catch (error) {
      console.error("Error loading user role:", error);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = () => role === "admin";

  return {
    role,
    loading,
    isAdmin: isAdmin(),
  };
}
