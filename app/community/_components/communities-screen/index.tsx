"use client";

import * as React from "react";

import { DirectoryDiscoveryControls } from "@/app/_components/directory/directory-discovery-controls";
import { resolveDirectoryEmptyReason } from "@/app/_components/directory/empty-reason";
import { DirectoryScreenLayout } from "@/app/_components/directory/directory-screen-layout";
import {
  filterAndSortDirectoryItems,
  filterDirectoryItemsByQuery,
} from "@/app/_components/directory/sorting";
import { DirectorySortMode } from "@/app/_components/directory/types";
import { LocationFiltersPanel } from "@/app/_components/location-filters/location-filters-panel";
import { useLocationFilters } from "@/app/_components/location-filters/use-location-filters";
import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import { normalizeDirectoryQuery } from "@/lib/opportunities/summary-helpers";
import { formatTemplate } from "@/lib/utils/format-template";
import { Button } from "@/components/ui/button";
import { CommunitiesList } from "./communities-list";
import type { CommunitiesScreenProps } from "./types";

export function CommunitiesScreen({
  communities,
  sourceUnavailable,
  status,
}: CommunitiesScreenProps): React.ReactNode {
  const { locale, messages } = useI18n();
  const copy = messages.communities;
  const [activity, setActivity] = React.useState<"active" | "no-openings" | "error" | "all">("active");
  const states = React.useMemo(() => new Map(status?.items.map((item) => [item.repository, item.state])), [status]);
  const stateFor = React.useCallback((repository: string, opportunitiesCount: number) =>
    states.get(repository) ?? (opportunitiesCount > 0 ? "healthy" : "no-openings"), [states]);
  const activeCount = communities.filter((item) => stateFor(item.repository, item.opportunitiesCount) === "healthy").length;
  const noOpeningsCount = communities.filter((item) => stateFor(item.repository, item.opportunitiesCount) === "no-openings").length;
  const errorCount = communities.filter((item) => stateFor(item.repository, item.opportunitiesCount) === "error").length;
  const directoryItems = React.useMemo(
    () => activity === "all" ? communities : communities.filter((item) => {
      const state = stateFor(item.repository, item.opportunitiesCount);
      if (activity === "active") return state === "healthy";
      return state === activity;
    }),
    [activity, communities, stateFor],
  );
  const {
    filters,
    regionOptions,
    countryOptions,
    filteredItems,
    hasActiveFilters: hasGeography,
    handleRegionChange,
    handleCountryChange,
    handleClear,
  } = useLocationFilters({ items: directoryItems });
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<DirectorySortMode>(
    DirectorySortMode.Count,
  );
  const hasQuery = normalizeDirectoryQuery(query, locale).length > 0;
  const queryMatchedCommunities = React.useMemo(
    () =>
      filterDirectoryItemsByQuery({
        items: directoryItems,
        locale,
        query,
        getSearchValues: (item) => [item.name, item.repository],
      }),
    [directoryItems, locale, query],
  );
  const visibleCommunities = React.useMemo(
    () =>
      filterAndSortDirectoryItems({
        items: filteredItems,
        locale,
        query,
        sort,
        getIdentity: (item) => item.repository,
        getSearchValues: (item) => [item.name, item.repository],
      }),
    [filteredItems, locale, query, sort],
  );
  const resultSummary =
    visibleCommunities.length === 1
      ? copy.list.summaryOne
      : formatTemplate(copy.list.summary, {
          count: visibleCommunities.length.toLocaleString(locale),
        });
  const emptyReason = resolveDirectoryEmptyReason({
    sourceUnavailable,
    sourceCount: directoryItems.length,
    visibleCount: visibleCommunities.length,
    queryMatchCount: queryMatchedCommunities.length,
    geographyMatchCount: filteredItems.length,
    hasQuery,
    hasGeography,
  });
  const handleClearAll = React.useCallback(() => {
    setQuery("");
    handleClear();
  }, [handleClear, setQuery]);

  return (
    <DirectoryScreenLayout
      kicker={copy.header.kicker}
      title={copy.header.title}
      description={copy.header.description}
      discovery={(
        <div className="space-y-3">
        <div className="flex flex-wrap gap-2" aria-label={copy.filters.activityLabel}>
          <Button type="button" size="sm" variant={activity === "active" ? "default" : "outline"} aria-pressed={activity === "active"} onClick={() => setActivity("active")}>
            {formatTemplate(copy.filters.activeOnly, { count: activeCount.toLocaleString(locale) })}
          </Button>
          <Button type="button" size="sm" variant={activity === "no-openings" ? "default" : "outline"} aria-pressed={activity === "no-openings"} onClick={() => setActivity("no-openings")}>
            {formatTemplate(copy.filters.noOpenings, { count: noOpeningsCount.toLocaleString(locale) })}
          </Button>
          <Button type="button" size="sm" variant={activity === "error" ? "default" : "outline"} aria-pressed={activity === "error"} onClick={() => setActivity("error")}>
            {formatTemplate(copy.filters.withErrors, { count: errorCount.toLocaleString(locale) })}
          </Button>
          <Button type="button" size="sm" variant={activity === "all" ? "default" : "outline"} aria-pressed={activity === "all"} onClick={() => setActivity("all")}>
            {formatTemplate(copy.filters.allSources, { count: communities.length.toLocaleString(locale) })}
          </Button>
        </div>
        <DirectoryDiscoveryControls
          query={query}
          sort={sort}
          discoveryLabel={copy.filters.discoveryLabel}
          searchLabel={copy.filters.searchLabel}
          searchPlaceholder={copy.filters.searchPlaceholder}
          sortLabel={copy.filters.sortLabel}
          sortCount={copy.filters.sortCount}
          sortRecent={copy.filters.sortRecent}
          sortName={copy.filters.sortName}
          resultSummary={sourceUnavailable ? undefined : resultSummary}
          clearLabel={copy.filters.clear}
          hasActiveFilters={hasQuery || hasGeography}
          onQueryChange={setQuery}
          onSortChange={setSort}
          onClearAll={handleClearAll}
          geography={(
            <LocationFiltersPanel
              locale={locale}
              filtersMessages={copy.filters}
              state={filters}
              regions={regionOptions}
              countries={countryOptions}
              onRegionChange={handleRegionChange}
              onCountryChange={handleCountryChange}
            />
          )}
        />
        </div>
      )}
      list={(
        <CommunitiesList
          locale={locale}
          listMessages={copy.list}
          items={visibleCommunities}
          emptyReason={emptyReason}
          onClearAll={handleClearAll}
        />
      )}
    />
  );
}
