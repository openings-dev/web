import { LoaderCircle } from "lucide-react";
import { resultsGridStyles } from "@/app/opportunities/_components/opportunities-screen/styles";
import type { OpportunityViewMode } from "@/app/opportunities/_components/opportunities-screen/types";
import { OpportunitySkeleton } from "../opportunity-skeleton";
import { Button } from "@/components/ui/button";

interface ListFooterProps {
  viewMode: OpportunityViewMode;
  hasMore: boolean;
  hasLoadMoreError: boolean;
  isFetchingMore: boolean;
  scrollToLoadMoreLabel: string;
  allResultsLoadedLabel: string;
  loadingMoreLabel: string;
  partialLoadErrorLabel: string;
  skeletonCount: number;
  loadMoreLabel: string;
  onLoadMore: () => void;
}

export function ListFooter({
  viewMode,
  hasMore,
  hasLoadMoreError,
  isFetchingMore,
  scrollToLoadMoreLabel,
  allResultsLoadedLabel,
  loadingMoreLabel,
  partialLoadErrorLabel,
  skeletonCount,
  loadMoreLabel,
  onLoadMore,
}: ListFooterProps): React.ReactNode {
  return (
    <div className="space-y-4 border-t border-line pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {hasMore && !hasLoadMoreError ? (
          <Button type="button" variant="outline" disabled={isFetchingMore} onClick={onLoadMore}>
            {isFetchingMore ? loadingMoreLabel : loadMoreLabel}
          </Button>
        ) : <span />}
        <p
          className="max-w-xl text-xs leading-5 text-muted-foreground text-right"
          role={hasLoadMoreError ? "alert" : undefined}
        >
          {hasLoadMoreError
            ? partialLoadErrorLabel
            : hasMore
              ? scrollToLoadMoreLabel
              : allResultsLoadedLabel}
        </p>
      </div>

      {isFetchingMore ? (
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
            {loadingMoreLabel}
          </div>
          <div className={resultsGridStyles({ viewMode })}>
            {Array.from({ length: Math.min(skeletonCount, 3) }).map((_, index) => (
              <OpportunitySkeleton
                key={`more-skeleton-${index}`}
                viewMode={viewMode}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
