import { apiRequest } from "@/integrations/apiClient";

export async function getAuditLogs(token?: string) {
  return apiRequest("/audit-logs", { method: "GET", token });
}
