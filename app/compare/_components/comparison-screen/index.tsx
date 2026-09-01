"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import { Button } from "@/components/ui/button";
import { formatSalary } from "@/app/opportunities/_components/opportunities-screen/shared/format-salary";
import { fetchOpportunityById } from "@/lib/opportunities/api";
import { buildComparisonHref, parseComparisonIds } from "@/lib/opportunities/comparison";
import type { OpportunityItem } from "@/lib/opportunities/types";

function valueOrUnknown(value: React.ReactNode, unknown: string) {
  return value === null || value === undefined || value === "" ? unknown : value;
}

export function ComparisonScreen(): React.ReactNode {
  const searchParams = useSearchParams();
  const { locale, messages } = useI18n();
  const copy = messages.opportunities.comparison;
  const ids = React.useMemo(() => parseComparisonIds(searchParams.get("jobs")), [searchParams]);
  const requestKey = ids.join(",");
  const [result, setResult] = React.useState<{
    key: string;
    items: OpportunityItem[];
    failed: boolean;
  } | null>(null);

  React.useEffect(() => {
    let active = true;
    Promise.allSettled(ids.map((id) => fetchOpportunityById(id))).then((results) => {
      if (!active) return;
      const available = results.flatMap((result) =>
        result.status === "fulfilled" && result.value ? [result.value] : []);
      setResult({
        key: requestKey,
        items: available,
        failed: results.some((result) => result.status === "rejected"),
      });
    });
    return () => { active = false; };
  }, [ids, requestKey]);
  const items = result?.key === requestKey ? result.items : [];
  const failed = result?.key === requestKey ? result.failed : false;
  const loading = ids.length > 0 && result?.key !== requestKey;

  const date = React.useMemo(() => new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "UTC",
  }), [locale]);
  const salary = React.useCallback((item: OpportunityItem) => formatSalary(item.salary, locale, {
    month: messages.opportunities.card.salaryPeriodMonth,
    year: messages.opportunities.card.salaryPeriodYear,
    hour: messages.opportunities.card.salaryPeriodHour,
    from: messages.opportunities.card.salaryFrom,
    upTo: messages.opportunities.card.salaryUpTo,
    range: messages.opportunities.card.salaryRange,
  }), [locale, messages.opportunities.card]);
  const removeHref = (id: string) => buildComparisonHref(items.filter((item) => item.id !== id).map((item) => item.id));

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary-deep hover:underline">
        <ArrowLeft className="size-4" aria-hidden="true" />{messages.header.nav.discover}
      </Link>
      <header className="mt-6 max-w-3xl">
        <p className="text-label font-semibold text-primary-deep">{messages.opportunities.header.kicker}</p>
        <h1 className="font-display mt-3 text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.04] tracking-[-0.045em]">{copy.title}</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">{copy.selectMore}</p>
      </header>

      {loading ? <p className="mt-10" role="status">{messages.opportunities.feedback.selectedLoading}</p> : null}
      {!loading && failed && items.length === 0 ? <p className="mt-10" role="alert">{messages.opportunities.feedback.selectedLoadError}</p> : null}
      {!loading && items.length < 2 ? (
        <div className="mt-10 rounded-card border border-line bg-surface-muted p-6">
          <p className="text-sm text-muted-foreground">{copy.selectMore}</p>
          <Button asChild className="mt-4"><Link href="/">{messages.header.nav.discover}</Link></Button>
        </div>
      ) : null}

      {items.length >= 2 ? (
        <div className="mt-10 overflow-x-auto rounded-card border border-line bg-paper">
          <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
            <thead className="bg-surface-muted">
              <tr>
                <th className="w-44 px-4 py-4 text-xs font-semibold text-muted-foreground">{copy.title}</th>
                {items.map((item) => (
                  <th key={item.id} className="min-w-64 px-4 py-4 align-top">
                    <p className="text-base font-semibold [overflow-wrap:anywhere]">{item.title}</p>
                    <p className="mt-1 text-xs font-normal text-muted-foreground">{item.companyName ?? item.community.name}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline"><a href={item.url} target="_blank" rel="noreferrer">{messages.opportunities.card.openOriginal}<ExternalLink className="size-3.5" /></a></Button>
                      <Button asChild size="sm" variant="ghost"><Link href={removeHref(item.id)}>{messages.opportunities.card.removeFromComparison}</Link></Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                [copy.salary, (item: OpportunityItem) => salary(item)],
                [copy.location, (item: OpportunityItem) => item.jobLocation?.displayText],
                [messages.opportunities.filters.workModeLabel, (item: OpportunityItem) => item.jobLocation?.workModel],
                [copy.stack, (item: OpportunityItem) => item.taxonomy?.technologies.join(", ")],
                [copy.level, (item: OpportunityItem) => item.taxonomy?.seniority.join(", ")],
                [messages.communities.header.title, (item: OpportunityItem) => item.community.name],
                [messages.opportunities.card.oldBadge, (item: OpportunityItem) => item.freshness?.status],
                [copy.date, (item: OpportunityItem) => date.format(new Date(item.createdAt))],
                [messages.opportunities.card.allSources, (item: OpportunityItem) => (item.sources ?? []).map((source) => source.repository).join(", ") || item.repository],
              ].map(([label, getter]) => (
                <tr key={String(label)} className="border-t border-line">
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">{String(label)}</th>
                  {items.map((item) => <td key={item.id} className="px-4 py-3 align-top">{valueOrUnknown((getter as (item: OpportunityItem) => React.ReactNode)(item), copy.unknown)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
