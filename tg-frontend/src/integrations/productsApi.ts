import { apiRequest } from "@/integrations/apiClient";

export interface ProductPayload {
  categoryId: number | null;
  name: string;
  sku: string;
  description?: string | null;
  salePrice: number;
  costPrice: number;
  currentStock: number;
  minStock: number;
  imageUrl?: string | null;
  imageUrls?: string[];
}

export interface UploadProductImagePayload {
  fileData: string;
}

export async function getProducts(token?: string) {
  return apiRequest("/products", { method: "GET", token });
}

export async function getProductById(id: string | number, token?: string) {
  return apiRequest(`/products/${id}`, { method: "GET", token });
}

export async function createProduct(product: ProductPayload, token?: string) {
  return apiRequest("/products", { method: "POST", body: product, token });
}

export async function updateProduct(id: string | number, product: ProductPayload, token?: string) {
  return apiRequest(`/products/${id}`, { method: "PUT", body: product, token });
}

export async function deleteProduct(id: string | number, token?: string) {
  return apiRequest(`/products/${id}`, { method: "DELETE", token });
}

export async function uploadProductImage(payload: UploadProductImagePayload, token?: string) {
  return apiRequest("/uploads/product-image", {
    method: "POST",
    body: payload,
    token,
  });
}
