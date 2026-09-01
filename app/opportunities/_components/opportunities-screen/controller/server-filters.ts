import {
  ALL_FILTER_VALUE,
  DEFAULT_FILTERS,
} from "./defaults";
import { normalizeFilterDependencies } from "./filter-dependencies";
import type { RepositoryFilterRegistry } from "./repository-filter-registry";
import { canonicalTagValue } from "./tag-normalization";
import type { OpportunityFiltersState } from "@/app/opportunities/_components/opportunities-screen/types";
import type { OpportunityServerFilters } from "@/lib/opportunities/api";

function uniqueValues(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function buildServerFilters(
  filters: Pick<
    OpportunityFiltersState,
    | "repository"
    | "region"
    | "country"
    | "sortOrder"
    | "searchText"
    | "tags"
    | "authors"
    | "workModels"
    | "areas"
    | "technologies"
    | "technologyMatch"
    | "seniority"
    | "employmentTypes"
    | "languages"
    | "freshnessDays"
    | "salaryOnly"
  >,
  forcedRepository: string | null,
  forcedAuthor: string | null,
  registry: RepositoryFilterRegistry | null,
  local: { includedIds?: string[]; includedIdsActive?: boolean; excludedIds?: string[]; createdAfter?: string | null } = {},
): OpportunityServerFilters {
  return normalizeFilterDependencies({
    repository: forcedRepository ??
      (filters.repository === ALL_FILTER_VALUE ||
        !registry ||
        registry.repositories.has(filters.repository)
        ? filters.repository
        : DEFAULT_FILTERS.repository),
    region:
      filters.region === ALL_FILTER_VALUE ||
        !registry ||
        registry.regions.has(filters.region)
        ? filters.region
        : ALL_FILTER_VALUE,
    country: filters.country === ALL_FILTER_VALUE ||
      !registry ||
      registry.countries.has(filters.country)
      ? filters.country
      : ALL_FILTER_VALUE,
    sortOrder: filters.sortOrder,
    searchText: filters.searchText.trim(),
    tags: [...new Set(filters.tags.map((tag) => canonicalTagValue(tag)).filter(Boolean))],
    authors: forcedAuthor ? [forcedAuthor] : uniqueValues(filters.authors),
    workModels: uniqueValues(filters.workModels),
    areas: uniqueValues(filters.areas),
    technologies: uniqueValues(filters.technologies),
    technologyMatch: filters.technologyMatch,
    seniority: uniqueValues(filters.seniority),
    employmentTypes: uniqueValues(filters.employmentTypes),
    languages: uniqueValues(filters.languages),
    freshnessDays: filters.freshnessDays,
    salaryOnly: filters.salaryOnly,
    includedIds: local.includedIds ?? [],
    includedIdsActive: local.includedIdsActive ?? false,
    excludedIds: local.excludedIds ?? [],
    createdAfter: local.createdAfter ?? null,
  }, registry, {
    allowLocationWithRepository: Boolean(forcedRepository),
  });
}
