import type { OpportunitiesFiltersProps } from "@/app/opportunities/_components/opportunities-screen/types";

export interface FilterFieldsLabels {
  locationSectionLabel: string;
  scopeSectionLabel: string;
  taxonomySectionLabel: string;
  displaySectionLabel: string;
  repositoryLabel: string;
  repositoryPlaceholder: string;
  allRepositories: string;
  regionLabel: string;
  regionPlaceholder: string;
  allRegions: string;
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
  authorLabel: string;
  authorPlaceholder: string;
  noAuthorsSelected: string;
  removeFilter: string;
  sortLabel: string;
  sortPlaceholder: string;
  sortRecent: string;
  sortOldest: string;
  sortRelevance: string;
  sortUpdated: string;
  sortSalary: string;
}

export interface FilterFieldsProps extends OpportunitiesFiltersProps {
  locale: string;
  labels: FilterFieldsLabels;
  portalContainer?: HTMLElement | null;
  onTagSelected: (tag: string) => void;
  onAuthorSelected: (authorHandle: string) => void;
}
