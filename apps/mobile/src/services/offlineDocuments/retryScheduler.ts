let retryTimer: ReturnType<typeof setTimeout> | null = null;
let scheduledAt: number | null = null;
let onRetryDue: (() => void) | null = null;

function clearRetryTimer() {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }

  scheduledAt = null;
}

export function initializeRetryScheduler(callback: () => void) {
  onRetryDue = callback;
}

export function scheduleRetryAt(nextRetryAt: string | null | undefined) {
  if (!nextRetryAt || !onRetryDue) {
    clearRetryTimer();
    return;
  }

  const targetTime = new Date(nextRetryAt).getTime();

  if (Number.isNaN(targetTime)) {
    clearRetryTimer();
    return;
  }

  if (scheduledAt !== null && scheduledAt <= targetTime) {
    return;
  }

  clearRetryTimer();

  const delay = Math.max(0, targetTime - Date.now());
  scheduledAt = targetTime;
  retryTimer = setTimeout(() => {
    clearRetryTimer();
    onRetryDue?.();
  }, delay);
}

export function scheduleRetrySoon(delayMs = 5_000) {
  scheduleRetryAt(new Date(Date.now() + delayMs).toISOString());
}

export function resetRetryScheduler() {
  clearRetryTimer();
  onRetryDue = null;
}
