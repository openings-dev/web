import {
  ALL_FILTER_VALUE,
  DEFAULT_FILTERS,
} from "./defaults";
import {
  OpportunitySortOrder,
  TechnologyMatchMode,
  OpportunityViewMode,
  type OpportunityFiltersState,
} from "@/app/opportunities/_components/opportunities-screen/types";

export const OPPORTUNITY_QUERY_KEYS = {
  repository: "repository",
  region: "region",
  country: "country",
  tags: "tags",
  authors: "authors",
  workModels: "workModels",
  areas: "areas",
  technologies: "technologies",
  technologyMatch: "technologyMatch",
  seniority: "seniority",
  employmentTypes: "employmentTypes",
  languages: "languages",
  freshnessDays: "freshness",
  salaryOnly: "salary",
  savedOnly: "saved",
  newOnly: "new",
  searchText: "search",
  sortOrder: "sort",
  itemsPerPage: "perPage",
  viewMode: "view",
  page: "page",
  selectedOpportunity: "job",
} as const;

function parseSortOrder(value: string | null, hasSearch: boolean): OpportunitySortOrder {
  return Object.values(OpportunitySortOrder).includes(value as OpportunitySortOrder)
    ? value as OpportunitySortOrder
    : hasSearch ? OpportunitySortOrder.Relevance : OpportunitySortOrder.Recent;
}

function parseViewMode(value: string | null): OpportunityViewMode {
  return value === OpportunityViewMode.Grid
    ? OpportunityViewMode.Grid
    : OpportunityViewMode.List;
}

function parseListParam(value: string | null) {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function parseItemsPerPage(value: string | null) {
  // Legacy perPage URLs remain valid, but discovery now uses one predictable batch size.
  void value;
  return DEFAULT_FILTERS.itemsPerPage;
}

function parsePage(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function parseBoolean(value: string | null) {
  return value === "true";
}

function parseFreshness(value: string | null) {
  return ["7", "30", "90"].includes(value ?? "") ? String(value) : "all";
}

export function parseFiltersFromSearchParams(searchParams: URLSearchParams) {
  const repository = searchParams.get(OPPORTUNITY_QUERY_KEYS.repository) ?? DEFAULT_FILTERS.repository;
  const region = searchParams.get(OPPORTUNITY_QUERY_KEYS.region) ?? DEFAULT_FILTERS.region;
  const countryFromUrl = searchParams.get(OPPORTUNITY_QUERY_KEYS.country);
  const shouldFallbackCountryToAll =
    countryFromUrl === null &&
    (repository !== DEFAULT_FILTERS.repository ||
      region !== DEFAULT_FILTERS.region);
  const searchText = searchParams.get(OPPORTUNITY_QUERY_KEYS.searchText) ?? DEFAULT_FILTERS.searchText;

  return {
    repository,
    region,
    country: countryFromUrl ??
      (shouldFallbackCountryToAll ? ALL_FILTER_VALUE : DEFAULT_FILTERS.country),
    tags: parseListParam(searchParams.get(OPPORTUNITY_QUERY_KEYS.tags)),
    authors: parseListParam(searchParams.get(OPPORTUNITY_QUERY_KEYS.authors)),
    workModels: parseListParam(searchParams.get(OPPORTUNITY_QUERY_KEYS.workModels)),
    areas: parseListParam(searchParams.get(OPPORTUNITY_QUERY_KEYS.areas)),
    technologies: parseListParam(searchParams.get(OPPORTUNITY_QUERY_KEYS.technologies)),
    technologyMatch: searchParams.get(OPPORTUNITY_QUERY_KEYS.technologyMatch) === TechnologyMatchMode.All
      ? TechnologyMatchMode.All
      : TechnologyMatchMode.Any,
    seniority: parseListParam(searchParams.get(OPPORTUNITY_QUERY_KEYS.seniority)),
    employmentTypes: parseListParam(searchParams.get(OPPORTUNITY_QUERY_KEYS.employmentTypes)),
    languages: parseListParam(searchParams.get(OPPORTUNITY_QUERY_KEYS.languages)),
    freshnessDays: parseFreshness(searchParams.get(OPPORTUNITY_QUERY_KEYS.freshnessDays)),
    salaryOnly: parseBoolean(searchParams.get(OPPORTUNITY_QUERY_KEYS.salaryOnly)),
    savedOnly: parseBoolean(searchParams.get(OPPORTUNITY_QUERY_KEYS.savedOnly)),
    newOnly: parseBoolean(searchParams.get(OPPORTUNITY_QUERY_KEYS.newOnly)),
    searchText,
    sortOrder: parseSortOrder(searchParams.get(OPPORTUNITY_QUERY_KEYS.sortOrder), Boolean(searchText.trim())),
    itemsPerPage: parseItemsPerPage(searchParams.get(OPPORTUNITY_QUERY_KEYS.itemsPerPage)),
    viewMode: parseViewMode(searchParams.get(OPPORTUNITY_QUERY_KEYS.viewMode)),
    page: parsePage(searchParams.get(OPPORTUNITY_QUERY_KEYS.page)),
  } satisfies OpportunityFiltersState;
}

interface BuildSearchParamsOptions {
  defaultCountry?: string;
}

export function buildSearchParamsFromFilters(
  state: OpportunityFiltersState,
  options: BuildSearchParamsOptions = {},
) {
  const params = new URLSearchParams();
  const defaultCountry = options.defaultCountry ?? DEFAULT_FILTERS.country;
  if (state.repository !== DEFAULT_FILTERS.repository) params.set(OPPORTUNITY_QUERY_KEYS.repository, state.repository);
  if (state.region !== DEFAULT_FILTERS.region) params.set(OPPORTUNITY_QUERY_KEYS.region, state.region);
  const countryIsImplicitAll =
    state.country === ALL_FILTER_VALUE &&
    (defaultCountry === ALL_FILTER_VALUE ||
      state.repository !== DEFAULT_FILTERS.repository ||
      state.region !== DEFAULT_FILTERS.region);
  if (state.country !== defaultCountry && !countryIsImplicitAll) {
    params.set(OPPORTUNITY_QUERY_KEYS.country, state.country);
  }
  if (state.tags.length > 0) params.set(OPPORTUNITY_QUERY_KEYS.tags, state.tags.join(","));
  if (state.authors.length > 0) params.set(OPPORTUNITY_QUERY_KEYS.authors, state.authors.join(","));
  if (state.workModels.length > 0) params.set(OPPORTUNITY_QUERY_KEYS.workModels, state.workModels.join(","));
  if (state.areas.length > 0) params.set(OPPORTUNITY_QUERY_KEYS.areas, state.areas.join(","));
  if (state.technologies.length > 0) params.set(OPPORTUNITY_QUERY_KEYS.technologies, state.technologies.join(","));
  if (state.technologyMatch !== DEFAULT_FILTERS.technologyMatch) params.set(OPPORTUNITY_QUERY_KEYS.technologyMatch, state.technologyMatch);
  if (state.seniority.length > 0) params.set(OPPORTUNITY_QUERY_KEYS.seniority, state.seniority.join(","));
  if (state.employmentTypes.length > 0) params.set(OPPORTUNITY_QUERY_KEYS.employmentTypes, state.employmentTypes.join(","));
  if (state.languages.length > 0) params.set(OPPORTUNITY_QUERY_KEYS.languages, state.languages.join(","));
  if (state.freshnessDays !== "all") params.set(OPPORTUNITY_QUERY_KEYS.freshnessDays, state.freshnessDays);
  if (state.salaryOnly) params.set(OPPORTUNITY_QUERY_KEYS.salaryOnly, "true");
  if (state.savedOnly) params.set(OPPORTUNITY_QUERY_KEYS.savedOnly, "true");
  if (state.newOnly) params.set(OPPORTUNITY_QUERY_KEYS.newOnly, "true");
  if (state.searchText.trim()) params.set(OPPORTUNITY_QUERY_KEYS.searchText, state.searchText.trim());
  if (state.sortOrder !== DEFAULT_FILTERS.sortOrder) params.set(OPPORTUNITY_QUERY_KEYS.sortOrder, state.sortOrder);
  if (state.viewMode !== DEFAULT_FILTERS.viewMode) params.set(OPPORTUNITY_QUERY_KEYS.viewMode, state.viewMode);
  if (state.page !== DEFAULT_FILTERS.page) params.set(OPPORTUNITY_QUERY_KEYS.page, String(state.page));
  return params;
}
