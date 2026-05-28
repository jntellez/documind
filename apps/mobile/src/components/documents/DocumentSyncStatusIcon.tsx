import Icon from "@/components/ui/Icon";

type SyncStatus = "synced" | "pending" | "error" | "conflict";

type DocumentSyncStatusIconProps = {
  syncStatus?: SyncStatus;
};

export default function DocumentSyncStatusIcon({
  syncStatus,
}: DocumentSyncStatusIconProps) {
  if (!syncStatus || syncStatus === "synced") {
    return null;
  }

  if (syncStatus === "pending") {
    return <Icon library="ionicons" name="sync-outline" size="sm" tone="mutedForeground" />;
  }

  if (syncStatus === "conflict") {
    return <Icon library="ionicons" name="git-compare-outline" size="sm" tone="warning" />;
  }

  return <Icon library="ionicons" name="alert-circle-outline" size="sm" tone="destructive" />;
}
