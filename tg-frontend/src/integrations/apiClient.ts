const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

interface ApiRequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function resolveErrorMessage(data: any) {
  return (
    data?.error?.message ||
    data?.error ||
    data?.message ||
    "Erro ao comunicar com o servidor"
  );
}

export async function apiRequest(endpoint: string, options: ApiRequestOptions = {}) {
  const { method = "GET", body, token } = options;
  const resolvedToken = token || localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (resolvedToken) {
    headers.Authorization = `Bearer ${resolvedToken}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type");
  let data: any = null;

  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  }

  if (!res.ok) {
    throw new ApiError(res.status, resolveErrorMessage(data), data);
  }

  return data;
}
