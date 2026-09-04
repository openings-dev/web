import type { MetadataRoute } from "next";
import { AVAILABLE_LOCALES } from "@/lib/constants/locales";
import {
  CURATED_DISCOVERY_PRESETS,
  matchesCuratedPreset,
} from "@/lib/discovery/curated-pages";
import { resolveCanonicalUrl } from "@/lib/metadata/site-metadata";
import { listSnapshotCommunities } from "@/lib/opportunities/communities";
import { buildCommunityPath, buildOpportunityPath, buildUserPath } from "@/lib/opportunities/routing";
import {
  getStaticOpportunityGeneratedAt,
  listStaticOpportunities,
} from "@/lib/opportunities/static-api";
import { listMonthlyReports } from "@/lib/reports/reports";

export const dynamic = "force-static";

const RELEASE_DATE = "2026-09-01";

function entry(
  path: string,
  lastModified: string,
  changeFrequency: "daily" | "weekly" | "monthly",
  priority: number,
): MetadataRoute.Sitemap[number] {
  return { url: resolveCanonicalUrl(path), lastModified, changeFrequency, priority };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [items, communities, generatedAt, reports] = await Promise.all([
    listStaticOpportunities(),
    listSnapshotCommunities(),
    getStaticOpportunityGeneratedAt(),
    listMonthlyReports(),
  ]);
  const authors = new Map<string, string>();
  for (const item of items) {
    const current = authors.get(item.author.handle);
    if (!current || Date.parse(item.updatedAt) > Date.parse(current)) {
      authors.set(item.author.handle, item.updatedAt);
    }
  }
  const staticPages = [
    entry("/", generatedAt, "daily", 1),
    entry("/opportunities", generatedAt, "daily", 0.9),
    entry("/communities", generatedAt, "daily", 0.8),
    entry("/authors", generatedAt, "daily", 0.7),
    entry("/status", generatedAt, "daily", 0.7),
    entry("/updates", RELEASE_DATE, "weekly", 0.7),
    entry("/reports", reports.generatedAt ?? RELEASE_DATE, "monthly", 0.7),
    entry("/methodology", RELEASE_DATE, "monthly", 0.6),
    entry("/privacy", RELEASE_DATE, "monthly", 0.3),
    entry("/terms", RELEASE_DATE, "monthly", 0.3),
  ];
  const communityPages = communities.map((community) =>
    entry(buildCommunityPath(community.repository), community.lastPostedAt ?? generatedAt, "daily", 0.6));
  const authorPages = [...authors].map(([handle, updatedAt]) =>
    entry(buildUserPath(handle), updatedAt, "weekly", 0.5));
  const jobPages = items.map((item) =>
    entry(buildOpportunityPath(item.id), item.updatedAt, "daily", 0.8));
  const curatedPages = AVAILABLE_LOCALES.flatMap(({ code }) =>
    CURATED_DISCOVERY_PRESETS.map((preset) => {
      const matching = items.filter((item) => matchesCuratedPreset(item, preset.slug));
      const lastModified = matching.reduce<string | null>((latest, item) =>
        !latest || Date.parse(item.updatedAt) > Date.parse(latest)
          ? item.updatedAt
          : latest, null) ?? generatedAt;
      return entry(`/${code}/discover/${preset.slug}`, lastModified, "daily", 0.7);
    }));
  const reportPages = reports.reports.map((report) =>
    entry(`/reports/${report.period}`, report.generatedAt, "monthly", 0.6));
  const all = [...staticPages, ...reportPages, ...communityPages, ...authorPages, ...jobPages, ...curatedPages];
  return [...new Map(all.map((item) => [item.url, item])).values()];
}
