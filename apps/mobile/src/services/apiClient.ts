import { API_BASE_URL } from "@/lib/api";
import { tokenStorage } from "@/lib/storage";

type ApiRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  errorMessage: string;
  headers?: HeadersInit;
};

type ApiErrorResponse = {
  error?: string;
};

function buildHeaders(headers?: HeadersInit): Headers {
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  return requestHeaders;
}

async function parseApiResponse<T>(
  response: Response,
  errorMessage: string,
): Promise<T> {
  const rawBody = await response.text();
  const data = rawBody ? (JSON.parse(rawBody) as T | ApiErrorResponse) : undefined;

  if (!response.ok) {
    const apiError =
      data && typeof data === "object" && "error" in data ? data.error : undefined;

    throw new Error(apiError || errorMessage);
  }

  return data as T;
}

export async function apiRequest<T>(
  path: string,
  { body, errorMessage, headers, ...init }: ApiRequestOptions,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: buildHeaders(headers),
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return parseApiResponse<T>(response, errorMessage);
}

export async function authenticatedApiRequest<T>(
  path: string,
  options: ApiRequestOptions,
): Promise<T> {
  const token = await tokenStorage.get();

  if (!token) {
    throw new Error("No authentication token found");
  }

  const headers = buildHeaders(options.headers);
  headers.set("Authorization", `Bearer ${token}`);

  return apiRequest<T>(path, {
    ...options,
    headers,
  });
}
