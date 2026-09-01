import type { OpportunityItem } from "./types";

function overlap(left: string[] = [], right: string[] = []) {
  const rightValues = new Set(right);
  return left.filter((value) => rightValues.has(value)).length;
}

export function scoreSimilarOpportunity(
  current: OpportunityItem,
  candidate: OpportunityItem,
) {
  const currentTaxonomy = current.taxonomy;
  const candidateTaxonomy = candidate.taxonomy;
  return overlap(currentTaxonomy?.technologies, candidateTaxonomy?.technologies) * 5 +
    overlap(currentTaxonomy?.areas, candidateTaxonomy?.areas) * 4 +
    overlap(currentTaxonomy?.workModels, candidateTaxonomy?.workModels) * 3 +
    (current.jobLocation?.countryCode &&
      current.jobLocation.countryCode === candidate.jobLocation?.countryCode ? 3 : 0) +
    overlap(currentTaxonomy?.seniority, candidateTaxonomy?.seniority) * 2 +
    overlap(currentTaxonomy?.employmentTypes, candidateTaxonomy?.employmentTypes) +
    (candidate.freshness?.status === "fresh" ? 1 : 0);
}

function sourceUrls(item: OpportunityItem) {
  return new Set([item.url, ...(item.sources ?? []).map((source) => source.url)].filter(Boolean));
}

function aliases(item: OpportunityItem) {
  return new Set([
    item.id,
    item.sourceId,
    ...(item.sources ?? []).flatMap((source) => [source.id, source.sourceId]),
  ].filter((value): value is string => Boolean(value)));
}

export function findSimilarOpportunities(
  current: OpportunityItem,
  candidates: OpportunityItem[],
  limit = 4,
) {
  const currentAliases = aliases(current);
  const currentUrls = sourceUrls(current);
  return candidates
    .filter((candidate) => candidate.issueState === "open" &&
      !currentAliases.has(candidate.id) &&
      !currentAliases.has(candidate.sourceId ?? ""))
    .filter((candidate) =>
      [...sourceUrls(candidate)].every((url) => !currentUrls.has(url)))
    .map((candidate) => ({ candidate, score: scoreSimilarOpportunity(current, candidate) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score ||
      Date.parse(right.candidate.createdAt) - Date.parse(left.candidate.createdAt) ||
      left.candidate.id.localeCompare(right.candidate.id))
    .slice(0, Math.max(0, Math.min(4, limit)))
    .map(({ candidate }) => candidate);
}
