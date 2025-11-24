import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Tenant {
  id: string;
  name: string;
  plan: "free" | "premium";
  status: "active" | "inactive";
  subscribed_at: string | null;
  plan_status: "inactive" | "active";
  subscription_id: string | null;
  plan_expires_at: string | null;
  trial_until: string | null;
}

export function useTenant() {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTenant(null);
      setTenantId(null);
      setLoading(false);
      return;
    }

    loadTenant();
  }, [user]);

  const loadTenant = async () => {
    try {
      // Get user's role to find tenant_id
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("tenant_id")
        .eq("user_id", user!.id)
        .single();

      if (roleError) throw roleError;

      if (roleData?.tenant_id) {
        setTenantId(roleData.tenant_id);

        // Get tenant details
        const { data: tenantData, error: tenantError } = await supabase
          .from("tenants")
          .select("*")
          .eq("id", roleData.tenant_id)
          .single();

        if (tenantData) {
          setTenant(tenantData as Tenant);
        }
      }
    } catch (error) {
      console.error("Error loading tenant:", error);
    } finally {
      setLoading(false);
    }
  };

  const isPremium = () => {
    return tenant?.plan === "premium" && tenant?.status === "active";
  };

  return {
    tenant,
    tenantId,
    loading,
    isPremium: isPremium(),
    refetch: loadTenant,
  };
}
