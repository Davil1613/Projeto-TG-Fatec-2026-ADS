import { useQuery } from "@tanstack/react-query";
import { getBillingStatus } from "@/integrations/billingApi";
import { useAuth } from "@/contexts/AuthContext";

export function useSubscription() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["billing-status", user?.tenantId],
    queryFn: getBillingStatus,
    enabled: !!user,
    staleTime: 60_000,
  });
}
