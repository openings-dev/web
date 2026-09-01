import type { OpportunityItem } from "./types";
import type { OpportunitySortOrder } from "./enums";

type SortableOpportunity = Pick<
  OpportunityItem,
  "id" | "createdAt" | "updatedAt" | "salary"
>;

export function compareOpportunities(
  left: SortableOpportunity,
  right: SortableOpportunity,
  sortOrder: OpportunitySortOrder,
): number {
  if (sortOrder === "relevance") return 0;

  if (sortOrder === "salary") {
    const annualized = (item: SortableOpportunity) => {
      const amount = item.salary?.max ?? item.salary?.min;
      if (amount === undefined) return Number.NEGATIVE_INFINITY;
      if (item.salary?.period === "month") return amount * 12;
      if (item.salary?.period === "hour") return amount * 2_080;
      return amount;
    };
    const salaryComparison = annualized(right) - annualized(left);
    if (salaryComparison !== 0) return salaryComparison;
  }

  const dateField = sortOrder === "updated" ? "updatedAt" : "createdAt";
  const leftDate = new Date(left[dateField]).getTime();
  const rightDate = new Date(right[dateField]).getTime();
  const dateComparison = sortOrder === "oldest"
    ? leftDate - rightDate
    : rightDate - leftDate;

  return dateComparison || left.id.localeCompare(right.id);
}
