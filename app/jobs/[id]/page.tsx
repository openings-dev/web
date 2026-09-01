import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OpportunityDetails } from "@/app/opportunities/_components/opportunity-details";
import { OpportunityDetailsMode } from "@/app/opportunities/_components/opportunity-details/types";
import { createOpportunityMetadata } from "@/lib/metadata/opportunity-metadata";
import { resolvePublicSiteUrl } from "@/lib/metadata/site-metadata";
import { fetchOpportunityById, fetchSimilarOpportunities } from "@/lib/opportunities/api";
import {
  buildCommunityPath,
  buildOpportunityPath,
  buildUserPath,
} from "@/lib/opportunities/routing";
import { listStaticOpportunityRouteIds } from "@/lib/opportunities/static-api";
import { getCommunityStatus } from "@/lib/opportunities/status";
import { buildOpportunityTrustSummary } from "@/lib/opportunities/trust";
import {
  buildJobPostingJsonLd,
  serializeJobPostingJsonLd,
} from "@/lib/metadata/job-posting";

interface JobPageProps {
  params: Promise<{ id: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams(): Promise<Array<{ id: string }>> {
  const ids = await listStaticOpportunityRouteIds();
  return ids.map((id) => ({ id }));
}

const resolveOpportunity = cache(async (params: JobPageProps["params"]) => {
  const { id: encodedId } = await params;
  const id = decodeURIComponent(encodedId);
  return fetchOpportunityById(id);
});

export async function generateMetadata({
  params,
}: JobPageProps): Promise<Metadata> {
  const item = await resolveOpportunity(params);
  if (!item) return {};
  return createOpportunityMetadata(item);
}

export default async function JobPage({
  params,
}: JobPageProps): Promise<React.ReactNode> {
  const item = await resolveOpportunity(params);
  if (!item) notFound();
  const [status, similarItems] = await Promise.all([
    getCommunityStatus().catch(() => null),
    fetchSimilarOpportunities(item).catch(() => []),
  ]);
  const jobPosting = buildJobPostingJsonLd(item);

  return (
    <>
      {jobPosting ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJobPostingJsonLd(jobPosting) }}
        />
      ) : null}
      <OpportunityDetails
        item={item}
        mode={OpportunityDetailsMode.Page}
        shareUrl={resolvePublicSiteUrl(buildOpportunityPath(item.id))}
        communityHref={buildCommunityPath(item.repository)}
        authorHref={buildUserPath(item.author.handle)}
        trustSummary={buildOpportunityTrustSummary(item, status)}
        similarItems={similarItems}
      />
    </>
  );
}
