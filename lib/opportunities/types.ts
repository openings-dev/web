import type {
  OpportunityIssueState,
  OpportunitySalaryPeriod,
  OpportunitySourceType,
} from "./enums";

export {
  OpportunityIssueState,
  OpportunitySalaryPeriod,
  OpportunitySortOrder,
  OpportunitySourceType,
  TechnologyMatchMode,
  OpportunityViewMode,
} from "./enums";

export interface OpportunityPerson {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
}

export interface OpportunityCommunity {
  id: string;
  name: string;
  avatarUrl: string;
  repository: string;
  url: string;
}

export interface OpportunitySalary {
  currency: string;
  min?: number;
  max?: number;
  period: OpportunitySalaryPeriod;
}

export interface OpportunityLocation {
  country?: string;
  countryCode?: string;
  region?: string;
  subdivision?: string;
  city?: string;
  workModel?: string;
  remoteScope?: string;
  displayText?: string;
  confidence: "explicit" | "unknown";
}

export interface OpportunityTaxonomy {
  areas: string[];
  technologies: string[];
  seniority: string[];
  employmentTypes: string[];
  workModels: string[];
  languages: string[];
}

export interface OpportunityFreshness {
  ageDays: number;
  publishedAt: string;
  status: "fresh" | "aging" | "stale";
}

export type OpportunityFieldProvenance = "declared" | "inferred" | "unknown";

export interface OpportunityDataProvenance {
  location: OpportunityFieldProvenance;
  salary: OpportunityFieldProvenance;
  seniority: OpportunityFieldProvenance;
  workModel: OpportunityFieldProvenance;
}

export interface OpportunitySource {
  id: string;
  sourceId?: string;
  repository: string;
  repositoryUrl: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  community: OpportunityCommunity;
}

export interface OpportunityItem {
  id: string;
  sourceId?: string;
  title: string;
  description: string;
  excerpt: string;
  issueState: OpportunityIssueState;
  repository: string;
  repositoryUrl: string;
  region: string;
  country: string;
  tags: string[];
  sourceTags?: string[];
  sourceLocation?: Pick<OpportunityLocation, "country" | "countryCode" | "region">;
  jobLocation?: OpportunityLocation;
  taxonomy?: OpportunityTaxonomy;
  freshness?: OpportunityFreshness;
  dataProvenance?: OpportunityDataProvenance;
  sources?: OpportunitySource[];
  deduplication?: { sourceCount: number };
  author: OpportunityPerson;
  community: OpportunityCommunity;
  companyName?: string;
  salary?: OpportunitySalary;
  createdAt: string;
  updatedAt: string;
  url: string;
  sourceType: OpportunitySourceType;
}

export interface OpportunityFilterFacets {
  repositories: Record<string, number>;
  regions: Record<string, number>;
  countries: Record<string, number>;
  tags: Record<string, number>;
  authors: Record<string, number>;
  authorLabels: Record<string, string>;
  jobCountries: Record<string, number>;
  jobRegions: Record<string, number>;
  workModels: Record<string, number>;
  areas: Record<string, number>;
  technologies: Record<string, number>;
  seniority: Record<string, number>;
  employmentTypes: Record<string, number>;
  languages: Record<string, number>;
  freshness: Record<string, number>;
  salaryDisclosed: Record<string, number>;
}

export interface UserProfileSummary {
  handle: string;
  name: string;
  avatarUrl?: string;
  region?: string;
  country?: string;
  opportunitiesCount: number;
  lastPostedAt: string | null;
}

export interface CommunityProfileSummary {
  repository: string;
  repositoryUrl: string;
  name: string;
  avatarUrl?: string;
  region?: string;
  country?: string;
  opportunitiesCount: number;
  lastPostedAt: string | null;
}
