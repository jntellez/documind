type SyncState = {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  readyCount: number;
  failedCount: number;
  syncCycle: number;
  lastError?: string;
};

let state: SyncState = {
  isOnline: true,
  isSyncing: false,
  pendingCount: 0,
  readyCount: 0,
  failedCount: 0,
  syncCycle: 0,
};

const listeners = new Set<(next: SyncState) => void>();

export function getSyncState() {
  return state;
}

export function subscribeSyncState(listener: (next: SyncState) => void) {
  listeners.add(listener);
  listener(state);
  return () => listeners.delete(listener);
}

export function updateSyncState(partial: Partial<SyncState>) {
  state = { ...state, ...partial };
  listeners.forEach((listener) => listener(state));
}
