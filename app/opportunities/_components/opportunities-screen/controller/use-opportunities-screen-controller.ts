import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import { ALL_FILTER_VALUE, DEFAULT_FILTERS } from "./defaults";
import { buildServerFilters } from "./server-filters";
import { normalizeFilterDependencies } from "./filter-dependencies";
import { normalizeForcedAuthor } from "./normalize-forced-author";
import { useRepositoryFilterRegistry } from "./repository-filter-registry";
import { useDerivedOpportunities } from "./use-derived-opportunities";
import { useEnsurePageLoaded } from "./use-ensure-page-loaded";
import { useFiltersState } from "./use-filters-state";
import { useForcedAuthorAutoload } from "./use-forced-author-autoload";
import { useLoadMoreHandler } from "./use-load-more-handler";
import { useRemoteOpportunities } from "./use-remote-opportunities";
import { useUrlSync } from "./use-url-sync";
import {
  useSelectedOpportunity,
  useSelectedOpportunityId,
} from "./use-selected-opportunity";
import type { OpportunitiesScreenProps } from "@/app/opportunities/_components/opportunities-screen/types";
import {
  normalizeSelectedOpportunityId,
  profileScopeFromScreenProps,
} from "./profile-summary";
import { focusOpportunityResults } from "@/app/opportunities/_components/opportunities-screen/opportunity-card/trigger-contract";

export function useOpportunitiesScreenController({
  forcedRepository,
  forcedAuthor,
}: OpportunitiesScreenProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale, messages } = useI18n();
  const opportunitiesMessages = messages.opportunities;
  const normalizedForcedRepository = forcedRepository?.trim() || null;
  const normalizedForcedAuthor = normalizeForcedAuthor(forcedAuthor);
  const selectedOpportunityIdFromUrl = normalizeSelectedOpportunityId(searchParams.get("job"));
  const repositoryRegistry = useRepositoryFilterRegistry();
  const [filtersModalOpen, setFiltersModalOpen] = React.useState(false);
  const {
    filters,
    isApplyingUrlFilters,
    setFilters,
    handleFieldChange,
    handleToggleTag,
    handleToggleAuthor,
    handleClearFilters,
  } = useFiltersState({
    searchParamsValue: searchParams.toString(),
    forcedRepository: normalizedForcedRepository,
    forcedAuthor: normalizedForcedAuthor,
    registry: repositoryRegistry.registry,
    resetSuccessMessage: opportunitiesMessages.feedback.filtersReset,
  });
  const serverFilters = React.useMemo(
    () =>
      buildServerFilters(
        {
          repository: filters.repository,
          region: filters.region,
          country: filters.country,
          sortOrder: filters.sortOrder,
          searchText: filters.searchText,
          tags: filters.tags,
          authors: filters.authors,
        },
        normalizedForcedRepository,
        normalizedForcedAuthor,
        repositoryRegistry.registry,
      ),
    [
      filters.authors,
      filters.country,
      filters.region,
      filters.repository,
      filters.searchText,
      filters.sortOrder,
      filters.tags,
      normalizedForcedAuthor,
      normalizedForcedRepository,
      repositoryRegistry.registry,
    ],
  );
  const {
    selectedOpportunityId,
    isApplyingSelectedIdFromUrl,
    setSelectedOpportunityId,
  } = useSelectedOpportunityId(selectedOpportunityIdFromUrl);
  const closeSelectedOpportunity = React.useCallback(() => {
    setSelectedOpportunityId(null);

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.delete("job");
    const nextSearch = nextSearchParams.toString();

    window.history.replaceState(
      null,
      "",
      nextSearch ? `${pathname}?${nextSearch}` : pathname,
    );
  }, [pathname, searchParams, setSelectedOpportunityId]);
  const handleBeforeReload = React.useCallback(() => {
    setSelectedOpportunityId(null);
    setFilters((previous) => (previous.page === 1 ? previous : { ...previous, page: 1 }));
  }, [setFilters, setSelectedOpportunityId]);
  const remote = useRemoteOpportunities({
    serverFilters,
    enabled: !repositoryRegistry.isLoading,
    onBeforeReload: handleBeforeReload,
  });
  const derived = useDerivedOpportunities({
    opportunities: remote.opportunities,
    facetCounts: remote.facetCounts,
    filters,
    selectedOpportunityId,
    forcedRepository: normalizedForcedRepository,
    forcedAuthor: normalizedForcedAuthor,
    registry: repositoryRegistry.registry,
    remoteFilteredCount: remote.filteredCount,
    locale,
    rangeMessages: opportunitiesMessages.range,
  });
  const {
    selectedOpportunity,
    selectionStatus,
  } = useSelectedOpportunity({
    loadedOpportunity: derived.selectedOpportunity,
    selectedOpportunityId,
    forcedRepository: normalizedForcedRepository,
    forcedAuthor: normalizedForcedAuthor,
  });
  const forcedScope = React.useMemo(
    () => profileScopeFromScreenProps(
      normalizedForcedRepository,
      normalizedForcedAuthor,
    ),
    [normalizedForcedAuthor, normalizedForcedRepository],
  );
  const filtersForUrl = React.useMemo(
    () => {
      const normalized = {
        ...derived.normalizedFilters,
        page: derived.currentPage,
      };

      return {
        ...normalized,
        repository: normalizedForcedRepository
          ? DEFAULT_FILTERS.repository
          : normalized.repository,
        authors: normalizedForcedAuthor ? [] : normalized.authors,
      };
    },
    [
      derived.currentPage,
      derived.normalizedFilters,
      normalizedForcedAuthor,
      normalizedForcedRepository,
    ],
  );
  const preservedParamsForUrl = React.useMemo(
    () => ({ job: selectedOpportunityId }),
    [selectedOpportunityId],
  );
  useUrlSync({
    enabled:
      !isApplyingUrlFilters &&
      !isApplyingSelectedIdFromUrl &&
      !remote.isLoading &&
      !remote.hasLoadError,
    pathname,
    currentSearch: searchParams.toString(),
    filtersForUrl,
    preservedParams: preservedParamsForUrl,
    defaultCountry: normalizedForcedAuthor || normalizedForcedRepository
      ? ALL_FILTER_VALUE
      : DEFAULT_FILTERS.country,
  });
  const hasMore = !remote.hasLoadMoreError &&
    (derived.currentPage < derived.totalPages || remote.hasMoreRemote);
  useEnsurePageLoaded({
    currentPage: derived.currentPage,
    itemsPerPage: derived.normalizedFilters.itemsPerPage,
    loadedCount: derived.loadedCount,
    totalCount: derived.totalCount,
    isLoading: remote.isLoading,
    isFetchingMore: remote.isFetchingMore,
    hasMoreRemote: remote.hasMoreRemote,
    nextCursor: remote.nextCursor,
    loadMoreFromApi: remote.loadMoreFromApi,
  });
  const handleLoadMore = useLoadMoreHandler({
    currentPage: derived.currentPage,
    totalPages: derived.totalPages,
    loadedCount: derived.loadedCount,
    totalCount: derived.totalCount,
    itemsPerPage: derived.normalizedFilters.itemsPerPage,
    isLoading: remote.isLoading,
    isFetchingMore: remote.isFetchingMore,
    hasMoreRemote: remote.hasMoreRemote,
    nextCursor: remote.nextCursor,
    setFilters,
    loadMoreFromApi: remote.loadMoreFromApi,
  });
  useForcedAuthorAutoload({
    forcedAuthor: normalizedForcedAuthor,
    isLoading: remote.isLoading,
    isFetchingMore: remote.isFetchingMore,
    hasMoreRemote: remote.hasMoreRemote,
    nextCursor: remote.nextCursor,
    filteredCount: derived.filteredOpportunities.length,
    onLoadMore: handleLoadMore,
  });
  return {
    opportunitiesMessages,
    headerKicker: opportunitiesMessages.header.kicker,
    headerTitle: opportunitiesMessages.header.title,
    headerDescription: opportunitiesMessages.header.description,
    forcedScope,
    hideCommunityIdentity: Boolean(normalizedForcedRepository),
    hideAuthorIdentity: Boolean(normalizedForcedAuthor),
    lastUpdatedAt: remote.lastUpdatedAt ?? remote.snapshotGeneratedAt,
    filtersModalOpen,
    setFiltersModalOpen,
    handleFieldChange,
    handleToggleTag,
    handleToggleAuthor,
    handleClearFilters,
    handleLoadMore,
    hasMore,
    hasLoadMoreError: remote.hasLoadMoreError,
    selectedOpportunity,
    selectionStatus,
    isDetailsOpen: Boolean(selectedOpportunityId),
    selectedOpportunityId,
    options: derived.options,
    normalizedFilters: derived.normalizedFilters,
    rangeLabel: derived.rangeLabel,
    totalCount: derived.totalCount,
    currentPage: derived.currentPage,
    totalPages: derived.totalPages,
    activeFiltersCount: derived.activeFiltersCount,
    hasActiveFilters: derived.hasActiveFilters,
    visibleOpportunities: derived.visibleOpportunities,
    isLoading: remote.isLoading,
    hasLoadError: remote.hasLoadError,
    isFetchingMore: remote.isFetchingMore,
    setSelectedOpportunityId,
    closeSelectedOpportunity,
    onCommunitySelect: (repository: string) => {
      if (
        normalizedForcedRepository &&
        repository === normalizedForcedRepository
      ) {
        return;
      }

      closeSelectedOpportunity();
      focusOpportunityResults();
      setFilters((previous) =>
        normalizeFilterDependencies(
          {
            ...DEFAULT_FILTERS,
            repository,
            country: normalizedForcedAuthor || normalizedForcedRepository
              ? ALL_FILTER_VALUE
              : DEFAULT_FILTERS.country,
            authors: normalizedForcedAuthor ? [normalizedForcedAuthor] : [],
            viewMode: previous.viewMode,
          },
          repositoryRegistry.registry,
          {
            allowLocationWithRepository: Boolean(normalizedForcedRepository),
          },
        ),
      );
    },
    onAuthorSelect: (authorHandle: string) => {
      const normalizedAuthorHandle = normalizeForcedAuthor(authorHandle);

      if (
        normalizedForcedAuthor &&
        normalizedAuthorHandle === normalizedForcedAuthor
      ) {
        return;
      }

      closeSelectedOpportunity();
      focusOpportunityResults();
      setFilters((previous) =>
        normalizeFilterDependencies(
          {
            ...DEFAULT_FILTERS,
            repository: normalizedForcedRepository ?? DEFAULT_FILTERS.repository,
            country: normalizedForcedAuthor || normalizedForcedRepository
              ? ALL_FILTER_VALUE
              : DEFAULT_FILTERS.country,
            authors: normalizedAuthorHandle ? [normalizedAuthorHandle] : [],
            viewMode: previous.viewMode,
          },
          repositoryRegistry.registry,
          {
            allowLocationWithRepository: Boolean(normalizedForcedRepository),
          },
        ),
      );
    },
  };
}
