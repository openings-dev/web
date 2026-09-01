import type { Metadata } from "next";
import { CommunitiesScreen } from "@/app/community/_components/communities-screen";
import { PUBLIC_ROUTES } from "@/lib/navigation/routes";
import { createPageMetadata } from "@/lib/metadata/site-metadata";
import { listSnapshotCommunities } from "@/lib/opportunities/communities";
import { getCommunityStatus } from "@/lib/opportunities/status";
import { LoadResultStatus, loadWithStatus } from "@/lib/utils/load-safely";

export const metadata: Metadata = createPageMetadata({
  title: "GitHub communities sharing tech jobs",
  description:
    "Browse public GitHub communities with open tech jobs, then check any listing at its original source.",
  path: PUBLIC_ROUTES.communities,
});

export default async function CommunitiesIndexPage(): Promise<React.ReactNode> {
  const [result, statusResult] = await Promise.all([
    loadWithStatus({ load: () => listSnapshotCommunities() }),
    loadWithStatus({ load: () => getCommunityStatus() }),
  ]);

  return (
    <CommunitiesScreen
      communities={result.status === LoadResultStatus.Success ? result.data : []}
      sourceUnavailable={result.status === LoadResultStatus.Failure}
      status={statusResult.status === LoadResultStatus.Success ? statusResult.data : null}
    />
  );
}
