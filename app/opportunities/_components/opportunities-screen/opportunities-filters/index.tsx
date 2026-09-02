"use client";

import * as React from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import { formatTemplate } from "@/lib/utils/format-template";
import type { OpportunitiesFiltersProps } from "@/app/opportunities/_components/opportunities-screen/types";
import { ADVANCED_FILTERS_DIALOG_ID } from "./constants";
import { FilterFields } from "./filter-fields";
import { DiscoveryShortcuts } from "../opportunities-quick-filters/discovery-shortcuts";

export function OpportunitiesFilters(props: OpportunitiesFiltersProps): React.ReactNode {
  const { locale, messages } = useI18n();
  const filterMessages = messages.opportunities.filters;
  const {
    open,
    resultCount,
    isLoading = false,
    hasLoadError = false,
    hasLoadMoreError = false,
    activeFiltersCount,
    onOpenChange,
    onToggleTag,
    onToggleAuthor,
    onClearFilters,
  } = props;
  const [dialogElement, setDialogElement] = React.useState<HTMLDialogElement | null>(null);
  const [resetAnnouncement, setResetAnnouncement] = React.useState("");

  React.useEffect(() => {
    const dialog = dialogElement;
    if (!dialog) return;

    if (!open) {
      if (dialog.open) dialog.close();
      return;
    }

    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const documentElementOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();

    const frameId = window.requestAnimationFrame(() => {
      dialog.querySelector<HTMLElement>("[data-advanced-filters-close]")?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      if (dialog.open) dialog.close();
      document.documentElement.style.overflow = documentElementOverflow;
      document.body.style.overflow = bodyOverflow;
      previouslyFocused?.focus();
    };
  }, [dialogElement, open]);

  return (
    <dialog
      id={ADVANCED_FILTERS_DIALOG_ID}
      ref={setDialogElement}
      aria-labelledby="advanced-filters-title"
      className="m-auto w-[min(60rem,calc(100%-2rem))] overflow-visible bg-transparent p-0 text-foreground backdrop:bg-overlay backdrop:backdrop-blur-[2px] max-sm:w-[calc(100%-1rem)]"
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClose={() => onOpenChange(false)}
      onClick={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-floating border border-line bg-surface-elevated shadow-floating-lg max-sm:h-[calc(100dvh-1rem)] max-sm:max-h-none">
        <header className="flex items-start justify-between gap-6 border-b border-line bg-surface-elevated px-5 py-4 sm:px-7 sm:py-5">
          <div>
            <div className="mb-2 flex items-center gap-2 text-label font-medium text-primary-deep">
              <SlidersHorizontal className="size-4" aria-hidden="true" />
              {filterMessages.ariaLabel}
            </div>
            <h2 id="advanced-filters-title" className="font-display text-product-title font-semibold tracking-[-0.03em]">
              {filterMessages.title}
            </h2>
          </div>
          <Button data-advanced-filters-close type="button" variant="outline" size="icon" aria-label={filterMessages.hide} onClick={() => onOpenChange(false)}>
            <X className="size-5" aria-hidden="true" />
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <div className="mb-5 md:hidden">
            <DiscoveryShortcuts
              filters={props.state}
              onFieldChange={props.onFieldChange}
              curatedLinks={false}
              variant="modal"
            />
          </div>
          <FilterFields
            {...props}
            locale={locale}
            portalContainer={dialogElement}
            labels={{
              locationSectionLabel: filterMessages.locationSectionLabel,
              scopeSectionLabel: filterMessages.repositorySectionLabel,
              taxonomySectionLabel: filterMessages.tagsLabel,
              displaySectionLabel: filterMessages.sortLabel,
              repositoryLabel: filterMessages.repositoryLabel,
              repositoryPlaceholder: filterMessages.repositoryPlaceholder,
              allRepositories: filterMessages.allRepositories,
              regionLabel: filterMessages.regionLabel,
              regionPlaceholder: filterMessages.regionPlaceholder,
              allRegions: filterMessages.allRegions,
              workModeLabel: filterMessages.workModeLabel,
              workModePlaceholder: filterMessages.workModePlaceholder,
              seniorityLabel: filterMessages.seniorityLabel,
              seniorityPlaceholder: filterMessages.seniorityPlaceholder,
              employmentLabel: filterMessages.employmentLabel,
              employmentPlaceholder: filterMessages.employmentPlaceholder,
              technologyLabel: filterMessages.stackLabel,
              technologyPlaceholder: filterMessages.stackPlaceholder,
              technologyMatchLabel: filterMessages.technologyMatchLabel,
              technologyMatchAny: filterMessages.technologyMatchAny,
              technologyMatchAll: filterMessages.technologyMatchAll,
              languageLabel: filterMessages.languageLabel,
              languagePlaceholder: filterMessages.languagePlaceholder,
              otherTagsLabel: filterMessages.otherTagsLabel,
              otherTagsPlaceholder: filterMessages.otherTagsPlaceholder,
              noTagsSelected: filterMessages.noTagsSelected,
              authorLabel: filterMessages.authorLabel,
              authorPlaceholder: filterMessages.authorPlaceholder,
              noAuthorsSelected: filterMessages.noAuthorsSelected,
              removeFilter: filterMessages.removeFilter,
              sortLabel: filterMessages.sortLabel,
              sortPlaceholder: filterMessages.sortPlaceholder,
              sortRecent: filterMessages.sortRecent,
              sortOldest: filterMessages.sortOldest,
              sortRelevance: filterMessages.sortRelevance,
              sortUpdated: filterMessages.sortUpdated,
              sortSalary: filterMessages.sortSalary,
            }}
            onTagSelected={onToggleTag}
            onAuthorSelected={onToggleAuthor}
          />
        </div>

        <footer className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-line bg-surface-elevated/95 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onClearFilters({ announce: false });
              setResetAnnouncement(messages.opportunities.feedback.filtersReset);
            }}
            disabled={activeFiltersCount === 0}
          >
            {filterMessages.reset}
          </Button>
          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {resetAnnouncement}
          </p>
          {isLoading || hasLoadError || hasLoadMoreError ? (
            <div className="flex max-w-md flex-col items-stretch gap-3 sm:items-end">
              <p
                role={isLoading ? "status" : "alert"}
                aria-atomic="true"
                className="text-sm font-medium text-muted-foreground sm:text-right"
              >
                {isLoading
                  ? messages.opportunities.toolbar.loading
                  : hasLoadMoreError
                    ? messages.opportunities.feedback.partialLoadError
                    : messages.opportunities.feedback.loadError}
              </p>
              {!isLoading ? (
                <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                  {filterMessages.hide}
                </Button>
              ) : null}
            </div>
          ) : (
            <Button type="button" onClick={() => onOpenChange(false)}>
              {formatTemplate(resultCount === 1
                ? filterMessages.showResultOne
                : filterMessages.showResults, {
                count: resultCount.toLocaleString(locale),
              })}
            </Button>
          )}
        </footer>
      </div>
    </dialog>
  );
}
