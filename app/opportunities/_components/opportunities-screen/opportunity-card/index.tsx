"use client";

import * as React from "react";
import { Building2 } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import { Avatar } from "@/components/ui/avatar";
import { formatSalary } from "@/app/opportunities/_components/opportunities-screen/shared/format-salary";
import { cn } from "@/lib/utils/tailwind";
import { formatTemplate } from "@/lib/utils/format-template";
import { opportunityCardStyles } from "@/app/opportunities/_components/opportunities-screen/styles";
import {
  OpportunityViewMode,
  type OpportunityCardProps,
} from "@/app/opportunities/_components/opportunities-screen/types";
import { OpportunityCardFooter } from "./opportunity-card-footer";
import { OpportunityCardHeader } from "./opportunity-card-header";
import { OpportunityCardMeta } from "./opportunity-card-meta";
import { OpportunityCardTags } from "./opportunity-card-tags";
import { getOpportunityDetailsElementIds } from "./trigger-contract";
import { SponsoredBadge } from "../sponsored-badge";

export function OpportunityCard({
  item,
  viewMode,
  isSelected,
  onSelectOpportunity,
  onCommunitySelect,
  onAuthorSelect,
  hideCommunityIdentity,
  hideAuthorIdentity,
}: OpportunityCardProps): React.ReactNode {
  const { locale, messages } = useI18n();
  const cardMessages = messages.opportunities.card;
  const dateFormatter = React.useMemo(
    () => new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeZone: "UTC",
    }),
    [locale],
  );
  const salaryLabel = formatSalary(item.salary, locale, {
    month: cardMessages.salaryPeriodMonth,
    year: cardMessages.salaryPeriodYear,
    hour: cardMessages.salaryPeriodHour,
    from: cardMessages.salaryFrom,
    upTo: cardMessages.salaryUpTo,
    range: cardMessages.salaryRange,
  });
  const showCommunity = !hideCommunityIdentity;
  const showContext = showCommunity || Boolean(item.companyName);
  const isList = viewMode === OpportunityViewMode.List;
  const titleId = React.useId();
  const detailsElementIds = getOpportunityDetailsElementIds(item.id);
  const handleCommunityClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    onCommunitySelect(item.repository);
  };

  return (
    <article
      className={cn(opportunityCardStyles({ viewMode, selected: isSelected }))}
      aria-labelledby={titleId}
    >
      <button
        type="button"
        data-opportunity-trigger={item.id}
        className="absolute inset-0 z-10 rounded-card focus-visible:outline-none"
        aria-label={formatTemplate(cardMessages.openDetailsAriaLabel, {
          title: item.title,
        })}
        aria-expanded={isSelected}
        aria-controls={detailsElementIds.dialog}
        onClick={() => onSelectOpportunity(item)}
      />
      <div className="pointer-events-none relative flex h-full flex-col gap-4">
        <div
          className={cn(
            "min-w-0 gap-4",
            isList
              ? "grid lg:grid-cols-[minmax(0,1.35fr)_minmax(15rem,0.65fr)] lg:items-start"
              : "flex flex-1 flex-col",
          )}
        >
          <div className="min-w-0 space-y-3">
            {showContext ? (
              <div className="flex min-h-8 min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {showCommunity ? (
                  <button
                    type="button"
                    className="pointer-events-auto relative z-20 -my-1.5 inline-flex min-h-11 min-w-0 items-center gap-2 rounded-control px-1.5 font-medium text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={formatTemplate(cardMessages.showCommunityJobs, {
                      name: item.community.name || item.repository,
                    })}
                    onClick={handleCommunityClick}
                  >
                    <Avatar
                      src={item.community.avatarUrl}
                      fallback={item.community.name || item.repository}
                      width={28}
                      height={28}
                      className="size-7 text-[0.6875rem]"
                    />
                    <span className="truncate">{item.community.name}</span>
                  </button>
                ) : null}
                {item.companyName ? (
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.companyName}</span>
                  </span>
                ) : null}
              </div>
            ) : null}
            <SponsoredBadge promotion={item.promotion} />
            <OpportunityCardHeader
              title={item.title}
              excerpt={item.excerpt}
              titleId={titleId}
              viewMode={viewMode}
            />
          </div>

          <div className={cn("space-y-3", !isList && "mt-auto pt-2")}>
            <OpportunityCardMeta item={item} salaryLabel={salaryLabel} locale={locale} />
            <OpportunityCardTags
              tags={item.tags}
              viewMode={viewMode}
              locale={locale}
              moreTagLabel={cardMessages.moreTag}
              moreTagsLabel={cardMessages.moreTags}
            />
          </div>
        </div>

        <div className="pointer-events-none relative z-20">
          <OpportunityCardFooter
            item={item}
            dateLabel={dateFormatter.format(new Date(item.createdAt))}
            detailsLabel={cardMessages.viewDetails}
            authorActionLabel={formatTemplate(cardMessages.showAuthorJobs, {
              handle: item.author.handle,
            })}
            onAuthorSelect={onAuthorSelect}
            showAuthorIdentity={!hideAuthorIdentity}
            showRepository={!hideCommunityIdentity}
          />
        </div>
      </div>
    </article>
  );
}
