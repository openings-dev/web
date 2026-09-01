import {
  CURATED_DISCOVERY_SLUGS,
  matchesCuratedPreset,
  type CuratedDiscoverySlug,
} from "@/lib/discovery/curated-pages";
import { resolveCanonicalUrl } from "@/lib/metadata/site-metadata";
import { buildOpportunityPath } from "@/lib/opportunities/routing";
import type { OpportunityItem } from "@/lib/opportunities/types";
import type { AtomFeedEntry } from "./atom";

export const JOB_FEED_SLUGS = CURATED_DISCOVERY_SLUGS;

function summary(item: OpportunityItem) {
  return item.excerpt.replace(/\s+/gu, " ").trim().slice(0, 280);
}

export function jobFeedEntries(
  items: OpportunityItem[],
  slug?: CuratedDiscoverySlug,
): AtomFeedEntry[] {
  if (slug && !JOB_FEED_SLUGS.includes(slug)) throw new Error(`Unknown job feed: ${slug}`);
  return items
    .filter((item) => !slug || matchesCuratedPreset(item, slug))
    .map((item) => {
      const url = resolveCanonicalUrl(buildOpportunityPath(item.id));
      return {
        id: url,
        url,
        title: item.title,
        updated: item.updatedAt,
        published: item.createdAt,
        summary: summary(item),
      };
    });
}
