import { apiRequest } from "@/integrations/apiClient";

export interface MovementPayload {
  productId: number;
  movementType: "entrada" | "saida";
  quantity: number;
  notes?: string | null;
}

export async function getMovements(token?: string) {
  return apiRequest("/movements", { method: "GET", token });
}

export async function getMovementById(id: string | number, token?: string) {
  return apiRequest(`/movements/${id}`, { method: "GET", token });
}

export async function createMovement(movement: MovementPayload, token?: string) {
  return apiRequest("/movements", { method: "POST", body: movement, token });
}

export async function updateMovement(id: string | number, movement: MovementPayload, token?: string) {
  return apiRequest(`/movements/${id}`, { method: "PUT", body: movement, token });
}

export async function deleteMovement(id: string | number, token?: string) {
  return apiRequest(`/movements/${id}`, { method: "DELETE", token });
}
