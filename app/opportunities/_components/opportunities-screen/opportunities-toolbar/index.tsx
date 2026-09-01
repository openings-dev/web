"use client";

import * as React from "react";
import { ArrowDownUp, Clock3 } from "lucide-react";
import { Select } from "@/components/ui/select";
import { SelectContent } from "@/components/ui/select/select-content";
import { SelectItem } from "@/components/ui/select/select-item";
import { SelectTrigger } from "@/components/ui/select/select-trigger";
import { SelectValue } from "@/components/ui/select/select-value";
import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import { cn } from "@/lib/utils/tailwind";
import {
  compactSelectTriggerStyles,
  controlBarStyles,
} from "@/app/opportunities/_components/opportunities-screen/styles";
import { formatTemplate } from "@/lib/utils/format-template";
import {
  OpportunitySortOrder,
  type OpportunitiesToolbarProps,
} from "@/app/opportunities/_components/opportunities-screen/types";
import { ViewModeToggle } from "@/app/opportunities/_components/opportunities-screen/view-mode-toggle";
import { ShareDiscovery } from "@/app/opportunities/_components/opportunities-screen/share-discovery";

export function OpportunitiesToolbar({
  rangeLabel,
  resultCount,
  lastUpdatedAt,
  isLoading,
  hasLoadError,
  sortOrder,
  searchActive,
  viewMode,
  shareableDiscovery,
  onSortOrderChange,
  onViewModeChange,
}: OpportunitiesToolbarProps): React.ReactNode {
  const { locale, messages } = useI18n();
  const toolbarMessages = messages.opportunities.toolbar;
  const statusMessages = messages.opportunities.status;
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => {
    const intervalId = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const generatedAt = lastUpdatedAt ? new Date(lastUpdatedAt) : null;
  const hasValidTimestamp = Boolean(
    generatedAt && Number.isFinite(generatedAt.getTime()),
  );
  const relativeStatus = hasValidTimestamp && generatedAt
    ? formatTemplate(statusMessages.updatedRelative, {
        relative: formatRelativeTime(generatedAt, now, locale),
      })
    : statusMessages.updatedUnavailable;
  const absoluteStatus = hasValidTimestamp && generatedAt
    ? formatTemplate(statusMessages.updatedAt, {
        date: new Intl.DateTimeFormat(locale, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZone: "UTC",
          timeZoneName: "short",
        }).format(generatedAt),
      })
    : statusMessages.updatedUnavailable;
  const pageSummary = resultCount === 0
    ? rangeLabel
    : resultCount === 1
      ? toolbarMessages.pageSummaryOne
      : formatTemplate(toolbarMessages.pageSummary, { range: rangeLabel });
  return (
    <div className={controlBarStyles}>
      <div className="min-w-0 space-y-1" aria-busy={isLoading}>
        {isLoading ? (
          <p className="text-sm font-semibold text-foreground">
            {toolbarMessages.loading}
          </p>
        ) : hasLoadError ? null : (
          <>
            <p
              className="font-tabular text-sm font-semibold text-foreground"
              aria-hidden="true"
            >
              {pageSummary}
            </p>
            <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
              {pageSummary}
            </p>
            <time
              dateTime={hasValidTimestamp && generatedAt ? generatedAt.toISOString() : undefined}
              aria-label={absoluteStatus}
              title={absoluteStatus}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <Clock3 className="size-3.5 shrink-0" aria-hidden="true" />
              {relativeStatus}
            </time>
          </>
        )}
      </div>

      {!isLoading ? (
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
          {shareableDiscovery ? <ShareDiscovery /> : null}
          <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
            <ArrowDownUp className="size-3.5 shrink-0" aria-hidden="true" />
            <Select
              value={sortOrder}
              onValueChange={(value) =>
                onSortOrderChange(value as OpportunitySortOrder)
              }
            >
              <SelectTrigger
                aria-label={toolbarMessages.sortPlaceholder}
                className={cn(
                  compactSelectTriggerStyles,
                  "h-11 min-w-32 bg-transparent px-2.5 text-xs shadow-none",
                )}
              >
                <SelectValue placeholder={toolbarMessages.sortPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {searchActive ? <SelectItem value={OpportunitySortOrder.Relevance}>{toolbarMessages.sortRelevance}</SelectItem> : null}
                <SelectItem value={OpportunitySortOrder.Recent}>{toolbarMessages.sortRecent}</SelectItem>
                <SelectItem value={OpportunitySortOrder.Oldest}>{toolbarMessages.sortOldest}</SelectItem>
                <SelectItem value={OpportunitySortOrder.Updated}>{toolbarMessages.sortUpdated}</SelectItem>
                <SelectItem value={OpportunitySortOrder.Salary}>{toolbarMessages.sortSalary}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <span className="hidden h-5 w-px bg-line md:block" aria-hidden="true" />

          <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
        </div>
      ) : null}
    </div>
  );
}

function formatRelativeTime(fromDate: Date, now: number, locale: string): string {
  const diffMs = fromDate.getTime() - now;
  const absSeconds = Math.round(Math.abs(diffMs) / 1_000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (absSeconds < 60) {
    return formatter.format(Math.round(diffMs / 1_000), "second");
  }

  const absMinutes = Math.round(absSeconds / 60);
  if (absMinutes < 60) {
    return formatter.format(Math.round(diffMs / 60_000), "minute");
  }

  const absHours = Math.round(absMinutes / 60);
  if (absHours < 24) {
    return formatter.format(Math.round(diffMs / 3_600_000), "hour");
  }

  return formatter.format(Math.round(diffMs / 86_400_000), "day");
}
