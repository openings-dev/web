import {
  ALL_FILTER_VALUE,
  DEFAULT_FILTERS,
} from "./defaults";
import { normalizeFilterDependencies } from "./filter-dependencies";
import type { RepositoryFilterRegistry } from "./repository-filter-registry";
import { canonicalTagValue } from "./tag-normalization";
import type { OpportunityFiltersState } from "@/app/opportunities/_components/opportunities-screen/types";

function uniqueValues(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function normalizeFilters(
  filters: OpportunityFiltersState,
  forcedRepository: string | null,
  forcedAuthor: string | null,
  registry: RepositoryFilterRegistry | null,
) {
  const normalizedTags = [...new Set(filters.tags.map((tag) => canonicalTagValue(tag)).filter(Boolean))];
  const locationFilters = normalizeFilterDependencies({
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
    country:
      filters.country === ALL_FILTER_VALUE ||
        !registry ||
        registry.countries.has(filters.country)
        ? filters.country
        : ALL_FILTER_VALUE,
  }, registry, {
    allowLocationWithRepository: Boolean(forcedRepository),
  });

  return {
    ...filters,
    ...locationFilters,
    tags: normalizedTags,
    authors: forcedAuthor ? [forcedAuthor] : uniqueValues(filters.authors),
    workModels: uniqueValues(filters.workModels),
    areas: uniqueValues(filters.areas),
    technologies: uniqueValues(filters.technologies),
    seniority: uniqueValues(filters.seniority),
    employmentTypes: uniqueValues(filters.employmentTypes),
    languages: uniqueValues(filters.languages),
  };
}
