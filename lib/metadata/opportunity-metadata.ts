import type { Metadata } from "next";
import type { OpportunityItem } from "@/lib/opportunities/types";
import { buildOpportunityPath } from "@/lib/opportunities/routing";
import { createPageMetadata } from "./site-metadata";

const MAX_DESCRIPTION_LENGTH = 156;

function normalizeDescription(value: string): string {
  return value.replace(/\s+/gu, " ").trim();
}

function truncateDescription(value: string): string {
  if (value.length <= MAX_DESCRIPTION_LENGTH) return value;
  return `${value.slice(0, MAX_DESCRIPTION_LENGTH - 1).trimEnd()}…`;
}

export function opportunityMetadataDescription(item: OpportunityItem): string {
  const excerpt = normalizeDescription(item.excerpt);
  if (excerpt) return truncateDescription(excerpt);

  const community = item.community.name || item.repository;
  return truncateDescription(
    `Review this job shared through ${community}, then open the original public listing for current details.`,
  );
}

export function createOpportunityMetadata(item: OpportunityItem): Metadata {
  const path = buildOpportunityPath(item.id);

  return createPageMetadata({
    title: item.title,
    description: opportunityMetadataDescription(item),
    path,
    openGraphType: "article",
    socialImageAlt: `${item.title}. Open job on openings.dev`,
  });
}
