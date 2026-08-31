import type { OpportunityItem } from "./types";

export type OpportunityDateSortOrder = "recent" | "oldest";

type SortableOpportunity = Pick<
  OpportunityItem,
  "id" | "createdAt" | "promotion"
>;

function isSponsored(opportunity: SortableOpportunity): boolean {
  return opportunity.promotion?.type === "sponsored";
}

export function compareOpportunities(
  left: SortableOpportunity,
  right: SortableOpportunity,
  sortOrder: OpportunityDateSortOrder,
): number {
  const promotionComparison = Number(isSponsored(right)) - Number(isSponsored(left));
  if (promotionComparison !== 0) return promotionComparison;

  const leftDate = new Date(left.createdAt).getTime();
  const rightDate = new Date(right.createdAt).getTime();
  const dateComparison = sortOrder === "oldest"
    ? leftDate - rightDate
    : rightDate - leftDate;

  return dateComparison || left.id.localeCompare(right.id);
}

export function sortOpportunityIdsByPromotion(
  ids: string[],
  sponsoredIds: ReadonlySet<string>,
  sortOrder: OpportunityDateSortOrder,
): string[] {
  const sponsored = ids.filter((id) => sponsoredIds.has(id));
  const organic = ids.filter((id) => !sponsoredIds.has(id));

  if (sortOrder === "oldest") {
    sponsored.reverse();
    organic.reverse();
  }

  return [...sponsored, ...organic];
}
