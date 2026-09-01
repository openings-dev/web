import {
  OpportunitySortOrder,
  TechnologyMatchMode,
  OpportunityViewMode,
  type OpportunityFiltersState,
} from "@/app/opportunities/_components/opportunities-screen/types";

export const INITIAL_BATCH_SIZE = 20;
export const LOAD_MORE_BATCH_SIZE = 20;
export const ALL_FILTER_VALUE = "all";

export const DEFAULT_FILTERS: OpportunityFiltersState = {
  repository: ALL_FILTER_VALUE,
  region: ALL_FILTER_VALUE,
  country: ALL_FILTER_VALUE,
  tags: [],
  authors: [],
  workModels: [],
  areas: [],
  technologies: [],
  technologyMatch: TechnologyMatchMode.Any,
  seniority: [],
  employmentTypes: [],
  languages: [],
  freshnessDays: ALL_FILTER_VALUE,
  salaryOnly: false,
  savedOnly: false,
  newOnly: false,
  searchText: "",
  sortOrder: OpportunitySortOrder.Recent,
  itemsPerPage: 20,
  viewMode: OpportunityViewMode.List,
  page: 1,
};
