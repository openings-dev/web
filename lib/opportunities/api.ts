import type { OpportunityFilterFacets } from "./types";
import type {
  OpportunitiesApiPayload,
  OpportunityDimensionKey,
  OpportunityServerFilters,
  StaticFacetIndex,
  StaticManifest,
} from "./api-types";
import {
  buildOpportunitySearchHits,
  countOpportunityDimension,
  parseOpportunityOffset,
  selectedOpportunityDimensionIds,
} from "./index-operations";
import {
  assertStaticOpportunityIndexConsistency,
  loadOpportunityById,
  loadOpportunityFacetIndex,
  loadOpportunityItems,
  loadOpportunityManifest,
  loadOpportunityOrder,
  loadOpportunityPromotions,
  loadOpportunitySearchIndex,
  withStaticArtifactRecovery,
} from "./static-artifacts";
import { sortOpportunityIdsByPromotion } from "./sort-opportunities";

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
};

async function orderedIdsForFilters(params: {
  manifest: StaticManifest;
  facetIndex: StaticFacetIndex;
  filters: OpportunityServerFilters;
  searchHits: Set<string> | null;
  ignore?: OpportunityDimensionKey;
}) {
  const selectors = ([
    "repositories",
    "regions",
    "countries",
    "tags",
    "authors",
  ] as const)
    .filter((key) => key !== params.ignore)
    .map((key) =>
      selectedOpportunityDimensionIds(params.facetIndex.dimensions, params.filters, key),
    )
    .filter((ids): ids is string[] => ids !== null);
  const order = selectors.sort((left, right) => left.length - right.length)[0] ??
    (await loadOpportunityOrder(params.manifest));
  const selectorSets = selectors.map((ids) => new Set(ids));

  return order.filter(
    (id) =>
      (!params.searchHits || params.searchHits.has(id)) &&
      selectorSets.every((set) => set.has(id)),
  );
}

async function buildFacets(params: {
  manifest: StaticManifest;
  facetIndex: StaticFacetIndex;
  filters: OpportunityServerFilters;
  searchHits: Set<string> | null;
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
  };
}

export async function fetchOpportunityById(id: string) {
  return withStaticArtifactRecovery(() => loadOpportunityById(id));
}

export async function fetchOpportunitiesPage(
  filters: OpportunityServerFilters,
  params: { cursor: string | null; limit: number; signal?: AbortSignal },
) {
  return withStaticArtifactRecovery(async () => {
    if (params.signal?.aborted) throw new DOMException("Aborted", "AbortError");

    const manifest = await loadOpportunityManifest();
    await assertStaticOpportunityIndexConsistency(manifest);
    const facetIndex = await loadOpportunityFacetIndex(manifest);
    const searchIndex = filters.searchText
      ? await loadOpportunitySearchIndex(manifest)
      : null;
    const searchHits = searchIndex
      ? buildOpportunitySearchHits(searchIndex, filters.searchText)
      : null;
    const recentIds = await orderedIdsForFilters({
      manifest,
      facetIndex,
      filters,
      searchHits,
    });
    const sponsoredIds = new Set(await loadOpportunityPromotions(manifest));
    const orderedIds = sortOpportunityIdsByPromotion(
      recentIds,
      sponsoredIds,
      filters.sortOrder,
    );
    const offset = parseOpportunityOffset(params.cursor);
    const limit = Math.max(1, params.limit);
    const pageIds = orderedIds.slice(offset, offset + limit);
    const [items, facets] = await Promise.all([
      loadOpportunityItems(pageIds, manifest),
      buildFacets({ manifest, facetIndex, filters, searchHits }),
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
