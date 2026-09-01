import type { OpportunitySortOrder } from "@/app/opportunities/_components/opportunities-screen/types";
import { ShareableProfileKind } from "@/app/opportunities/_components/opportunities-screen/types";
import { FilterDisplayGroup } from "../filter-display-group";
import { FilterLocationGroup } from "../filter-location-group";
import { FilterScopeGroup } from "../filter-scope-group";
import { FilterTaxonomyGroup } from "../filter-taxonomy-group";
import type { FilterFieldsProps } from "./types";

export function FilterFields({
  locale,
  state,
  options,
  labels,
  portalContainer,
  onFieldChange,
  onToggleAuthor,
  onAuthorSelected,
  forcedScope,
}: FilterFieldsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 md:items-start">
      <FilterLocationGroup
        locale={locale}
        state={state}
        options={options}
        labels={{
          section: labels.locationSectionLabel,
          region: labels.regionLabel,
          regionPlaceholder: labels.regionPlaceholder,
          allRegions: labels.allRegions,
        }}
        portalContainer={portalContainer}
        onFieldChange={onFieldChange}
      />
      <FilterScopeGroup
        locale={locale}
        state={state}
        options={options}
        labels={{
          section: labels.scopeSectionLabel,
          repository: labels.repositoryLabel,
          repositoryPlaceholder: labels.repositoryPlaceholder,
          allRepositories: labels.allRepositories,
        }}
        portalContainer={portalContainer}
        locked={forcedScope?.kind === ShareableProfileKind.Community}
        onFieldChange={onFieldChange}
      />
      <FilterTaxonomyGroup
        locale={locale}
        state={state}
        options={options}
        labels={{
          section: labels.taxonomySectionLabel,
          workModeLabel: labels.workModeLabel,
          workModePlaceholder: labels.workModePlaceholder,
          seniorityLabel: labels.seniorityLabel,
          seniorityPlaceholder: labels.seniorityPlaceholder,
          employmentLabel: labels.employmentLabel,
          employmentPlaceholder: labels.employmentPlaceholder,
          technologyLabel: labels.technologyLabel,
          technologyPlaceholder: labels.technologyPlaceholder,
          technologyMatchLabel: labels.technologyMatchLabel,
          technologyMatchAny: labels.technologyMatchAny,
          technologyMatchAll: labels.technologyMatchAll,
          languageLabel: labels.languageLabel,
          languagePlaceholder: labels.languagePlaceholder,
          otherTagsLabel: labels.otherTagsLabel,
          otherTagsPlaceholder: labels.otherTagsPlaceholder,
          noTagsSelected: labels.noTagsSelected,
          authors: labels.authorLabel,
          authorPlaceholder: labels.authorPlaceholder,
          noAuthorsSelected: labels.noAuthorsSelected,
          removeFilter: labels.removeFilter,
        }}
        portalContainer={portalContainer}
        authorsLocked={forcedScope?.kind === ShareableProfileKind.Publisher}
        onAuthorSelected={onAuthorSelected}
        onToggleAuthor={onToggleAuthor}
        onFieldChange={onFieldChange}
      />
      <FilterDisplayGroup
        state={state}
        labels={{
          section: labels.displaySectionLabel,
          sort: labels.sortLabel,
          sortPlaceholder: labels.sortPlaceholder,
          sortRecent: labels.sortRecent,
          sortOldest: labels.sortOldest,
          sortRelevance: labels.sortRelevance,
          sortUpdated: labels.sortUpdated,
          sortSalary: labels.sortSalary,
        }}
        portalContainer={portalContainer}
        onSortOrderChange={(value) =>
          onFieldChange("sortOrder", value as OpportunitySortOrder)
        }
      />
    </div>
  );
}
