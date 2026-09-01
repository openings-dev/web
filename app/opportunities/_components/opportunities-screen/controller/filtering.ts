import {
  OpportunityIssueState,
  OpportunitySortOrder,
  type OpportunityFiltersState,
  type OpportunityItem,
} from "@/app/opportunities/_components/opportunities-screen/types";
import { canonicalTagValue } from "./tag-normalization";

export function getFilteredOpportunities(
  opportunities: OpportunityItem[],
  filters: OpportunityFiltersState,
  local: { savedIds?: ReadonlySet<string>; viewedIds?: ReadonlySet<string>; previousVisitAt?: string | null } = {},
) {
  const selectedTagKeys = filters.tags.length > 0
    ? new Set(filters.tags.map((tag) => canonicalTagValue(tag)).filter(Boolean))
    : null;

  return opportunities
    .filter((opportunity) => {
      if (opportunity.issueState !== OpportunityIssueState.Open) return false;
      const repositories = opportunity.sources?.map((source) => source.repository) ?? [opportunity.repository];
      const matchesRepository = filters.repository === "all" || repositories.includes(filters.repository);
      const matchesRegion = filters.region === "all" || opportunity.jobLocation?.region === filters.region;
      const matchesCountry = filters.country === "all" || opportunity.jobLocation?.country === filters.country;
      const matchesTags =
        !selectedTagKeys ||
        opportunity.tags.some((tag) => selectedTagKeys.has(canonicalTagValue(tag)));
      const matchesAuthors =
        filters.authors.length === 0 || filters.authors.includes(opportunity.author.handle);
      const taxonomy = opportunity.taxonomy;
      const matchesStructured = [
        [filters.workModels, taxonomy?.workModels ?? []],
        [filters.areas, taxonomy?.areas ?? []],
        [filters.seniority, taxonomy?.seniority ?? []],
        [filters.employmentTypes, taxonomy?.employmentTypes ?? []],
        [filters.languages, taxonomy?.languages ?? []],
      ].every(([selected, values]) => selected.length === 0 || selected.some((value) => values.includes(value)));
      const matchesTechnologies = filters.technologies.length === 0 ||
        (filters.technologyMatch === "all"
          ? filters.technologies.every((value) => taxonomy?.technologies.includes(value))
          : filters.technologies.some((value) => taxonomy?.technologies.includes(value)));
      const matchesFreshness = filters.freshnessDays === "all" ||
        (opportunity.freshness?.ageDays ?? Number.POSITIVE_INFINITY) <= Number(filters.freshnessDays);
      const matchesSalary = !filters.salaryOnly || Boolean(opportunity.salary);
      const matchesSaved = !filters.savedOnly || Boolean(local.savedIds?.has(opportunity.id));
      const matchesNew = !filters.newOnly || Boolean(local.previousVisitAt &&
        !local.viewedIds?.has(opportunity.id) &&
        Date.parse(opportunity.createdAt) > Date.parse(local.previousVisitAt));
      return (
        matchesRepository &&
        matchesRegion &&
        matchesCountry &&
        matchesTags &&
        matchesAuthors &&
        matchesStructured &&
        matchesTechnologies &&
        matchesFreshness &&
        matchesSalary &&
        matchesSaved &&
        matchesNew
      );
    })
    .sort((left, right) => {
      if (filters.searchText.trim()) return 0;
      const leftDate = new Date(left.createdAt).getTime();
      const rightDate = new Date(right.createdAt).getTime();
      return filters.sortOrder === OpportunitySortOrder.Recent
        ? rightDate - leftDate
        : leftDate - rightDate;
    });
}

export function dedupeOpportunities(items: OpportunityItem[]) {
  const byId = new Map<string, OpportunityItem>();
  for (const item of items) byId.set(item.id, item);
  return [...byId.values()];
}
