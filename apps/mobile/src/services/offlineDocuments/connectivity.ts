import NetInfo from "@react-native-community/netinfo";

let isOnline = true;
let hasInitializedReconnectListener = false;

export function initializeOfflineDocumentConnectivity(
  onReconnect: () => Promise<void> | void,
) {
  if (hasInitializedReconnectListener) {
    return;
  }

  hasInitializedReconnectListener = true;

  NetInfo.addEventListener((state) => {
    const wasOffline = !isOnline;
    isOnline = state.isConnected ?? false;

    if (wasOffline && isOnline) {
      void onReconnect();
    }
  });
}

export async function checkConnectivity(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected ?? false;
}
