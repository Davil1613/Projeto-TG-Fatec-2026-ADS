import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Tenant {
  id: string;
  name: string;
  plan: "free" | "premium";
  status: "active" | "inactive" | "trial";
  trial_ends_at: string | null;
  subscribed_at: string | null;
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

  const isTrialActive = () => {
    if (!tenant || tenant.status !== "trial" || !tenant.trial_ends_at) {
      return false;
    }
    return new Date(tenant.trial_ends_at) > new Date();
  };

  const isPremium = () => {
    return tenant?.plan === "premium" && tenant?.status === "active";
  };

  const daysLeftInTrial = () => {
    if (!tenant || !tenant.trial_ends_at) return 0;
    const now = new Date();
    const end = new Date(tenant.trial_ends_at);
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return {
    tenant,
    tenantId,
    loading,
    isTrialActive: isTrialActive(),
    isPremium: isPremium(),
    daysLeftInTrial: daysLeftInTrial(),
    refetch: loadTenant,
  };
}
