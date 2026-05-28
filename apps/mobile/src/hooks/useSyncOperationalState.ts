import { useEffect, useState } from "react";

import { getSyncState, subscribeSyncState } from "@/services/offlineDocuments/syncState";

export function useSyncOperationalState() {
  const [state, setState] = useState(getSyncState());

  useEffect(() => {
    const unsubscribe = subscribeSyncState(setState);
    return () => {
      unsubscribe();
    };
  }, []);

  return state;
}
