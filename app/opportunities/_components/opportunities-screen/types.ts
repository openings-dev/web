import type {
  CommunityProfileSummary,
  OpportunityItem,
  OpportunitySortOrder,
  OpportunityViewMode,
  UserProfileSummary,
} from "@/lib/opportunities/types";
import type { TechnologyMatchMode } from "@/lib/opportunities/types";

export {
  OpportunityIssueState,
  OpportunitySalaryPeriod,
  OpportunitySortOrder,
  OpportunitySourceType,
  OpportunityViewMode,
  TechnologyMatchMode,
} from "@/lib/opportunities/types";
export type {
  CommunityProfileSummary,
  OpportunityCommunity,
  OpportunityFilterFacets,
  OpportunityItem,
  OpportunityPerson,
  OpportunitySalary,
  UserProfileSummary,
} from "@/lib/opportunities/types";

export interface OpportunityFiltersState {
  repository: string;
  region: string;
  country: string;
  tags: string[];
  authors: string[];
  workModels: string[];
  areas: string[];
  technologies: string[];
  technologyMatch: TechnologyMatchMode;
  seniority: string[];
  employmentTypes: string[];
  languages: string[];
  freshnessDays: string;
  salaryOnly: boolean;
  savedOnly: boolean;
  newOnly: boolean;
  searchText: string;
  sortOrder: OpportunitySortOrder;
  itemsPerPage: number;
  viewMode: OpportunityViewMode;
  page: number;
}

export interface FilterOption { value: string; label: string; count: number }
export interface OpportunityTagCategoryOptions {
  workModel: FilterOption[];
  stack: FilterOption[];
  seniority: FilterOption[];
  other: FilterOption[];
}
export interface OpportunityFilterOptions {
  repositories: FilterOption[];
  regions: FilterOption[];
  countries: FilterOption[];
  tags: FilterOption[];
  tagCategories: OpportunityTagCategoryOptions;
  authors: FilterOption[];
  workModels: FilterOption[];
  areas: FilterOption[];
  technologies: FilterOption[];
  seniority: FilterOption[];
  employmentTypes: FilterOption[];
  languages: FilterOption[];
}
export type OnFilterFieldChange = <TField extends keyof OpportunityFiltersState>(
  field: TField,
  value: OpportunityFiltersState[TField],
) => void;

export type ActiveOpportunityFilterKind =
  | "search"
  | "repository"
  | "region"
  | "country"
  | "stack"
  | "advanced-tag"
  | "author"
  | "sort"
  | "work-model"
  | "area"
  | "technology"
  | "technology-match"
  | "seniority"
  | "employment"
  | "language"
  | "freshness"
  | "salary"
  | "saved"
  | "new";

export interface ActiveOpportunityFilter {
  id: string;
  kind: ActiveOpportunityFilterKind;
  label: string;
  value: string;
  resetValue?: string;
}

export interface OpportunitiesQuickFiltersProps {
  filters: OpportunityFiltersState;
  options: OpportunityFilterOptions;
  activeFiltersCount: number;
  advancedFiltersOpen: boolean;
  onOpenAdvancedFilters: () => void;
  onFieldChange: OnFilterFieldChange;
  onSearchSubmitted: (searchText: string) => void;
  onClearFilters: () => void;
  forcedScope?: ShareableProfileScope | null;
}

export interface OpportunitiesFiltersProps {
  state: OpportunityFiltersState;
  options: OpportunityFilterOptions;
  open: boolean;
  resultCount: number;
  isLoading?: boolean;
  hasLoadError?: boolean;
  hasLoadMoreError?: boolean;
  activeFiltersCount: number;
  onOpenChange: (open: boolean) => void;
  onFieldChange: OnFilterFieldChange;
  onToggleTag: (tag: string) => void;
  onToggleAuthor: (authorHandle: string) => void;
  onClearFilters: (options?: { announce?: boolean }) => void;
  forcedScope?: ShareableProfileScope | null;
}
export interface OpportunitiesToolbarProps {
  rangeLabel: string;
  resultCount: number;
  lastUpdatedAt: string | null;
  isLoading: boolean;
  hasLoadError: boolean;
  sortOrder: OpportunitySortOrder;
  searchActive: boolean;
  viewMode: OpportunityViewMode;
  shareableDiscovery: boolean;
  onSortOrderChange: (value: OpportunitySortOrder) => void;
  onViewModeChange: (value: OpportunityViewMode) => void;
}
export interface OpportunitiesListProps {
  items: OpportunityItem[];
  viewMode: OpportunityViewMode;
  selectedOpportunityId: string | null;
  isLoading: boolean;
  hasLoadError: boolean;
  hasLoadMoreError: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  hasActiveFilters: boolean;
  skeletonCount: number;
  onLoadMore: () => void | Promise<void>;
  onClearFilters: () => void;
  onSelectOpportunity: (item: OpportunityItem) => void;
  onCommunitySelect: (repository: string) => void;
  onAuthorSelect: (authorHandle: string) => void;
  hideCommunityIdentity: boolean;
  hideAuthorIdentity: boolean;
  savedIds: ReadonlySet<string>;
  comparisonIds: ReadonlySet<string>;
  previousVisitAt: string | null;
  viewedIds: ReadonlySet<string>;
  onToggleSaved: (id: string) => void;
  onToggleComparison: (item: OpportunityItem) => void;
}
export interface OpportunityCardProps extends Pick<OpportunitiesListProps,
  "viewMode" | "onSelectOpportunity" | "onCommunitySelect" | "onAuthorSelect" |
  "hideCommunityIdentity" | "hideAuthorIdentity" | "savedIds" | "comparisonIds" |
  "previousVisitAt" | "viewedIds" | "onToggleSaved" | "onToggleComparison"> {
  item: OpportunityItem;
  isSelected: boolean;
}
export interface ViewModeToggleProps {
  value: OpportunityViewMode;
  onChange: (mode: OpportunityViewMode) => void;
}
export interface OpportunitiesScreenProps {
  forcedRepository?: string;
  forcedAuthor?: string;
  showHeader?: boolean;
}

export enum ShareableProfileKind {
  Community = "community",
  Publisher = "publisher",
}

export type ShareableProfileSource =
  | {
      kind: ShareableProfileKind.Community;
      profile: CommunityProfileSummary;
    }
  | {
      kind: ShareableProfileKind.Publisher;
      profile: UserProfileSummary;
    };

export interface ShareableProfileLocation {
  country?: string;
  region?: string;
}

interface ShareableProfilePresentationBase {
  kind: ShareableProfileKind;
  displayName: string;
  identity: string;
  avatarUrl?: string;
  location?: ShareableProfileLocation;
  opportunityCount: number;
  latestActivity?: string;
  description: string;
  canonicalPath: string;
  githubSourceUrl: string;
}

export type ShareableProfilePresentation =
  | (ShareableProfilePresentationBase & {
      kind: ShareableProfileKind.Community;
      repository: string;
    })
  | (ShareableProfilePresentationBase & {
      kind: ShareableProfileKind.Publisher;
      handle: string;
    });

export interface ShareableProfileScope {
  kind: ShareableProfileKind;
  identity: string;
}

export enum OpportunitySelectionStatus {
  Idle = "idle",
  Loading = "loading",
  Ready = "ready",
  NotFound = "not-found",
  LoadError = "load-error",
}

export interface OpportunityDrawerProps {
  item: OpportunityItem | null;
  open: boolean;
  hideCommunityIdentity: boolean;
  hideAuthorIdentity: boolean;
  onClose: () => void;
  onCommunitySelect: (repository: string) => void;
  onAuthorSelect: (authorHandle: string) => void;
  specimenMode?: boolean;
  selectedOpportunityId?: string | null;
  selectionStatus?: OpportunitySelectionStatus;
  savedIds?: ReadonlySet<string>;
  onToggleSaved?: (id: string) => void;
}
