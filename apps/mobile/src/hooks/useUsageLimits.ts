import { useEffect, useMemo, useState } from "react";
import { getAllUsage, subscribeUsage, type UsageData } from "@/services/usageTracker";

const SAVED_DOCUMENTS_LIMIT = 30;

type UsageEntry = {
  count: number;
  limit: number;
  resetAt: Date;
};

type UsageLimitsState = {
  processing: UsageEntry | null;
  chat: UsageEntry | null;
  documentsLimit: number;
  resetAt: Date | null;
};

function toUsageEntry(data: UsageData): UsageEntry {
  return {
    count: data.limit - data.remaining,
    limit: data.limit,
    resetAt: data.resetAt,
  };
}

export function useUsageLimits(): UsageLimitsState {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeUsage(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  return useMemo(() => {
    const all = getAllUsage();
    const processingRaw = all.get("processing");
    const chatRaw = all.get("chat");

    return {
      processing: processingRaw ? toUsageEntry(processingRaw) : null,
      chat: chatRaw ? toUsageEntry(chatRaw) : null,
      documentsLimit: SAVED_DOCUMENTS_LIMIT,
      resetAt: processingRaw?.resetAt ?? chatRaw?.resetAt ?? null,
    };
  }, [tick]);
}
