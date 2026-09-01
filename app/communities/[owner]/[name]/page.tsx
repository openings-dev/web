import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OpportunitiesPage } from "@/app/opportunities/_components/opportunities-page";
import { ShareableProfileKind } from "@/app/opportunities/_components/opportunities-screen/types";
import { createCommunityProfileMetadata } from "@/lib/metadata/profile-metadata";
import {
  getSnapshotCommunityByRepository,
  listSnapshotCommunities,
} from "@/lib/opportunities/communities";
import {
  buildCommunityPath,
  communityRouteSegmentsFromRepository,
  repositoryFromCommunitySegments,
} from "@/lib/opportunities/routing";
import { loadSafely } from "@/lib/utils/load-safely";
import { getCommunityStatus } from "@/lib/opportunities/status";
import { CommunityTelemetry } from "./_components/community-telemetry";

interface CommunityRepositoryPageProps {
  params: Promise<{
    owner: string;
    name: string;
  }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const communities = await listSnapshotCommunities();
  const params: Array<{ owner: string; name: string }> = [];

  for (const community of communities) {
    const segments = communityRouteSegmentsFromRepository(community.repository);

    if (segments) {
      params.push({ owner: segments.owner, name: segments.name });
    }
  }

  return params;
}

async function resolveCommunityProfile(
  params: CommunityRepositoryPageProps["params"],
) {
  const { owner, name } = await params;
  const repository = repositoryFromCommunitySegments([owner, name]);
  const profile = await loadSafely({
    load: () => getSnapshotCommunityByRepository(repository),
    defaultValue: null,
  });

  return { profile, repository };
}

export async function generateMetadata({
  params,
}: CommunityRepositoryPageProps): Promise<Metadata> {
  const { profile, repository } = await resolveCommunityProfile(params);

  return createCommunityProfileMetadata({
    profile,
    repository,
    path: buildCommunityPath(profile?.repository ?? repository),
  });
}

export default async function CommunityRepositoryPage({
  params,
}: CommunityRepositoryPageProps): Promise<React.ReactNode> {
  const { profile, repository } = await resolveCommunityProfile(params);

  if (!profile) {
    notFound();
  }

  const status = await getCommunityStatus().catch(() => null);
  const state = status?.items.find((item) => item.repository === repository)?.state;
  const activity = state === "error" ? "error" as const
    : profile.opportunitiesCount > 0 ? "active" as const : "no-openings" as const;
  return (
    <>
      <CommunityTelemetry repository={repository} activity={activity} />
      <OpportunitiesPage
        profile={{ kind: ShareableProfileKind.Community, profile }}
      />
    </>
  );
}
