"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/brand/wordmark";
import { WordmarkSize } from "@/components/brand/wordmark/types";
import { formatSalary } from "@/app/opportunities/_components/opportunities-screen/shared/format-salary";
import { DrawerAction } from "@/app/opportunities/_components/opportunities-screen/opportunity-drawer/drawer-action";
import { DrawerIdentities } from "@/app/opportunities/_components/opportunities-screen/opportunity-drawer/drawer-identities";
import { DrawerMetadata } from "@/app/opportunities/_components/opportunities-screen/opportunity-drawer/drawer-metadata";
import { DrawerTags } from "@/app/opportunities/_components/opportunities-screen/opportunity-drawer/drawer-tags";
import { OpportunityMarkdown } from "@/app/opportunities/_components/opportunities-screen/opportunity-drawer/opportunity-markdown";
import { SponsoredBadge } from "@/app/opportunities/_components/opportunities-screen/sponsored-badge";
import { formatTemplate } from "@/lib/utils/format-template";
import { cn } from "@/lib/utils/tailwind";
import {
  OpportunityDetailsMode,
  type OpportunityDetailsProps,
} from "./types";

export function OpportunityDetails({
  item,
  shareUrl,
  mode = OpportunityDetailsMode.Dialog,
  hideCommunityIdentity = false,
  hideAuthorIdentity = false,
  onClose,
  onCommunitySelect,
  onAuthorSelect,
  communityHref,
  authorHref,
  specimenMode = false,
}: OpportunityDetailsProps): React.ReactNode {
  const { locale, messages } = useI18n();
  const copy = messages.opportunities.card;
  const isDialog = mode === OpportunityDetailsMode.Dialog;
  const Heading = isDialog ? "h2" : "h1";
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
  const salaryLabel = formatSalary(item.salary, locale, {
    month: copy.salaryPeriodMonth,
    year: copy.salaryPeriodYear,
    hour: copy.salaryPeriodHour,
    from: copy.salaryFrom,
    upTo: copy.salaryUpTo,
    range: copy.salaryRange,
  });
  const postedAt = formatTemplate(copy.postedAt, {
    date: dateFormatter.format(new Date(item.createdAt)),
  });
  const updatedAt = formatTemplate(copy.updatedAt, {
    date: dateFormatter.format(new Date(item.updatedAt)),
  });
  const action = (
    <DrawerAction
      openOriginalLabel={copy.openOriginal}
      shareLabel={copy.share}
      shareSharedLabel={copy.shareShared}
      shareCopiedLabel={copy.shareCopied}
      shareFailedLabel={copy.shareFailed}
      shareUrl={shareUrl}
      url={item.url}
      inert={specimenMode}
    />
  );

  return (
    <article
      className={cn(
        "flex min-h-0 flex-col bg-surface-elevated text-foreground",
        isDialog ? "h-full" : "min-h-[calc(100dvh-4.5rem)]",
      )}
    >
      {isDialog ? (
        <header className="z-20 flex min-h-16 shrink-0 items-center gap-4 border-b border-line bg-surface-elevated/95 px-4 backdrop-blur-sm sm:min-h-[4.5rem] sm:px-6 lg:px-8">
          <Link
            href="/"
            className="mr-auto inline-flex min-h-11 items-center rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={messages.header.brandName}
          >
            <Wordmark size={WordmarkSize.Compact} className="h-7" />
          </Link>
          <p className="hidden text-sm font-medium text-muted-foreground sm:block">
            {copy.detailsTitle}
          </p>
          {onClose ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              data-detail-close=""
              onClick={onClose}
              aria-label={copy.closeDetails}
            >
              <X className="size-5" aria-hidden="true" />
            </Button>
          ) : null}
        </header>
      ) : null}

      <div className={cn("min-h-0 flex-1", isDialog && "overflow-y-auto overscroll-contain")}>
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-7 sm:px-6 sm:py-9 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,22rem)] lg:gap-12 lg:px-8 lg:py-12">
          <main className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <p className="text-label font-semibold text-primary-deep">
                {copy.detailsTitle}
              </p>
              <SponsoredBadge promotion={item.promotion} />
            </div>
            <DrawerIdentities
              item={item}
              hideCommunityIdentity={hideCommunityIdentity}
              hideAuthorIdentity={hideAuthorIdentity}
              onCommunitySelect={onCommunitySelect}
              onAuthorSelect={onAuthorSelect}
              communityHref={communityHref}
              authorHref={authorHref}
              communityActionLabel={formatTemplate(copy.showCommunityJobs, {
                name: item.community.name || item.repository,
              })}
              authorActionLabel={formatTemplate(copy.showAuthorJobs, {
                handle: item.author.handle,
              })}
            />
            <Heading className="font-display mt-6 max-w-4xl text-[clamp(2rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-foreground [overflow-wrap:anywhere]">
              {item.title}
            </Heading>
            <div className="mt-6 border-y border-line py-4">
              <DrawerMetadata
                country={item.country}
                salaryLabel={salaryLabel}
                tags={item.tags}
                locale={locale}
              />
            </div>
            <div className="mt-8 max-w-[74ch]">
              <OpportunityMarkdown
                body={item.description}
                emptyDescription={copy.noDescription}
              />
            </div>
            <div className="mt-8 border-t border-line pt-6 lg:hidden">
              <DrawerTags tags={item.tags} locale={locale} />
            </div>
          </main>

          <aside className="hidden min-w-0 lg:block">
            <div className="sticky top-6 space-y-6 rounded-card border border-line bg-paper p-5 shadow-floating-sm">
              <DrawerMetadata
                postedAt={postedAt}
                updatedAt={updatedAt}
                companyName={item.companyName}
                locale={locale}
              />
              <DrawerTags tags={item.tags} locale={locale} />
              <div className="border-t border-line pt-5">{action}</div>
            </div>
          </aside>
        </div>
      </div>

      <footer className="z-20 shrink-0 border-t border-line bg-surface-elevated/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:px-6 lg:hidden">
        {action}
      </footer>
    </article>
  );
}
