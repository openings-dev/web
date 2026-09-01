import { serializeAtomFeed } from "@/lib/feeds/atom";
import { jobFeedEntries } from "@/lib/feeds/jobs";
import { resolveCanonicalUrl } from "@/lib/metadata/site-metadata";
import {
  getStaticOpportunityGeneratedAt,
  listStaticOpportunities,
} from "@/lib/opportunities/static-api";

export const dynamic = "force-static";

export async function GET() {
  const [items, generatedAt] = await Promise.all([
    listStaticOpportunities(),
    getStaticOpportunityGeneratedAt(),
  ]);
  const body = serializeAtomFeed({
    id: resolveCanonicalUrl("/feed.xml"),
    title: "openings.dev — Recent jobs",
    subtitle: "Recent technology jobs from public GitHub communities.",
    selfUrl: resolveCanonicalUrl("/feed.xml"),
    siteUrl: resolveCanonicalUrl("/"),
    updated: generatedAt,
    entries: jobFeedEntries(items),
  });
  return new Response(body, {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
}
