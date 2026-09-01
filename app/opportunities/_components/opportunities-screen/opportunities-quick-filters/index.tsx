"use client";

import * as React from "react";
import { LockKeyhole, Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SelectContent } from "@/components/ui/select/select-content";
import { SelectItem } from "@/components/ui/select/select-item";
import { SelectTrigger } from "@/components/ui/select/select-trigger";
import { SelectValue } from "@/components/ui/select/select-value";
import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import {
  getActiveOpportunityFilters,
  removeActiveOpportunityFilter,
} from "@/app/opportunities/_components/opportunities-screen/controller/active-filters";
import { ShareableProfileKind } from "@/app/opportunities/_components/opportunities-screen/types";
import type {
  ActiveOpportunityFilter,
  FilterOption,
  OpportunitiesQuickFiltersProps,
} from "@/app/opportunities/_components/opportunities-screen/types";
import { formatTemplate } from "@/lib/utils/format-template";
import { ActiveFilterList } from "./active-filter-list";
import { StackMultiSelect } from "./stack-multi-select";
import { ADVANCED_FILTERS_DIALOG_ID } from "@/app/opportunities/_components/opportunities-screen/opportunities-filters/constants";
import { DiscoveryShortcuts } from "./discovery-shortcuts";

interface QuickSelectProps {
  locale: string;
  value?: string;
  placeholder: string;
  allLabel?: string;
  options: FilterOption[];
  disabled?: boolean;
  triggerProps?: Omit<
    React.ComponentProps<typeof SelectTrigger>,
    "children" | "className"
  >;
  onValueChange: (value: string) => void;
}

function QuickSelect({
  locale,
  value,
  placeholder,
  allLabel,
  options,
  disabled,
  triggerProps,
  onValueChange,
}: QuickSelectProps): React.ReactNode {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger {...triggerProps}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allLabel ? <SelectItem value="all">{allLabel}</SelectItem> : null}
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label} ({option.count.toLocaleString(locale)})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function OpportunitiesQuickFilters({
  filters,
  options,
  activeFiltersCount,
  advancedFiltersOpen,
  onOpenAdvancedFilters,
  onFieldChange,
  onSearchSubmitted,
  onClearFilters,
  forcedScope,
}: OpportunitiesQuickFiltersProps): React.ReactNode {
  const { locale, messages } = useI18n();
  const filterMessages = messages.opportunities.filters;
  const forcedScopeLabel = forcedScope
    ? formatTemplate(
        forcedScope.kind === ShareableProfileKind.Community
          ? messages.profiles.workspaceCommunityScope
          : messages.profiles.workspacePublisherScope,
        { identity: forcedScope.identity },
      )
    : null;
  const selectedStacks = React.useMemo(
    () =>
      filters.technologies,
    [filters.technologies],
  );
  const activeItems = React.useMemo<ActiveOpportunityFilter[]>(() => {
    const forcedRepository = forcedScope?.kind === ShareableProfileKind.Community
      ? forcedScope.identity
      : null;
    const forcedAuthor = forcedScope?.kind === ShareableProfileKind.Publisher
      ? forcedScope.identity.replace(/^@/, "")
      : null;

    return getActiveOpportunityFilters(
      filters,
      forcedRepository,
      forcedAuthor,
    ).map((item) => {
      switch (item.kind) {
        case "search":
          return item;
        case "repository":
          return {
            ...item,
            label: options.repositories.find((option) => option.value === item.value)?.label ?? item.label,
          };
        case "region":
          return {
            ...item,
            label: options.regions.find((option) => option.value === item.value)?.label ?? item.label,
          };
        case "country":
          return {
            ...item,
            label: item.value === "all"
              ? filterMessages.allCountries
              : options.countries.find((option) => option.value === item.value)?.label ?? item.label,
          };
        case "stack":
        case "advanced-tag":
          return {
            ...item,
            label: options.tags.find((option) => option.value === item.value)?.label ?? item.label,
          };
        case "author":
          return {
            ...item,
            label: options.authors.find((option) => option.value === item.value)?.label ?? `@${item.label}`,
          };
        case "sort":
          return {
            ...item,
            label: {
              relevance: filterMessages.sortRelevance,
              recent: filterMessages.sortRecent,
              oldest: filterMessages.sortOldest,
              updated: filterMessages.sortUpdated,
              salary: filterMessages.sortSalary,
            }[item.value] ?? item.label,
          };
        case "work-model":
        case "area":
        case "technology":
        case "technology-match":
        case "seniority":
        case "employment":
        case "language":
        case "freshness":
        case "salary":
        case "saved":
        case "new":
          return item;
      }
    });
  }, [filterMessages.allCountries, filterMessages.sortOldest, filterMessages.sortRecent, filterMessages.sortRelevance, filterMessages.sortSalary, filterMessages.sortUpdated, filters, forcedScope, options.authors, options.countries, options.regions, options.repositories, options.tags]);

  const handleStackChange = React.useCallback(
    (values: string[]) => {
      onFieldChange("technologies", values);
    },
    [onFieldChange],
  );

  const handleRemoveFilter = React.useCallback(
    (item: ActiveOpportunityFilter) => {
      removeActiveOpportunityFilter(item, filters, onFieldChange);
    },
    [filters, onFieldChange],
  );

  return (
    <section
      id="opportunity-results"
      className="scroll-mt-20 border-y border-line py-4"
      aria-label={filterMessages.ariaLabel}
    >
      {forcedScopeLabel ? (
        <div className="mb-3 flex min-w-0 items-center">
          <Badge tone="primary" className="max-w-full">
            <LockKeyhole aria-hidden="true" />
            {forcedScopeLabel}
          </Badge>
        </div>
      ) : null}
      <div className="grid min-w-0 grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-[minmax(18rem,1.6fr)_minmax(10rem,0.8fr)_minmax(10rem,0.8fr)_auto] xl:items-end">
        <Field
          label={filterMessages.searchLabel}
          controlId="opportunity-quick-search"
          className="col-span-2 xl:col-span-1"
        >
          <Input
            type="search"
            value={filters.searchText}
            onChange={(event) => onFieldChange("searchText", event.target.value)}
            onBlur={(event) => onSearchSubmitted(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onSearchSubmitted(event.currentTarget.value);
            }}
            placeholder={filterMessages.searchPlaceholder}
            leadingVisual={<Search />}
          />
        </Field>

        <Field
          label={filterMessages.countryLabel}
          controlId="opportunity-quick-country"
          className="col-span-1 min-w-0 md:col-span-2 xl:col-span-1"
        >
          {(controlProps) => (
            <QuickSelect
              locale={locale}
              triggerProps={controlProps}
              placeholder={filterMessages.countryPlaceholder}
              allLabel={filterMessages.allCountries}
              value={filters.country}
              options={options.countries}
              onValueChange={(value) => onFieldChange("country", value)}
            />
          )}
        </Field>

        <Field
          label={filterMessages.stackLabel}
          controlId="opportunity-quick-stack"
          className="col-span-1 min-w-0 md:col-span-2 xl:col-span-1"
        >
          {(controlProps) => (
            <StackMultiSelect
              applyLabel={filterMessages.applyStack}
              clearLabel={filterMessages.clearStack}
              locale={locale}
              triggerId={controlProps.id ?? "opportunity-quick-stack"}
              placeholder={filterMessages.stackPlaceholder}
              selectedCountLabel={formatTemplate(filterMessages.stackSelectedCount, {
                count: selectedStacks.length.toLocaleString(locale),
              })}
              selectedValues={selectedStacks}
              options={options.technologies}
              disabled={options.technologies.length === 0}
              onApply={handleStackChange}
            />
          )}
        </Field>

        <Button
          id="opportunity-advanced-filters-trigger"
          type="button"
          variant="secondary"
          className="col-span-2 w-full justify-center px-4 md:col-span-2 xl:col-span-1 xl:w-auto xl:min-w-44"
          aria-expanded={advancedFiltersOpen}
          aria-controls={ADVANCED_FILTERS_DIALOG_ID}
          aria-haspopup="dialog"
          onClick={onOpenAdvancedFilters}
        >
          <SlidersHorizontal aria-hidden="true" />
          {filterMessages.show}
          {activeFiltersCount > 0 ? (
            <Badge tone="primary" size="compact">
              {activeFiltersCount}
            </Badge>
          ) : null}
        </Button>
      </div>

      <DiscoveryShortcuts
        filters={filters}
        onFieldChange={onFieldChange}
        curatedLinks={!forcedScope}
      />

      {activeFiltersCount > 0 ? (
        <ActiveFilterList
          items={activeItems}
          clearAllLabel={filterMessages.reset}
          removeFilterLabel={filterMessages.removeFilter}
          onRemove={handleRemoveFilter}
          onClearAll={onClearFilters}
          fallbackFocusId="opportunity-advanced-filters-trigger"
        />
      ) : null}
    </section>
  );
}
