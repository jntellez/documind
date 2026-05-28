type GetDocumentsOfflineOptions = {
  attemptSyncForLocalCreates?: boolean;
};

export function shouldAttemptPreFetchSync(
  hasLocalCreates: boolean,
  options?: GetDocumentsOfflineOptions,
) {
  return hasLocalCreates && (options?.attemptSyncForLocalCreates ?? true);
}

export type { GetDocumentsOfflineOptions };
