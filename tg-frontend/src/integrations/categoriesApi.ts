import { apiRequest } from "@/integrations/apiClient";

export interface CategoryPayload {
  name: string;
  description?: string | null;
}

export async function getCategories(token?: string) {
  return apiRequest("/categories", { method: "GET", token });
}

export async function createCategory(category: CategoryPayload, token?: string) {
  return apiRequest("/categories", { method: "POST", body: category, token });
}

export async function updateCategory(id: string | number, category: CategoryPayload, token?: string) {
  return apiRequest(`/categories/${id}`, { method: "PUT", body: category, token });
}

export async function deleteCategory(id: string | number, token?: string) {
  return apiRequest(`/categories/${id}`, { method: "DELETE", token });
}
