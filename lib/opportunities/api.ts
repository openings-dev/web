import { OpportunitySortOrder, type OpportunityFilterFacets } from "./types";
import type {
  OpportunitiesApiPayload,
  OpportunityDimensionKey,
  OpportunityServerFilters,
  StaticFacetIndex,
  StaticManifest,
} from "./api-types";
import {
  buildOpportunitySearchRanking,
  countOpportunityDimension,
  parseOpportunityOffset,
  selectedOpportunityDimensionIds,
  uniqueOpportunityIds,
} from "./index-operations";
import {
  assertStaticOpportunityIndexConsistency,
  loadOpportunityById,
  loadOpportunityAliases,
  loadOpportunityFacetIndex,
  loadOpportunityItems,
  loadOpportunityManifest,
  loadOpportunityOrder,
  loadOpportunitySearchIndex,
  withStaticArtifactRecovery,
} from "./static-artifacts";
import { findSimilarOpportunities } from "./similar";
import type { OpportunityItem } from "./types";
import { compareOpportunities } from "./sort-opportunities";

export type {
  OpportunitiesApiMeta,
  OpportunitiesApiPayload,
  OpportunityServerFilters,
} from "./api-types";

const EMPTY_FACETS: OpportunityFilterFacets = {
  repositories: {},
  regions: {},
  countries: {},
  tags: {},
  authors: {},
  authorLabels: {},
  jobCountries: {},
  jobRegions: {},
  workModels: {},
  areas: {},
  technologies: {},
  seniority: {},
  employmentTypes: {},
  languages: {},
  freshness: {},
  salaryDisclosed: {},
};

async function orderedIdsForFilters(params: {
  manifest: StaticManifest;
  facetIndex: StaticFacetIndex;
  filters: OpportunityServerFilters;
  searchRanking: string[] | null;
  ignore?: OpportunityDimensionKey;
}) {
  const selectors = ([
    "repositories",
    "regions",
    "countries",
    "tags",
    "authors",
    "workModels",
    "areas",
    "technologies",
    "seniority",
    "employmentTypes",
    "languages",
    "freshness",
    "salaryDisclosed",
  ] as const)
    .filter((key) => key !== params.ignore)
    .map((key) =>
      selectedOpportunityDimensionIds(params.facetIndex.dimensions, params.filters, key),
    )
    .filter((ids): ids is string[] => ids !== null);
  if (params.filters.includedIdsActive) selectors.push(params.filters.includedIds);
  const order = params.searchRanking ??
    selectors.sort((left, right) => left.length - right.length)[0] ??
    (await loadOpportunityOrder(params.manifest));
  const selectorSets = selectors.map((ids) => new Set(ids));

  return order.filter(
    (id) =>
      selectorSets.every((set) => set.has(id)) && !params.filters.excludedIds.includes(id),
  );
}

async function buildFacets(params: {
  manifest: StaticManifest;
  facetIndex: StaticFacetIndex;
  filters: OpportunityServerFilters;
  searchRanking: string[] | null;
}): Promise<OpportunityFilterFacets> {
  const base = await orderedIdsForFilters(params);
  const repositoryBase = await orderedIdsForFilters({ ...params, ignore: "repositories" });
  const regionBase = await orderedIdsForFilters({ ...params, ignore: "regions" });
  const countryBase = await orderedIdsForFilters({ ...params, ignore: "countries" });

  return {
    repositories: countOpportunityDimension(repositoryBase, params.facetIndex.dimensions.repositories),
    regions: countOpportunityDimension(regionBase, params.facetIndex.dimensions.regions),
    countries: countOpportunityDimension(countryBase, params.facetIndex.dimensions.countries),
    tags: countOpportunityDimension(base, params.facetIndex.dimensions.tags),
    authors: countOpportunityDimension(base, params.facetIndex.dimensions.authors),
    authorLabels: params.facetIndex.labels.authors ?? {},
    jobCountries: countOpportunityDimension(base, params.facetIndex.dimensions.jobCountries),
    jobRegions: countOpportunityDimension(base, params.facetIndex.dimensions.jobRegions),
    workModels: countOpportunityDimension(base, params.facetIndex.dimensions.workModels),
    areas: countOpportunityDimension(base, params.facetIndex.dimensions.areas),
    technologies: countOpportunityDimension(base, params.facetIndex.dimensions.technologies),
    seniority: countOpportunityDimension(base, params.facetIndex.dimensions.seniority),
    employmentTypes: countOpportunityDimension(base, params.facetIndex.dimensions.employmentTypes),
    languages: countOpportunityDimension(base, params.facetIndex.dimensions.languages),
    freshness: countOpportunityDimension(base, params.facetIndex.dimensions.freshness),
    salaryDisclosed: countOpportunityDimension(base, params.facetIndex.dimensions.salaryDisclosed),
  };
}

export async function fetchOpportunityById(id: string) {
  return withStaticArtifactRecovery(() => loadOpportunityById(id));
}

export async function fetchSimilarOpportunities(
  current: OpportunityItem,
  limit = 4,
) {
  return withStaticArtifactRecovery(async () => {
    const manifest = await loadOpportunityManifest();
    const facets = await loadOpportunityFacetIndex(manifest);
    const dimensions = facets.dimensions;
    const candidateIds = new Set<string>();
    const add = (dimension: Record<string, string[]>, values: string[]) => {
      for (const value of values) {
        for (const id of dimension[value] ?? []) candidateIds.add(id);
      }
    };
    add(dimensions.technologies, current.taxonomy?.technologies ?? []);
    add(dimensions.areas, current.taxonomy?.areas ?? []);
    add(dimensions.workModels, current.taxonomy?.workModels ?? []);
    add(dimensions.jobCountries, current.jobLocation?.country ? [current.jobLocation.country] : []);
    candidateIds.delete(current.id);
    const boundedIds = [...candidateIds].slice(0, 200);
    const candidates = await loadOpportunityItems(boundedIds, manifest);
    return findSimilarOpportunities(current, candidates, limit);
  });
}

export async function canonicalizeOpportunityIds(ids: string[]) {
  return uniqueOpportunityIds(await resolveOpportunityIds(ids));
}

export async function resolveOpportunityIds(ids: string[]) {
  return withStaticArtifactRecovery(async () => {
    const manifest = await loadOpportunityManifest();
    const aliases = await loadOpportunityAliases(manifest);
    return ids.map((id) => aliases.ids[id] ?? id);
  });
}

export async function fetchOpportunitiesPage(
  filters: OpportunityServerFilters,
  params: { cursor: string | null; limit: number; signal?: AbortSignal },
) {
  return withStaticArtifactRecovery(async () => {
    if (params.signal?.aborted) throw new DOMException("Aborted", "AbortError");

    const manifest = await loadOpportunityManifest();
    await assertStaticOpportunityIndexConsistency(manifest);
    const aliases = filters.includedIdsActive
      ? await loadOpportunityAliases(manifest)
      : null;
    const effectiveFilters = aliases ? {
      ...filters,
      includedIds: uniqueOpportunityIds(
        filters.includedIds.map((id) => aliases.ids[id] ?? id),
      ),
    } : filters;
    const facetIndex = await loadOpportunityFacetIndex(manifest);
    const searchIndex = effectiveFilters.searchText || effectiveFilters.createdAfter
      ? await loadOpportunitySearchIndex(manifest)
      : null;
    const searchRanking = searchIndex
      ? buildOpportunitySearchRanking(searchIndex, effectiveFilters.searchText).filter((id) => {
          if (!effectiveFilters.createdAfter) return true;
          const entry = searchIndex.items.find((item) => item.id === id);
          return Boolean(entry && Date.parse(entry.createdAt) > Date.parse(effectiveFilters.createdAfter));
        })
      : null;
    const matchingIds = await orderedIdsForFilters({
      manifest,
      facetIndex,
      filters: effectiveFilters,
      searchRanking,
    });
    let orderedIds: string[];
    if (
      effectiveFilters.sortOrder === OpportunitySortOrder.Updated ||
      effectiveFilters.sortOrder === OpportunitySortOrder.Salary
    ) {
      const sortableItems = await loadOpportunityItems(matchingIds, manifest);
      orderedIds = [...sortableItems]
        .sort((left, right) => compareOpportunities(left, right, effectiveFilters.sortOrder))
        .map((item) => item.id);
    } else if (effectiveFilters.searchText && effectiveFilters.sortOrder !== OpportunitySortOrder.Relevance) {
      const createdAtById = new Map(searchIndex?.items.map((item) => [item.id, Date.parse(item.createdAt)]));
      const dateSorted = [...matchingIds].sort((left, right) => {
        const difference = (createdAtById.get(right) ?? 0) - (createdAtById.get(left) ?? 0);
        return effectiveFilters.sortOrder === OpportunitySortOrder.Oldest
          ? -difference || left.localeCompare(right)
          : difference || left.localeCompare(right);
      });
      orderedIds = dateSorted;
    } else {
      orderedIds = effectiveFilters.sortOrder === OpportunitySortOrder.Oldest
        ? [...matchingIds].reverse()
        : matchingIds;
    }
    const offset = parseOpportunityOffset(params.cursor);
    const limit = Math.max(1, params.limit);
    const pageIds = orderedIds.slice(offset, offset + limit);
    const [items, facets] = await Promise.all([
      loadOpportunityItems(pageIds, manifest),
      buildFacets({ manifest, facetIndex, filters: effectiveFilters, searchRanking }),
    ]);
    const nextOffset = offset + pageIds.length;

    return {
      items,
      nextCursor: nextOffset < orderedIds.length ? String(nextOffset) : null,
      hasMore: nextOffset < orderedIds.length,
      rateLimited: false,
      retryAfterSeconds: null,
      meta: {
        snapshotGeneratedAt: manifest.generatedAt,
        deployedAt: null,
        lastUpdatedAt: manifest.generatedAt,
        totalCount: manifest.totals.openOpportunities,
        filteredCount: orderedIds.length,
        facets: Object.keys(facets.repositories).length > 0
          ? facets
          : EMPTY_FACETS,
      },
    } satisfies OpportunitiesApiPayload;
  });
}
