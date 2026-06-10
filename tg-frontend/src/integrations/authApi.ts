import { apiRequest } from "@/integrations/apiClient";

export async function login(email: string, password: string) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function register(email: string, password: string, companyName: string) {
  return apiRequest("/users", {
    method: "POST",
    body: {
      name: companyName,
      email,
      password,
      role: "admin",
    },
  });
}

export async function forgotPassword(email: string) {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export async function resetPassword(email: string, code: string, newPassword: string) {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: { email, code, newPassword },
  });
}
