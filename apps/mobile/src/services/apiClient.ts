import { API_BASE_URL } from "@/lib/api";
import { tokenStorage } from "@/lib/storage";
import { showToast } from "@/components/ui/Toast";
import { updateUsage, type UsageType } from "./usageTracker";

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

function resolveUsageType(path: string): UsageType | null {
  if (path.includes("/process-url") || path.includes("/process-file")) {
    return "processing";
  }
  if (path.includes("/chat")) {
    return "chat";
  }
  return null;
}

function handleRateLimitError(error: string, type: UsageType | null) {
  if (type === "processing") {
    showToast({
      type: "error",
      text1: "Processing limit reached",
      text2: "Daily processing limit reached. Try again tomorrow.",
    });
  } else if (type === "chat") {
    showToast({
      type: "error",
      text1: "Chat limit reached",
      text2: "Daily chat limit reached. Try again tomorrow.",
    });
  }
}

async function parseApiResponse<T>(
  response: Response,
  errorMessage: string,
  usageType: UsageType | null,
): Promise<T> {
  const rawBody = await response.text();
  const data = rawBody ? (JSON.parse(rawBody) as T | ApiErrorResponse) : undefined;

  if (!response.ok) {
    const apiError =
      data && typeof data === "object" && "error" in data ? data.error : undefined;

    if (response.status === 429 && usageType) {
      handleRateLimitError(apiError || errorMessage, usageType);
    }

    throw new Error(apiError || errorMessage);
  }

  if (usageType) {
    updateUsage(response.headers, usageType);
  }

  return data as T;
}

export async function apiRequest<T>(
  path: string,
  { body, errorMessage, headers, ...init }: ApiRequestOptions,
): Promise<T> {
  const usageType = resolveUsageType(path);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: buildHeaders(headers),
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return parseApiResponse<T>(response, errorMessage, usageType);
}

export async function optionalAuthenticatedApiRequest<T>(
  path: string,
  options: ApiRequestOptions,
): Promise<T> {
  const token = await tokenStorage.get();
  const usageType = resolveUsageType(path);
  const requestHeaders = buildHeaders(options.headers);

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: requestHeaders,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  return parseApiResponse<T>(response, options.errorMessage, usageType);
}

export async function authenticatedApiRequest<T>(
  path: string,
  options: ApiRequestOptions,
): Promise<T> {
  const token = await tokenStorage.get();

  if (!token) {
    throw new Error("No authentication token found");
  }

  const usageType = resolveUsageType(path);
  const requestHeaders = buildHeaders(options.headers);
  requestHeaders.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: requestHeaders,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  return parseApiResponse<T>(response, options.errorMessage, usageType);
}
