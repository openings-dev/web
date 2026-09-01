import type { StaticCommunityStatus } from "./api-types";
import {
  loadCommunityStatusHistory,
  loadCommunityStatus,
  loadOpportunityManifest,
  withStaticArtifactRecovery,
} from "./static-artifacts";

export interface CommunityStatusBundle {
  status: StaticCommunityStatus;
  history: Awaited<ReturnType<typeof loadCommunityStatusHistory>>;
}

export async function getCommunityStatus(): Promise<StaticCommunityStatus> {
  return withStaticArtifactRecovery(async () => {
    const manifest = await loadOpportunityManifest();
    return loadCommunityStatus(manifest);
  });
}

export async function getCommunityStatusBundle(): Promise<CommunityStatusBundle> {
  return withStaticArtifactRecovery(async () => {
    const manifest = await loadOpportunityManifest();
    const status = await loadCommunityStatus(manifest);
    const history = await loadCommunityStatusHistory(manifest);
    return { status, history };
  });
}
