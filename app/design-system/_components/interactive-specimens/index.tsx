"use client";

import * as React from "react";
import { LoaderCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { OpportunitiesFilters } from "@/app/opportunities/_components/opportunities-screen/opportunities-filters";
import { ADVANCED_FILTERS_DIALOG_ID } from "@/app/opportunities/_components/opportunities-screen/opportunities-filters/constants";
import { EmptyState } from "@/app/opportunities/_components/opportunities-screen/opportunities-list/empty-state";
import { OpportunityCard } from "@/app/opportunities/_components/opportunities-screen/opportunity-card";
import { getOpportunityDetailsElementIds } from "@/app/opportunities/_components/opportunities-screen/opportunity-card/trigger-contract";
import { OpportunityDrawer } from "@/app/opportunities/_components/opportunities-screen/opportunity-drawer";
import {
  OpportunityIssueState,
  OpportunitySortOrder,
  OpportunitySourceType,
  TechnologyMatchMode,
  OpportunityViewMode,
  type OnFilterFieldChange,
  type OpportunityFilterOptions,
  type OpportunityFiltersState,
  type OpportunityItem,
} from "@/app/opportunities/_components/opportunities-screen/types";
import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SelectContent } from "@/components/ui/select/select-content";
import { SelectItem } from "@/components/ui/select/select-item";
import { SelectTrigger } from "@/components/ui/select/select-trigger";
import { SelectValue } from "@/components/ui/select/select-value";

const DEFAULT_FILTERS: OpportunityFiltersState = Object.freeze({
  repository: "all",
  region: "all",
  country: "all",
  tags: [],
  authors: [],
  workModels: [],
  areas: [],
  technologies: [],
  technologyMatch: TechnologyMatchMode.Any,
  seniority: [],
  employmentTypes: [],
  languages: [],
  freshnessDays: "all",
  salaryOnly: false,
  savedOnly: false,
  newOnly: false,
  searchText: "",
  sortOrder: OpportunitySortOrder.Recent,
  itemsPerPage: 12,
  viewMode: OpportunityViewMode.List,
  page: 1,
});

enum LoadingSpecimenState {
  Idle = "idle",
  Loading = "loading",
  Complete = "complete",
}

const SPECIMEN_OPPORTUNITY: Omit<OpportunityItem, "region" | "country"> = Object.freeze({
  id: "design-system-specimen",
  sourceId: "DS-01",
  title: "Senior frontend platform engineer for a distributed product team with a deliberately long title",
  description: "",
  excerpt: "",
  issueState: OpportunityIssueState.Open,
  repository: "openings-dev/web",
  repositoryUrl: "https://github.com/openings-dev/web",
  tags: ["TypeScript", "React"],
  author: {
    id: "specimen-author",
    name: "specimen-author",
    handle: "specimen-author",
    avatarUrl: "",
  },
  community: {
    id: "specimen-community",
    name: "openings.dev/specimen",
    avatarUrl: "/light-mode-favicon.svg",
    repository: "openings-dev/web",
    url: "https://github.com/openings-dev/web",
  },
  createdAt: "2026-08-12T12:00:00.000Z",
  updatedAt: "2026-08-15T12:00:00.000Z",
  url: "https://github.com/openings-dev/web",
  sourceType: OpportunitySourceType.GithubIssue,
});

export function InteractiveSpecimens(): React.ReactNode {
  const { messages } = useI18n();
  const copy = messages.designSystem;
  const [selectedValue, setSelectedValue] = React.useState("");
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<OpportunityFiltersState>(DEFAULT_FILTERS);
  const [loadingState, setLoadingState] = React.useState(LoadingSpecimenState.Idle);
  const loadingTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const localizedFilterOptions = React.useMemo<OpportunityFilterOptions>(() => ({
    repositories: [{ value: "openings-dev/web", label: "openings-dev/web", count: 24 }],
    regions: [{ value: "Latin America", label: copy.specimens.values.region, count: 18 }],
    countries: [{ value: "Brazil", label: copy.specimens.values.country, count: 12 }],
    tags: [
      { value: "Remote", label: copy.specimens.values.remote, count: 20 },
      { value: "TypeScript", label: "TypeScript", count: 14 },
      { value: "Senior", label: copy.specimens.values.seniority, count: 9 },
    ],
    tagCategories: {
      workModel: [{ value: "Remote", label: copy.specimens.values.remote, count: 20 }],
      stack: [{ value: "TypeScript", label: "TypeScript", count: 14 }],
      seniority: [{ value: "Senior", label: copy.specimens.values.seniority, count: 9 }],
      other: [{ value: "Open source", label: messages.footer.groups.openSource, count: 5 }],
    },
    authors: [{ value: "specimen-author", label: "specimen-author", count: 8 }],
    workModels: [{ value: "remote", label: copy.specimens.values.remote, count: 20 }],
    areas: [],
    technologies: [{ value: "typescript", label: "TypeScript", count: 14 }],
    seniority: [{ value: "senior", label: copy.specimens.values.seniority, count: 9 }],
    employmentTypes: [],
    languages: [],
  }), [copy.specimens.values, messages.footer.groups.openSource]);
  const localizedOpportunity = React.useMemo<OpportunityItem>(() => ({
    ...SPECIMEN_OPPORTUNITY,
    title: messages.designSystem.specimens.longOpportunityTitle,
    excerpt: messages.opportunities.header.description,
    description: `## ${messages.opportunities.card.detailsTitle}\n\n${messages.designSystem.guidance.productPatterns}`,
    region: "",
    country: "",
    companyName: copy.specimens.values.company,
    tags: [
      copy.specimens.values.remote,
      "TypeScript",
      "React",
      copy.specimens.values.seniority,
      messages.designSystem.title,
    ],
  }), [copy.specimens.values, messages]);
  const opportunityDetailsElementIds = getOpportunityDetailsElementIds(
    localizedOpportunity.id,
  );

  React.useEffect(() => () => {
    if (loadingTimer.current) clearTimeout(loadingTimer.current);
  }, []);

  const handleFieldChange = React.useCallback<OnFilterFieldChange>((field, value) => {
    setFilters((current) => ({ ...current, [field]: value, page: 1 }));
  }, []);
  const toggleTag = React.useCallback((tag: string) => {
    setFilters((current) => ({
      ...current,
      tags: current.tags.includes(tag)
        ? current.tags.filter((value) => value !== tag)
        : [...current.tags, tag],
      page: 1,
    }));
  }, []);
  const toggleAuthor = React.useCallback((author: string) => {
    setFilters((current) => ({
      ...current,
      authors: current.authors.includes(author)
        ? current.authors.filter((value) => value !== author)
        : [...current.authors, author],
      page: 1,
    }));
  }, []);

  const demonstrateLoading = React.useCallback(() => {
    if (loadingTimer.current) clearTimeout(loadingTimer.current);
    setLoadingState(LoadingSpecimenState.Loading);
    loadingTimer.current = setTimeout(() => {
      setLoadingState(LoadingSpecimenState.Complete);
      loadingTimer.current = null;
    }, 1200);
  }, []);

  const activeFilterCount = Number(filters.repository !== "all") +
    Number(filters.region !== "all") + filters.tags.length + filters.authors.length +
    Number(filters.sortOrder !== OpportunitySortOrder.Recent) +
    Number(filters.itemsPerPage !== DEFAULT_FILTERS.itemsPerPage);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-card border border-line bg-surface p-5 sm:p-6">
          <Field label={copy.interactive.selectLabel} hint={copy.interactive.selectHint}>
            {(fieldProps) => (
              <Select value={selectedValue} onValueChange={setSelectedValue}>
                <SelectTrigger {...fieldProps}>
                  <SelectValue placeholder={copy.interactive.selectPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">{copy.interactive.selectOption}</SelectItem>
                </SelectContent>
              </Select>
            )}
          </Field>
        </div>
        <div className="rounded-card border border-line bg-surface p-5 sm:p-6">
          <Field label={copy.interactive.invalidLabel} error={copy.interactive.invalidError}>
            <Input leadingVisual={<Search />} defaultValue="invalid@" aria-invalid="true" />
          </Field>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 rounded-card border border-line bg-surface p-5 sm:p-6">
        <Button type="button" onClick={() => toast.success(copy.interactive.toastTitle, { description: copy.interactive.toastDescription })}>
          {copy.actions.showToast}
        </Button>
        <Button
          type="button"
          variant="secondary"
          aria-expanded={filtersOpen}
          aria-controls={ADVANCED_FILTERS_DIALOG_ID}
          aria-haspopup="dialog"
          onClick={() => setFiltersOpen(true)}
        >
          {copy.actions.openFilters}
        </Button>
        <Button
          type="button"
          variant="outline"
          data-opportunity-trigger={localizedOpportunity.id}
          aria-expanded={detailsOpen}
          aria-controls={opportunityDetailsElementIds.dialog}
          onClick={() => setDetailsOpen(true)}
        >
          {copy.actions.openDetails}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={loadingState === LoadingSpecimenState.Loading}
          aria-busy={loadingState === LoadingSpecimenState.Loading}
          onClick={demonstrateLoading}
        >
          {loadingState === LoadingSpecimenState.Loading ? (
            <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
          ) : null}
          {loadingState === LoadingSpecimenState.Loading
            ? copy.labels.loadingState
            : copy.actions.demonstrateLoading}
        </Button>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {loadingState === LoadingSpecimenState.Idle
            ? ""
            : loadingState === LoadingSpecimenState.Loading
              ? copy.labels.loadingState
              : copy.interactive.loadingComplete}
        </p>
        <ul className="basis-full space-y-1 border-t border-line pt-4 text-xs leading-5 text-muted-foreground">
          {Object.values(copy.specimens.controlGuidance).map((guidance) => (
            <li key={guidance}>{guidance}</li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold text-warning-foreground">{copy.labels.representativeData}</p>
        <OpportunityCard
          item={localizedOpportunity}
          viewMode={OpportunityViewMode.List}
          isSelected={detailsOpen}
          onSelectOpportunity={() => {
            setDetailsOpen(true);
          }}
          onCommunitySelect={(repository) => {
            setFilters((current) => ({ ...current, repository, page: 1 }));
            setFiltersOpen(true);
          }}
          onAuthorSelect={(author) => {
            setFilters((current) => ({ ...current, authors: [author], page: 1 }));
            setFiltersOpen(true);
          }}
          hideCommunityIdentity={false}
          hideAuthorIdentity={false}
          savedIds={new Set()}
          comparisonIds={new Set()}
          previousVisitAt={null}
          viewedIds={new Set()}
          onToggleSaved={() => undefined}
          onToggleComparison={() => undefined}
        />
      </div>

      <div className="rounded-card border border-line bg-surface">
        <div aria-labelledby="remote-error-specimen-label" className="m-4 rounded-control border border-destructive-soft-foreground/25 bg-destructive-soft p-4 text-sm text-destructive-soft-foreground">
          <strong id="remote-error-specimen-label" className="font-semibold">{copy.labels.destructiveState}</strong>
          <p className="mt-1 leading-6">{messages.opportunities.feedback.loadError}</p>
        </div>
        <EmptyState
          hasActiveFilters
          noMatchesTitle={copy.specimens.emptyTitle}
          noResultsTitle={copy.specimens.emptyTitle}
          noMatchesDescription={copy.specimens.emptyDescription}
          noResultsDescription={copy.specimens.emptyDescription}
          clearFiltersLabel={copy.specimens.clearSpecimenFilters}
          onClearFilters={() => setFilters(DEFAULT_FILTERS)}
        />
      </div>

      <OpportunitiesFilters
        state={filters}
        options={localizedFilterOptions}
        open={filtersOpen}
        resultCount={24}
        activeFiltersCount={activeFilterCount}
        onOpenChange={setFiltersOpen}
        onFieldChange={handleFieldChange}
        onToggleTag={toggleTag}
        onToggleAuthor={toggleAuthor}
        onClearFilters={() => setFilters(DEFAULT_FILTERS)}
      />

      <div>
        <OpportunityDrawer
          item={localizedOpportunity}
          open={detailsOpen}
          hideCommunityIdentity={false}
          hideAuthorIdentity={false}
          onClose={() => setDetailsOpen(false)}
          onCommunitySelect={(repository) => {
            setFilters((current) => ({ ...current, repository, page: 1 }));
            setDetailsOpen(false);
            setFiltersOpen(true);
          }}
          onAuthorSelect={(author) => {
            setFilters((current) => ({ ...current, authors: [author], page: 1 }));
            setDetailsOpen(false);
            setFiltersOpen(true);
          }}
          specimenMode
        />
      </div>
    </div>
  );
}
