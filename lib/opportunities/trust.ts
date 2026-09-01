import type { StaticCommunityStatus } from "./api-types";
import type {
  OpportunityDataProvenance,
  OpportunityFieldProvenance,
  OpportunityItem,
} from "./types";

export interface OpportunityTrustField {
  field: keyof OpportunityDataProvenance;
  provenance: OpportunityFieldProvenance;
}

export interface OpportunityTrustSummary {
  lastVerifiedAt: string | null;
  sourceCount: number;
  fields: OpportunityTrustField[];
  stale: boolean;
  incomplete: boolean;
}

const TRUST_FIELDS: Array<keyof OpportunityDataProvenance> = [
  "location",
  "salary",
  "seniority",
  "workModel",
];

function sourceRepositories(item: OpportunityItem): string[] {
  const repositories = item.sources?.length
    ? item.sources.map((source) => source.repository)
    : [item.repository];
  return [...new Set(repositories.filter(Boolean))];
}

function lastVerifiedAt(
  repositories: string[],
  status: Pick<StaticCommunityStatus, "items"> | null | undefined,
): string | null {
  if (!status || repositories.length === 0) return null;
  const byRepository = new Map(
    status.items.map((item) => [item.repository, item.lastSuccessfulSyncAt]),
  );
  const timestamps = repositories.map((repository) => byRepository.get(repository));
  if (timestamps.some((timestamp) => !timestamp || !Number.isFinite(Date.parse(timestamp)))) {
    return null;
  }
  return timestamps
    .map((timestamp) => timestamp as string)
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0] ?? null;
}

export function buildOpportunityTrustSummary(
  item: OpportunityItem,
  status?: Pick<StaticCommunityStatus, "items"> | null,
): OpportunityTrustSummary {
  const repositories = sourceRepositories(item);
  const fields = TRUST_FIELDS.map((field) => ({
    field,
    provenance: item.dataProvenance?.[field] ?? "unknown" as const,
  }));
  const stale = item.freshness?.status === "stale";
  const unknownCriticalField = fields.some(({ field, provenance }) =>
    (field === "location" || field === "salary") && provenance === "unknown");

  return {
    lastVerifiedAt: lastVerifiedAt(repositories, status),
    sourceCount: item.sources?.length || 1,
    fields,
    stale,
    incomplete: stale && unknownCriticalField,
  };
}
