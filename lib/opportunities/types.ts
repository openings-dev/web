import type {
  OpportunityIssueState,
  OpportunityPromotionType,
  OpportunitySalaryPeriod,
  OpportunitySourceType,
} from "./enums";

export {
  OpportunityIssueState,
  OpportunityPromotionType,
  OpportunitySalaryPeriod,
  OpportunitySortOrder,
  OpportunitySourceType,
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

export interface OpportunityPromotion {
  type: OpportunityPromotionType;
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
  author: OpportunityPerson;
  community: OpportunityCommunity;
  companyName?: string;
  salary?: OpportunitySalary;
  promotion?: OpportunityPromotion;
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
