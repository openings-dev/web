import { countBy, sortOptions } from "./filter-option-helpers";
import { groupTagOptionsByCategory } from "./tag-categories";
import { condenseTagOptions } from "./tag-normalization";
import type {
  OpportunityFilterFacets,
  OpportunityFilterOptions,
  OpportunityItem,
} from "@/app/opportunities/_components/opportunities-screen/types";

function nonZeroOptions<T extends { count: number }>(options: T[]) {
  return options.filter((option) => option.count > 0);
}

export function buildFilterOptions(
  openOpportunities: OpportunityItem[],
  facets: OpportunityFilterFacets | null,
  locale: string,
) {
  const repositoryCounts = facets?.repositories ??
    countBy(openOpportunities, (item) => item.repository);
  const regionCounts = facets?.jobRegions ??
    countBy(openOpportunities, (item) => item.jobLocation?.region ?? "");
  const countryCounts = facets?.jobCountries ??
    countBy(openOpportunities, (item) => item.jobLocation?.country ?? "");
  const rawTagCounts = facets?.tags ??
    countBy(openOpportunities.flatMap((item) => item.tags), (tag) => tag);
  const authorCounts = facets?.authors ??
    countBy(openOpportunities, (item) => item.author.handle);

  const authorLabels = facets?.authorLabels ??
    openOpportunities.reduce<Record<string, string>>((accumulator, item) => {
      accumulator[item.author.handle] = item.author.name;
      return accumulator;
    }, {});
  const tagOptions = nonZeroOptions(condenseTagOptions(rawTagCounts, locale));

  return {
    repositories: nonZeroOptions(sortOptions(repositoryCounts)),
    regions: nonZeroOptions(sortOptions(regionCounts)),
    countries: nonZeroOptions(sortOptions(countryCounts)),
    tags: tagOptions,
    tagCategories: groupTagOptionsByCategory(tagOptions),
    authors: nonZeroOptions(sortOptions(authorCounts, authorLabels)),
    workModels: nonZeroOptions(sortOptions(facets?.workModels ?? {})),
    areas: nonZeroOptions(sortOptions(facets?.areas ?? {})),
    technologies: nonZeroOptions(sortOptions(facets?.technologies ?? {})),
    seniority: nonZeroOptions(sortOptions(facets?.seniority ?? {})),
    employmentTypes: nonZeroOptions(sortOptions(facets?.employmentTypes ?? {})),
    languages: nonZeroOptions(sortOptions(facets?.languages ?? {})),
  } satisfies OpportunityFilterOptions;
}
