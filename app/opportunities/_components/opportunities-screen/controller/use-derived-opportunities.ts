import * as React from "react";
import { buildFilterOptions } from "./build-filter-options";
import { getActiveFiltersCount } from "./active-filters";
import { buildRangeLabel } from "./range-label";
import { getFilteredOpportunities } from "./filtering";
import { normalizeFilters } from "./normalize-filters";
import type { RepositoryFilterRegistry } from "./repository-filter-registry";
import {
  OpportunityIssueState,
  type OpportunityFilterFacets,
  type OpportunityFiltersState,
  type OpportunityItem,
} from "@/app/opportunities/_components/opportunities-screen/types";

interface UseDerivedOpportunitiesParams {
  opportunities: OpportunityItem[];
  facetCounts: OpportunityFilterFacets | null;
  filters: OpportunityFiltersState;
  selectedOpportunityId: string | null;
  forcedRepository: string | null;
  forcedAuthor: string | null;
  registry: RepositoryFilterRegistry | null;
  remoteFilteredCount: number | null;
  locale: string;
  rangeMessages: { zeroResults: string; rangeOfTotal: string };
  savedIds: ReadonlySet<string>;
  viewedIds: ReadonlySet<string>;
  previousVisitAt: string | null;
}

export function useDerivedOpportunities(params: UseDerivedOpportunitiesParams) {
  const openOpportunities = React.useMemo(
    () => params.opportunities.filter((item) => item.issueState === OpportunityIssueState.Open),
    [params.opportunities],
  );
  const options = React.useMemo(
    () => buildFilterOptions(openOpportunities, params.facetCounts, params.locale),
    [openOpportunities, params.facetCounts, params.locale],
  );
  const normalizedFilters = React.useMemo(
    () =>
      normalizeFilters(
        params.filters,
        params.forcedRepository,
        params.forcedAuthor,
        params.registry,
      ),
    [params.filters, params.forcedAuthor, params.forcedRepository, params.registry],
  );
  const filteredOpportunities = React.useMemo(
    () => getFilteredOpportunities(params.opportunities, normalizedFilters, {
      savedIds: params.savedIds,
      viewedIds: params.viewedIds,
      previousVisitAt: params.previousVisitAt,
    }),
    [normalizedFilters, params.opportunities, params.previousVisitAt, params.savedIds, params.viewedIds],
  );
  const loadedCount = filteredOpportunities.length;
  const totalCount = params.remoteFilteredCount ?? loadedCount;
  const totalPages = Math.max(1, Math.ceil(totalCount / normalizedFilters.itemsPerPage));
  const currentPage = Math.min(normalizedFilters.page, totalPages);
  const visibleOpportunities = React.useMemo(() => {
    const end = currentPage * normalizedFilters.itemsPerPage;
    return filteredOpportunities.slice(0, end);
  }, [currentPage, filteredOpportunities, normalizedFilters.itemsPerPage]);
  const selectedOpportunity = React.useMemo(
    () => filteredOpportunities.find((item) => item.id === params.selectedOpportunityId) ?? null,
    [filteredOpportunities, params.selectedOpportunityId],
  );
  const rangeLabel = React.useMemo(
    () =>
      buildRangeLabel({
        totalCount,
        visibleCount: visibleOpportunities.length,
        locale: params.locale,
        zeroResultsLabel: params.rangeMessages.zeroResults,
        rangeTemplate: params.rangeMessages.rangeOfTotal,
      }),
    [
      visibleOpportunities.length,
      params.locale,
      params.rangeMessages.rangeOfTotal,
      params.rangeMessages.zeroResults,
      totalCount,
    ],
  );
  const activeFiltersCount = React.useMemo(
    () =>
      getActiveFiltersCount(
        normalizedFilters,
        params.forcedRepository,
        params.forcedAuthor,
      ),
    [normalizedFilters, params.forcedAuthor, params.forcedRepository],
  );

  return {
    options,
    normalizedFilters,
    filteredOpportunities,
    visibleOpportunities,
    selectedOpportunity,
    activeFiltersCount,
    loadedCount,
    totalCount,
    totalPages,
    currentPage,
    hasActiveFilters: activeFiltersCount > 0,
    isDetailsOpen: Boolean(selectedOpportunity),
    rangeLabel,
  };
}
