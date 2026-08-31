import {
  OpportunityIssueState,
  type OpportunityFiltersState,
  type OpportunityItem,
} from "@/app/opportunities/_components/opportunities-screen/types";
import { normalizeOpportunitySearchText } from "@/lib/opportunities/index-operations";
import { compareOpportunities } from "@/lib/opportunities/sort-opportunities";
import { canonicalTagValue } from "./tag-normalization";

export function matchesSearch(opportunity: OpportunityItem, searchText: string) {
  if (!searchText.trim()) return true;
  const query = normalizeOpportunitySearchText(searchText);
  const searchableText = [
    opportunity.title,
    opportunity.excerpt,
    opportunity.description,
    opportunity.repository,
    opportunity.country,
    opportunity.region,
    opportunity.companyName,
    opportunity.author.name,
    opportunity.author.handle,
    opportunity.tags.join(" "),
  ]
    .filter(Boolean)
    .join(" ");
  const normalizedSearchableText = normalizeOpportunitySearchText(searchableText);
  return normalizedSearchableText.includes(query);
}

export function getFilteredOpportunities(
  opportunities: OpportunityItem[],
  filters: OpportunityFiltersState,
) {
  const selectedTagKeys = filters.tags.length > 0
    ? new Set(filters.tags.map((tag) => canonicalTagValue(tag)).filter(Boolean))
    : null;

  return opportunities
    .filter((opportunity) => {
      if (opportunity.issueState !== OpportunityIssueState.Open) return false;
      const matchesRepository =
        filters.repository === "all" || opportunity.repository === filters.repository;
      const matchesRegion = filters.region === "all" || opportunity.region === filters.region;
      const matchesCountry = filters.country === "all" || opportunity.country === filters.country;
      const matchesTags =
        !selectedTagKeys ||
        opportunity.tags.some((tag) => selectedTagKeys.has(canonicalTagValue(tag)));
      const matchesAuthors =
        filters.authors.length === 0 || filters.authors.includes(opportunity.author.handle);
      return (
        matchesRepository &&
        matchesRegion &&
        matchesCountry &&
        matchesTags &&
        matchesAuthors &&
        matchesSearch(opportunity, filters.searchText)
      );
    })
    .sort((left, right) =>
      compareOpportunities(left, right, filters.sortOrder)
    );
}

export function dedupeOpportunities(items: OpportunityItem[]) {
  const byId = new Map<string, OpportunityItem>();
  for (const item of items) byId.set(item.id, item);
  return [...byId.values()];
}
