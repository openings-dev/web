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
import { formatTemplate } from "@/lib/utils/format-template";
import { buildOpportunityReportMailto } from "@/lib/opportunities/report-problem";
import { readCandidateState, updateCandidateState } from "@/lib/opportunities/local-candidate-state";
import * as React from "react";
import { cn } from "@/lib/utils/tailwind";
import { trackProductEvent } from "@/lib/telemetry";
import { buildOpportunityTrustSummary } from "@/lib/opportunities/trust";
import { DataConfidence } from "./data-confidence";
import { SimilarOpportunities } from "./similar-opportunities";
import {
  OpportunityDetailsMode,
  type OpportunityDetailsProps,
} from "./types";

const viewedJobs = new Set<string>();

function ageBucket(item: OpportunityDetailsProps["item"]) {
  const age = item.freshness?.ageDays ?? Math.max(0, Math.floor(
    (Date.now() - Date.parse(item.createdAt)) / (24 * 60 * 60 * 1000),
  ));
  if (age <= 7) return "0-7" as const;
  if (age <= 30) return "8-30" as const;
  if (age <= 90) return "31-90" as const;
  return "91+" as const;
}

function savedCountBucket(count: number) {
  if (count === 0) return "0" as const;
  if (count <= 5) return "1-5" as const;
  if (count <= 20) return "6-20" as const;
  return "21+" as const;
}

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
  isSaved,
  onToggleSaved,
  trustSummary,
  similarItems = [],
}: OpportunityDetailsProps): React.ReactNode {
  const { locale, messages } = useI18n();
  const copy = messages.opportunities.card;
  const [localSaved, setLocalSaved] = React.useState(false);
  const sourceCount = item.deduplication?.sourceCount ?? item.sources?.length ?? 1;
  const confidence = trustSummary ?? buildOpportunityTrustSummary(item, null);
  React.useEffect(() => {
    if (specimenMode || viewedJobs.has(item.id)) return;
    viewedJobs.add(item.id);
    trackProductEvent("Job Viewed", {
      jobId: item.id,
      age: ageBucket(item),
      sourceCount,
    });
  }, [item, sourceCount, specimenMode]);
  React.useEffect(() => {
    if (isSaved !== undefined) return;
    let active = true;
    queueMicrotask(() => {
      if (active) setLocalSaved(Boolean(readCandidateState().saved[item.id]));
    });
    return () => { active = false; };
  }, [isSaved, item.id]);
  const saved = isSaved ?? localSaved;
  const handleToggleSaved = () => {
    const stored = readCandidateState();
    const currentlySaved = Boolean(stored.saved[item.id]);
    const nextSavedCount = Math.max(
      0,
      Object.keys(stored.saved).length + (currentlySaved ? -1 : 1),
    );
    if (onToggleSaved) {
      onToggleSaved(item.id);
    } else {
      const nextSaved = !localSaved;
      setLocalSaved(nextSaved);
      updateCandidateState((state) => {
        const next = { ...state.saved };
        if (nextSaved) next[item.id] = new Date().toISOString();
        else delete next[item.id];
        return { ...state, saved: next };
      });
    }
    trackProductEvent("Job Saved", {
      jobId: item.id,
      savedCount: savedCountBucket(nextSavedCount),
    });
  };
  const handleOpenOriginal = () => {
    trackProductEvent("Original Listing Opened", {
      jobId: item.id,
      sourceCount,
    });
  };
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
  const reportUrl = buildOpportunityReportMailto({
    title: `${copy.reportProblem}: ${item.title}`,
    canonicalUrl: shareUrl,
    primarySourceUrl: item.url,
    prompt: copy.reportProblemPrompt,
    categories: [
      copy.reportCategories.closed,
      copy.reportCategories.duplicate,
      copy.reportCategories.location,
      copy.reportCategories.content,
    ],
  });
  const sourceList = (item.sources?.length ?? 0) > 1 ? (
    <div className="border-t border-line pt-5">
      <h3 className="text-xs font-semibold text-foreground">{copy.allSources}</h3>
      <ul className="mt-2 space-y-2 text-xs">
        {item.sources?.map((source) => (
          <li key={source.id}>
            <a href={source.url} target="_blank" rel="noreferrer"
              className="text-primary-deep underline-offset-4 hover:underline">
              {source.repository}
            </a>
          </li>
        ))}
      </ul>
    </div>
  ) : null;
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
      reportLabel={copy.reportProblem}
      reportUrl={reportUrl}
      saveLabel={saved ? copy.unsave : copy.save}
      isSaved={saved}
      onToggleSaved={handleToggleSaved}
      onOpenOriginal={handleOpenOriginal}
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
            <p className="mb-4 text-label font-semibold text-primary-deep">
              {copy.detailsTitle}
            </p>
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
                country={item.jobLocation?.displayText}
                salaryLabel={salaryLabel}
                tags={item.tags}
                locale={locale}
              />
            </div>
            <DataConfidence
              item={item}
              summary={confidence}
              locale={locale}
              copy={copy.dataConfidence}
            />
            <div className="mt-8 max-w-[74ch]">
              <OpportunityMarkdown
                body={item.description}
                emptyDescription={copy.noDescription}
              />
            </div>
            <div className="mt-8 border-t border-line pt-6 lg:hidden">
              <DrawerTags tags={item.tags} locale={locale} />
              {sourceList}
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
              {sourceList}
              <div className="border-t border-line pt-5">{action}</div>
            </div>
          </aside>
        </div>
      </div>

      {!isDialog ? <SimilarOpportunities items={similarItems} copy={copy.similar} /> : null}

      <footer className="z-20 shrink-0 border-t border-line bg-surface-elevated/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:px-6 lg:hidden">
        {action}
      </footer>
    </article>
  );
}
