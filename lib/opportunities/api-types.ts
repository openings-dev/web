import type { OpportunityFilterFacets, OpportunityItem } from "./types";
import type { OpportunitySortOrder } from "./types";

export interface OpportunityServerFilters {
  repository: string;
  region: string;
  country: string;
  tags: string[];
  authors: string[];
  searchText: string;
  workModels: string[];
  areas: string[];
  technologies: string[];
  technologyMatch: "any" | "all";
  seniority: string[];
  employmentTypes: string[];
  languages: string[];
  freshnessDays: string;
  salaryOnly: boolean;
  includedIds: string[];
  includedIdsActive: boolean;
  excludedIds: string[];
  createdAfter: string | null;
  sortOrder: OpportunitySortOrder;
}

export type OpportunityDimensionKey =
  | "repositories"
  | "regions"
  | "countries"
  | "tags"
  | "authors"
  | "jobCountries"
  | "jobRegions"
  | "workModels"
  | "areas"
  | "technologies"
  | "seniority"
  | "employmentTypes"
  | "languages"
  | "freshness"
  | "salaryDisclosed";


export type OpportunityFacetIndexDimensions = Record<
  OpportunityDimensionKey,
  Record<string, string[]>
>;

export interface StaticManifestPage {
  page: number;
  file: string;
  count: number;
}

export interface StaticManifestTotals {
  openOpportunities: number;
  pages: number;
  repositories: number;
  countries: number;
  regions: number;
  communities: number;
}

export interface StaticManifest {
  schemaVersion: 6;
  generatedAt: string;
  dataHash: string;
  pageSize: number;
  totals: StaticManifestTotals;
  files: {
    facets: string;
    pageLookup: string;
    search: string;
    jobIds: string;
    order: string;
    communities: string;
    aliases: string;
    status: string;
    statusHistory?: string;
  };
  facets: OpportunityFilterFacets;
  pages: StaticManifestPage[];
}

export interface StaticCommunity {
  repository: string;
  repositoryUrl: string;
  name: string;
  avatarUrl: string;
  region: string;
  country: string;
  countryCode: string;
  locale: string;
  scope: string;
  opportunitiesCount: number;
  lastPostedAt: string | null;
}

export interface StaticCommunities {
  generatedAt: string;
  items: StaticCommunity[];
}

export interface StaticFacetIndex {
  generatedAt: string;
  dimensions: OpportunityFacetIndexDimensions;
  labels: { authors?: Record<string, string> };
}

export interface StaticSearchIndex {
  generatedAt: string;
  items: Array<{
    id: string;
    createdAt: string;
    text: string;
    fields: Record<"title" | "company" | "taxonomy" | "location" | "excerpt" | "source", string>;
  }>;
}

export interface StaticOpportunityAliases {
  generatedAt: string;
  ids: Record<string, string>;
}

export interface StaticCommunityStatusItem {
  repository: string;
  repositoryUrl: string;
  name: string;
  country: string;
  countryCode: string;
  region: string;
  state: "healthy" | "no-openings" | "error";
  openOpportunities: number;
  lastSuccessfulSyncAt: string | null;
  lastPostedAt: string | null;
}

export interface StaticCommunityStatus {
  generatedAt: string;
  totals: { communities: number; healthy: number; noOpenings: number; errors: number };
  items: StaticCommunityStatusItem[];
}

export interface StaticCommunityStatusHistoryRun {
  startedAt: string;
  completedAt: string;
  durationMs: number;
  outcome: "healthy" | "partial";
  communities: number;
  successful: number;
  failed: number;
  noOpenings: number;
  openOpportunities: number;
}

export interface StaticCommunityStatusHistoryDay {
  date: string;
  runs: number;
  partialRuns: number;
  failedCommunityRuns: number;
  latestOpenOpportunities: number;
}

export interface StaticCommunityStatusHistory {
  generatedAt: string;
  retentionDays: 30;
  runs: StaticCommunityStatusHistoryRun[];
  days: StaticCommunityStatusHistoryDay[];
}

export interface OpportunitiesApiMeta {
  snapshotGeneratedAt: string | null;
  deployedAt: string | null;
  lastUpdatedAt: string | null;
  totalCount: number;
  filteredCount: number;
  facets: OpportunityFilterFacets;
}

export interface OpportunitiesApiPayload {
  items: OpportunityItem[];
  nextCursor: string | null;
  hasMore: boolean;
  rateLimited: boolean;
  retryAfterSeconds: number | null;
  meta: OpportunitiesApiMeta;
}
