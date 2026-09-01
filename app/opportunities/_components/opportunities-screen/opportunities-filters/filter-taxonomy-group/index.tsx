import { Field } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { LockKeyhole } from "lucide-react";
import { Select } from "@/components/ui/select";
import { SelectContent } from "@/components/ui/select/select-content";
import { SelectItem } from "@/components/ui/select/select-item";
import { SelectTrigger } from "@/components/ui/select/select-trigger";
import { SelectValue } from "@/components/ui/select/select-value";
import type {
  OnFilterFieldChange,
  OpportunityFilterOptions,
  OpportunityFiltersState,
} from "@/app/opportunities/_components/opportunities-screen/types";
import { TechnologyMatchMode } from "@/app/opportunities/_components/opportunities-screen/types";
import { FilterSection } from "../filter-section";
import { SelectedChipList } from "../selected-chip-list";
import { TagCategoryPicker } from "./tag-category-picker";

interface FilterTaxonomyGroupProps {
  locale: string;
  state: OpportunityFiltersState;
  options: OpportunityFilterOptions;
  labels: {
    section: string;
    workModeLabel: string;
    workModePlaceholder: string;
    seniorityLabel: string;
    seniorityPlaceholder: string;
    employmentLabel: string;
    employmentPlaceholder: string;
    technologyLabel: string;
    technologyPlaceholder: string;
    technologyMatchLabel: string;
    technologyMatchAny: string;
    technologyMatchAll: string;
    languageLabel: string;
    languagePlaceholder: string;
    otherTagsLabel: string;
    otherTagsPlaceholder: string;
    noTagsSelected: string;
    authors: string;
    authorPlaceholder: string;
    noAuthorsSelected: string;
    removeFilter: string;
  };
  portalContainer?: HTMLElement | null;
  authorsLocked?: boolean;
  onAuthorSelected: (author: string) => void;
  onToggleAuthor: (author: string) => void;
  onFieldChange: OnFilterFieldChange;
}

function toggled(values: string[], value: string) {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

export function FilterTaxonomyGroup({
  locale,
  state,
  options,
  labels,
  portalContainer,
  authorsLocked,
  onAuthorSelected,
  onToggleAuthor,
  onFieldChange,
}: FilterTaxonomyGroupProps): React.ReactNode {
  const selectedAuthors = state.authors.map((author) => ({
    key: author,
    label:
      options.authors.find((option) => option.value === author)?.label ?? author,
  }));

  return (
    <FilterSection label={labels.section}>
      <div className="grid grid-cols-1 gap-4">
        <TagCategoryPicker
          locale={locale}
          controlId="advanced-work-model-filter"
          label={labels.workModeLabel}
          placeholder={labels.workModePlaceholder}
          options={options.workModels}
          portalContainer={portalContainer}
          onSelect={(value) => onFieldChange("workModels", toggled(state.workModels, value))}
        />
        <TagCategoryPicker
          locale={locale}
          controlId="advanced-seniority-filter"
          label={labels.seniorityLabel}
          placeholder={labels.seniorityPlaceholder}
          options={options.seniority}
          portalContainer={portalContainer}
          onSelect={(value) => onFieldChange("seniority", toggled(state.seniority, value))}
        />
        <TagCategoryPicker
          locale={locale}
          controlId="advanced-other-tags-filter"
          label={labels.otherTagsLabel}
          placeholder={labels.otherTagsPlaceholder}
          options={options.areas}
          portalContainer={portalContainer}
          onSelect={(value) => onFieldChange("areas", toggled(state.areas, value))}
        />
        <TagCategoryPicker
          locale={locale}
          controlId="advanced-technology-filter"
          label={labels.technologyLabel}
          placeholder={labels.technologyPlaceholder}
          options={options.technologies}
          portalContainer={portalContainer}
          onSelect={(value) => onFieldChange("technologies", toggled(state.technologies, value))}
        />
        {state.technologies.length > 1 ? (
          <Field label={labels.technologyMatchLabel} controlId="advanced-technology-match">
            {(controlProps) => (
              <Select value={state.technologyMatch} onValueChange={(value) => onFieldChange("technologyMatch", value as TechnologyMatchMode)}>
                <SelectTrigger {...controlProps}><SelectValue /></SelectTrigger>
                <SelectContent portalContainer={portalContainer ?? undefined}>
                  <SelectItem value={TechnologyMatchMode.Any}>{labels.technologyMatchAny}</SelectItem>
                  <SelectItem value={TechnologyMatchMode.All}>{labels.technologyMatchAll}</SelectItem>
                </SelectContent>
              </Select>
            )}
          </Field>
        ) : null}
        <TagCategoryPicker
          locale={locale}
          controlId="advanced-employment-filter"
          label={labels.employmentLabel}
          placeholder={labels.employmentPlaceholder}
          options={options.employmentTypes}
          portalContainer={portalContainer}
          onSelect={(value) => onFieldChange(
            "employmentTypes",
            toggled(state.employmentTypes, value),
          )}
        />
        <TagCategoryPicker
          locale={locale}
          controlId="advanced-language-filter"
          label={labels.languageLabel}
          placeholder={labels.languagePlaceholder}
          options={options.languages}
          portalContainer={portalContainer}
          onSelect={(value) => onFieldChange("languages", toggled(state.languages, value))}
        />
        <SelectedChipList
          items={[
            ...state.workModels.map((value) => ({ key: `work:${value}`, label: value })),
            ...state.seniority.map((value) => ({ key: `seniority:${value}`, label: value })),
            ...state.areas.map((value) => ({ key: `area:${value}`, label: value })),
            ...state.technologies.map((value) => ({ key: `technology:${value}`, label: value })),
            ...state.employmentTypes.map((value) => ({ key: `employment:${value}`, label: value })),
            ...state.languages.map((value) => ({ key: `language:${value}`, label: value })),
          ]}
          emptyLabel={labels.noTagsSelected}
          removeLabel={labels.removeFilter}
          onRemove={(key) => {
            const [kind, value] = key.split(":", 2);
            if (kind === "work") onFieldChange("workModels", toggled(state.workModels, value));
            else if (kind === "seniority") onFieldChange("seniority", toggled(state.seniority, value));
            else if (kind === "area") onFieldChange("areas", toggled(state.areas, value));
            else if (kind === "technology") onFieldChange("technologies", toggled(state.technologies, value));
            else if (kind === "employment") onFieldChange("employmentTypes", toggled(state.employmentTypes, value));
            else onFieldChange("languages", toggled(state.languages, value));
          }}
          fallbackFocusId="advanced-work-model-filter"
        />

        <div className="grid gap-1.5 border-t border-line pt-4">
          {authorsLocked ? (
            <Field label={labels.authors}>
              <div className="flex min-h-11 items-center">
                {selectedAuthors.length > 0 ? (
                  selectedAuthors.map((author) => (
                    <Badge key={author.key} tone="primary" className="min-h-11 px-3">
                      <LockKeyhole aria-hidden="true" />
                      @{author.key}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {labels.noAuthorsSelected}
                  </span>
                )}
              </div>
            </Field>
          ) : (
            <>
              <Field label={labels.authors} controlId="advanced-author-filter">
                {(controlProps) => (
                  <Select
                    value=""
                    onValueChange={onAuthorSelected}
                  >
                    <SelectTrigger {...controlProps}>
                      <SelectValue placeholder={labels.authorPlaceholder} />
                    </SelectTrigger>
                    <SelectContent portalContainer={portalContainer ?? undefined}>
                      {options.authors.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label} ({option.count.toLocaleString(locale)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </Field>
              <SelectedChipList
                items={selectedAuthors}
                emptyLabel={labels.noAuthorsSelected}
                removeLabel={labels.removeFilter}
                onRemove={onToggleAuthor}
                fallbackFocusId="advanced-author-filter"
              />
            </>
          )}
        </div>
      </div>
    </FilterSection>
  );
}
