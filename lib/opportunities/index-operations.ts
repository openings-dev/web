import type {
  OpportunityDimensionKey,
  OpportunityFacetIndexDimensions,
  OpportunityServerFilters,
  StaticSearchIndex,
} from "./api-types";

export function parseOpportunityOffset(value: string | null) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function uniqueOpportunityIds(ids: string[]) {
  return [...new Set(ids)];
}

export function normalizeOpportunitySearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildOpportunitySearchHits(
  searchIndex: StaticSearchIndex,
  searchText: string,
) {
  const query = normalizeOpportunitySearchText(searchText);
  if (!query) return null;

  return new Set(
    buildOpportunitySearchRanking(searchIndex, query),
  );
}

const SEARCH_SYNONYMS: Record<string, string[]> = {
  ai: ["ai", "ia", "artificial intelligence", "machine learning", "ml"],
  ia: ["ai", "ia", "artificial intelligence", "machine learning", "ml"],
  internship: ["internship", "intern", "estagio", "estagiario", "trainee"],
  estagio: ["internship", "intern", "estagio", "estagiario", "trainee"],
  remote: ["remote", "remoto", "remota", "home office"],
  remoto: ["remote", "remoto", "remota", "home office"],
  reactjs: ["react", "reactjs", "react.js"],
};

function editDistanceAtMostOne(left: string, right: string) {
  if (left === right) return true;
  if (Math.abs(left.length - right.length) > 1) return false;
  let edits = 0;
  for (let leftIndex = 0, rightIndex = 0;
    leftIndex < left.length || rightIndex < right.length;) {
    if (left[leftIndex] === right[rightIndex]) {
      leftIndex += 1;
      rightIndex += 1;
    } else {
      edits += 1;
      if (edits > 1) return false;
      if (left.length >= right.length) leftIndex += 1;
      if (right.length >= left.length) rightIndex += 1;
    }
  }
  return true;
}

function scoreField(value: string, terms: string[], weight: number) {
  const words = value.split(" ").filter(Boolean);
  return terms.reduce((best, term) => {
    const exact = term.includes(" ") ? value.includes(term) : words.includes(term);
    if (exact) return Math.max(best, weight);
    const fuzzy = !term.includes(" ") && term.length >= 5 &&
      words.some((word) => editDistanceAtMostOne(term, word));
    return fuzzy ? Math.max(best, Math.ceil(weight / 2)) : best;
  }, 0);
}

export function buildOpportunitySearchRanking(
  searchIndex: StaticSearchIndex,
  searchText: string,
) {
  const query = normalizeOpportunitySearchText(searchText);
  if (!query) return searchIndex.items.map((entry) => entry.id);
  const rawTerms = query.split(" ").filter(Boolean);
  const termGroups = rawTerms.map((term) => SEARCH_SYNONYMS[term] ?? [term]);
  return searchIndex.items.map((entry) => {
    const scores = termGroups.map((terms) =>
      scoreField(entry.fields.title, terms, 40) +
      scoreField(entry.fields.company, terms, 24) +
      scoreField(entry.fields.taxonomy, terms, 20) +
      scoreField(entry.fields.location, terms, 14) +
      scoreField(entry.fields.excerpt, terms, 8) +
      scoreField(entry.fields.source, terms, 3)
    );
    return { id: entry.id, score: scores.every((score) => score > 0) ?
      scores.reduce((total, score) => total + score, 0) : 0 };
  }).filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || left.id.localeCompare(right.id))
    .map(({ id }) => id);
}

export function selectedOpportunityDimensionIds(
  dimensions: OpportunityFacetIndexDimensions,
  filters: OpportunityServerFilters,
  key: OpportunityDimensionKey,
) {
  if (key === "repositories" && filters.repository !== "all") {
    return dimensions.repositories[filters.repository] ?? [];
  }
  if (key === "regions" && filters.region !== "all") {
    return dimensions.jobRegions[filters.region] ?? [];
  }
  if (key === "countries" && filters.country !== "all") {
    return dimensions.jobCountries[filters.country] ?? [];
  }
  if (key === "tags" && filters.tags.length > 0) {
    return uniqueOpportunityIds(
      filters.tags.flatMap((value) => dimensions.tags[value] ?? []),
    );
  }
  if (key === "authors" && filters.authors.length > 0) {
    return uniqueOpportunityIds(
      filters.authors.flatMap((value) => dimensions.authors[value] ?? []),
    );
  }
  const multiSelectFilters = {
    workModels: filters.workModels,
    areas: filters.areas,
    technologies: filters.technologies,
    seniority: filters.seniority,
    employmentTypes: filters.employmentTypes,
    languages: filters.languages,
  } as const;
  if (key in multiSelectFilters) {
    const values = multiSelectFilters[key as keyof typeof multiSelectFilters];
    if (values.length > 0) {
      if (key === "technologies" && filters.technologyMatch === "all") {
        const [first = [], ...rest] = values.map((value) => dimensions.technologies[value] ?? []);
        const remaining = rest.map((ids) => new Set(ids));
        return first.filter((id) => remaining.every((ids) => ids.has(id)));
      }
      return uniqueOpportunityIds(values.flatMap((value) => dimensions[key][value] ?? []));
    }
  }
  if (key === "freshness" && filters.freshnessDays !== "all") {
    return dimensions.freshness[filters.freshnessDays] ?? [];
  }
  if (key === "salaryDisclosed" && filters.salaryOnly) {
    return dimensions.salaryDisclosed.true ?? [];
  }
  return null;
}

export function countOpportunityDimension(
  ids: string[],
  dimension: Record<string, string[]>,
) {
  const base = new Set(ids);
  const counts: Record<string, number> = {};
  for (const [value, optionIds] of Object.entries(dimension)) {
    const count = optionIds.reduce(
      (total, id) => total + (base.has(id) ? 1 : 0),
      0,
    );
    if (count > 0) counts[value] = count;
  }
  return counts;
}
