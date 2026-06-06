import { getReleaseMetadata } from "@/lib/releases/release-service";

export async function getDownloadRelease() {
  return getReleaseMetadata();
}
