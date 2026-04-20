import { useDocumentCollection } from "./useDocumentCollection";
import { useNetworkStatus } from "../useNetworkStatus";

export function useDocumentCount() {
  const { isOnline } = useNetworkStatus();
  const { documents } = useDocumentCollection({ isOnline });

  return {
    documentsCount: documents.length,
  };
}
