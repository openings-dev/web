import {
  OpportunitySortOrder,
  type ActiveOpportunityFilter,
  type OnFilterFieldChange,
  type OpportunityFiltersState,
} from "@/app/opportunities/_components/opportunities-screen/types";
import { ALL_FILTER_VALUE, DEFAULT_FILTERS } from "./defaults";
import { classifyOpportunityTag, OpportunityTagCategory } from "./tag-categories";

function defaultCountry(
  forcedRepository: string | null,
  forcedAuthor: string | null,
) {
  return forcedRepository || forcedAuthor
    ? ALL_FILTER_VALUE
    : DEFAULT_FILTERS.country;
}

export function getActiveOpportunityFilters(
  filters: OpportunityFiltersState,
  forcedRepository: string | null,
  forcedAuthor: string | null,
): ActiveOpportunityFilter[] {
  const items: ActiveOpportunityFilter[] = [];
  const searchText = filters.searchText.trim();

  if (searchText) {
    items.push({
      id: "search",
      kind: "search",
      label: searchText,
      value: filters.searchText,
      resetValue: "",
    });
  }

  if (!forcedRepository && filters.repository !== DEFAULT_FILTERS.repository) {
    items.push({
      id: `repository:${filters.repository}`,
      kind: "repository",
      label: filters.repository,
      value: filters.repository,
      resetValue: DEFAULT_FILTERS.repository,
    });
  }

  if (filters.region !== DEFAULT_FILTERS.region) {
    items.push({
      id: `region:${filters.region}`,
      kind: "region",
      label: filters.region,
      value: filters.region,
      resetValue: DEFAULT_FILTERS.region,
    });
  }

  const countryResetValue = defaultCountry(forcedRepository, forcedAuthor);
  const countryIsImplicitAll =
    filters.country === ALL_FILTER_VALUE &&
    (Boolean(forcedRepository) ||
      Boolean(forcedAuthor) ||
      filters.repository !== DEFAULT_FILTERS.repository ||
      filters.region !== DEFAULT_FILTERS.region);
  if (filters.country !== countryResetValue && !countryIsImplicitAll) {
    items.push({
      id: `country:${filters.country}`,
      kind: "country",
      label: filters.country,
      value: filters.country,
      resetValue: countryResetValue,
    });
  }

  for (const tag of filters.tags) {
    const category = classifyOpportunityTag(tag).category;
    items.push({
      id: `tag:${tag}`,
      kind: category === OpportunityTagCategory.Stack ? "stack" : "advanced-tag",
      label: tag,
      value: tag,
    });
  }

  if (!forcedAuthor) {
    for (const author of filters.authors) {
      items.push({
        id: `author:${author}`,
        kind: "author",
        label: author,
        value: author,
      });
    }
  }

  for (const [field, kind] of [
    ["workModels", "work-model"],
    ["areas", "area"],
    ["technologies", "technology"],
    ["seniority", "seniority"],
    ["employmentTypes", "employment"],
    ["languages", "language"],
  ] as const) {
    for (const value of filters[field]) {
      items.push({ id: `${field}:${value}`, kind, label: value, value });
    }
  }
  if (filters.technologies.length > 1 && filters.technologyMatch !== DEFAULT_FILTERS.technologyMatch) {
    items.push({
      id: "technology-match",
      kind: "technology-match",
      label: filters.technologyMatch,
      value: filters.technologyMatch,
    });
  }
  if (filters.freshnessDays !== ALL_FILTER_VALUE) {
    items.push({
      id: `freshness:${filters.freshnessDays}`,
      kind: "freshness",
      label: `${filters.freshnessDays} days`,
      value: filters.freshnessDays,
      resetValue: ALL_FILTER_VALUE,
    });
  }
  if (filters.salaryOnly) {
    items.push({ id: "salary", kind: "salary", label: "Salary", value: "true" });
  }
  if (filters.savedOnly) {
    items.push({ id: "saved", kind: "saved", label: "Saved", value: "true" });
  }
  if (filters.newOnly) {
    items.push({ id: "new", kind: "new", label: "New", value: "true" });
  }

  if (filters.sortOrder !== DEFAULT_FILTERS.sortOrder) {
    items.push({
      id: `sort:${filters.sortOrder}`,
      kind: "sort",
      label: filters.sortOrder,
      value: filters.sortOrder,
      resetValue: DEFAULT_FILTERS.sortOrder,
    });
  }

  return items;
}

export function getActiveFiltersCount(
  filters: OpportunityFiltersState,
  forcedRepository: string | null,
  forcedAuthor: string | null,
) {
  return getActiveOpportunityFilters(
    filters,
    forcedRepository,
    forcedAuthor,
  ).length;
}

export function removeActiveOpportunityFilter(
  item: ActiveOpportunityFilter,
  filters: OpportunityFiltersState,
  onFieldChange: OnFilterFieldChange,
) {
  switch (item.kind) {
    case "search":
      onFieldChange("searchText", "");
      return;
    case "repository":
      onFieldChange("repository", item.resetValue ?? ALL_FILTER_VALUE);
      return;
    case "region":
      onFieldChange("region", item.resetValue ?? ALL_FILTER_VALUE);
      return;
    case "country":
      onFieldChange("country", item.resetValue ?? DEFAULT_FILTERS.country);
      return;
    case "stack":
    case "advanced-tag":
      onFieldChange("tags", filters.tags.filter((tag) => tag !== item.value));
      return;
    case "author":
      onFieldChange(
        "authors",
        filters.authors.filter((author) => author !== item.value),
      );
      return;
    case "sort":
      onFieldChange(
        "sortOrder",
        (item.resetValue ?? OpportunitySortOrder.Recent) as OpportunitySortOrder,
      );
      return;
    case "work-model":
      onFieldChange("workModels", filters.workModels.filter((value) => value !== item.value));
      return;
    case "area":
      onFieldChange("areas", filters.areas.filter((value) => value !== item.value));
      return;
    case "technology":
      onFieldChange("technologies", filters.technologies.filter((value) => value !== item.value));
      return;
    case "technology-match":
      onFieldChange("technologyMatch", DEFAULT_FILTERS.technologyMatch);
      return;
    case "seniority":
      onFieldChange("seniority", filters.seniority.filter((value) => value !== item.value));
      return;
    case "employment":
      onFieldChange("employmentTypes", filters.employmentTypes.filter((value) => value !== item.value));
      return;
    case "language":
      onFieldChange("languages", filters.languages.filter((value) => value !== item.value));
      return;
    case "freshness":
      onFieldChange("freshnessDays", ALL_FILTER_VALUE);
      return;
    case "salary":
      onFieldChange("salaryOnly", false);
      return;
    case "saved":
      onFieldChange("savedOnly", false);
      return;
    case "new":
      onFieldChange("newOnly", false);
  }
}
