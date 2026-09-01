import { notFound } from "next/navigation";
import { serializeAtomFeed } from "@/lib/feeds/atom";
import { JOB_FEED_SLUGS, jobFeedEntries } from "@/lib/feeds/jobs";
import { resolveCanonicalUrl } from "@/lib/metadata/site-metadata";
import {
  getStaticOpportunityGeneratedAt,
  listStaticOpportunities,
} from "@/lib/opportunities/static-api";

export const dynamic = "force-static";

export function generateStaticParams() {
  return JOB_FEED_SLUGS.map((slug) => ({ slug: `${slug}.xml` }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const feedSlug = slug.endsWith(".xml") ? slug.slice(0, -4) : "";
  if (!JOB_FEED_SLUGS.includes(feedSlug as typeof JOB_FEED_SLUGS[number])) notFound();
  const typedFeedSlug = feedSlug as typeof JOB_FEED_SLUGS[number];
  const [items, generatedAt] = await Promise.all([
    listStaticOpportunities(),
    getStaticOpportunityGeneratedAt(),
  ]);
  const path = `/feeds/${slug}`;
  const body = serializeAtomFeed({
    id: resolveCanonicalUrl(path),
    title: `openings.dev — ${typedFeedSlug} jobs`,
    subtitle: `Curated ${typedFeedSlug} technology jobs from public GitHub communities.`,
    selfUrl: resolveCanonicalUrl(path),
    siteUrl: resolveCanonicalUrl(`/en/discover/${typedFeedSlug}`),
    updated: generatedAt,
    entries: jobFeedEntries(items, typedFeedSlug),
  });
  return new Response(body, {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
}

