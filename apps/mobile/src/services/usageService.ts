import { API_BASE_URL } from "@/lib/api";
import { tokenStorage } from "@/lib/storage";
import { hydrateUsage } from "@/services/usageTracker";

type UsageSummaryEntry = {
  count: number;
  limit: number;
  resetInSeconds: number;
};

type UsageSummaryResponse = {
  processing: UsageSummaryEntry;
  chat: UsageSummaryEntry | null;
};

function toResetAt(resetInSeconds: number) {
  return new Date(Date.now() + Math.max(0, resetInSeconds) * 1000);
}

export async function syncUsageSummary() {
  const token = await tokenStorage.get();
  const headers = new Headers();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}/api/usage-summary`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    return;
  }

  const data = await response.json() as UsageSummaryResponse;

  hydrateUsage("processing", {
    count: data.processing.count,
    limit: data.processing.limit,
    resetAt: toResetAt(data.processing.resetInSeconds),
  });

  if (data.chat) {
    hydrateUsage("chat", {
      count: data.chat.count,
      limit: data.chat.limit,
      resetAt: toResetAt(data.chat.resetInSeconds),
    });
  }
}
