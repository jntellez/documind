import { Platform } from "react-native";

const DEFAULT_API_PORT = process.env.EXPO_PUBLIC_API_PORT?.trim() || "3000";
const EXPLICIT_API_URL = process.env.EXPO_PUBLIC_API_URL?.trim();

function normalizeApiBaseUrl(url: string) {
  return url.replace(/\/+$/, "");
}

export function getApiBaseUrl() {
  if (EXPLICIT_API_URL) {
    return normalizeApiBaseUrl(EXPLICIT_API_URL);
  }

  if (!__DEV__) {
    console.warn("EXPO_PUBLIC_API_URL is required outside development.");
    return "";
  }

  const fallbackHost = Platform.OS === "android" ? "10.0.2.2" : "localhost";

  console.warn(
    "EXPO_PUBLIC_API_URL is not set. Falling back to local development host.",
  );

  return normalizeApiBaseUrl(`http://${fallbackHost}:${DEFAULT_API_PORT}`);
}

export const API_BASE_URL = getApiBaseUrl();
