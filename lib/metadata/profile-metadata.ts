import type { Metadata } from "next";
import type { CommunitySummary } from "@/lib/opportunities/communities";
import type { UserSummary } from "@/lib/opportunities/users";
import { createPageMetadata } from "./site-metadata";

interface CommunityProfileMetadataParams {
  profile: CommunitySummary | null;
  repository: string;
  path: string;
}

export function createCommunityProfileMetadata({
  profile,
  repository,
  path,
}: CommunityProfileMetadataParams): Metadata {
  const identity = profile?.name ?? repository;
  return createPageMetadata({
    title: profile
      ? `Jobs shared through ${profile.name} | ${profile.repository}`
      : `Community profile: ${identity}`,
    description: profile
      ? `Browse open jobs shared through ${profile.name}. Each listing links to its original public source.`
      : `This community profile is unavailable. Browse current jobs on openings.dev instead.`,
    path,
    socialImageAlt: `${identity} community jobs on openings.dev`,
  });

}

interface PublisherProfileMetadataParams {
  profile: UserSummary | null;
  handle: string;
  path: string;
}

export function createPublisherProfileMetadata({
  profile,
  handle,
  path,
}: PublisherProfileMetadataParams): Metadata {
  return createPageMetadata({
    title: profile
      ? `Jobs shared by ${profile.name} (@${profile.handle})`
      : `GitHub author profile: @${handle}`,
    description: profile
      ? `Browse open jobs authored by @${profile.handle} across public GitHub community repositories.`
      : `This GitHub author profile is unavailable. Browse current jobs on openings.dev instead.`,
    path,
    socialImageAlt: `${profile?.name ?? `@${handle}`}. GitHub author job profile on openings.dev`,
  });

}
