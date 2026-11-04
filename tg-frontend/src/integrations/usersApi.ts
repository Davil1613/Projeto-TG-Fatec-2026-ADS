import { apiRequest } from "@/integrations/apiClient";

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt: string;
}

export interface TeamMemberPayload {
  name: string;
  email: string;
  password: string;
}

export async function getTeam(): Promise<TeamMember[]> {
  return apiRequest("/users");
}

export async function createTeamMember(member: TeamMemberPayload): Promise<TeamMember> {
  return apiRequest("/users/members", { method: "POST", body: member });
}

export async function deleteTeamMember(id: number) {
  return apiRequest(`/users/${id}`, { method: "DELETE" });
}
