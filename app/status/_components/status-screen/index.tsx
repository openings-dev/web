"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import type { StaticCommunityStatus, StaticCommunityStatusHistory, StaticCommunityStatusItem } from "@/lib/opportunities/api-types";
import { StatusTelemetry } from "../status-telemetry";
import { StatusHistory } from "../status-history";

interface StatusScreenProps {
  status: StaticCommunityStatus | null;
  history: StaticCommunityStatusHistory | null;
}

export function StatusScreen({ status, history }: StatusScreenProps): React.ReactNode {
  const { locale, messages } = useI18n();
  const copy = messages.statusPage;
  const formatter = React.useMemo(() => new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }), [locale]);
  const date = React.useCallback((value: string | null) =>
    value ? formatter.format(new Date(value)) : copy.unavailable, [copy.unavailable, formatter]);
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<"community" | "state" | "sync" | "jobs" | "post">("community");
  const visibleItems = React.useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale);
    const items = status?.items.filter((item) => !normalized ||
      `${item.name} ${item.repository} ${item.country} ${item.region}`.toLocaleLowerCase(locale).includes(normalized)) ?? [];
    const timestamp = (value: string | null) => Number.isFinite(Date.parse(value ?? "")) ? Date.parse(value ?? "") : -1;
    return [...items].sort((left, right) => {
      if (sort === "state") return left.state.localeCompare(right.state) || left.repository.localeCompare(right.repository);
      if (sort === "sync") return timestamp(right.lastSuccessfulSyncAt) - timestamp(left.lastSuccessfulSyncAt) || left.repository.localeCompare(right.repository);
      if (sort === "jobs") return right.openOpportunities - left.openOpportunities || left.repository.localeCompare(right.repository);
      if (sort === "post") return timestamp(right.lastPostedAt) - timestamp(left.lastPostedAt) || left.repository.localeCompare(right.repository);
      return left.repository.localeCompare(right.repository);
    });
  }, [locale, query, sort, status]);
  const statusBadge = (item: StaticCommunityStatusItem) => (
    <Badge tone={item.state === "healthy" ? "positive" : item.state === "error" ? "neutral" : "informational"}>
      {copy.states[item.state]}
    </Badge>
  );

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <StatusTelemetry health={!status ? "unavailable" : status.totals.errors > 0 ? "partial" : "healthy"} />
      <header className="max-w-3xl">
        <p className="text-label font-semibold text-primary-deep">{copy.kicker}</p>
        <h1 className="font-display mt-3 text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.04] tracking-[-0.045em]">{copy.title}</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">{copy.description}</p>
      </header>
      {!status ? (
        <p className="mt-10 rounded-card border border-line bg-surface-muted p-6 text-sm text-muted-foreground" role="alert">{copy.loadError}</p>
      ) : (
        <>
          <dl className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [copy.communities, status.totals.communities],
              [copy.healthy, status.totals.healthy],
              [copy.noOpenings, status.totals.noOpenings],
              [copy.errors, status.totals.errors],
            ].map(([label, value]) => (
              <div key={String(label)} className="border-t border-line pt-4">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-2xl font-semibold">{Number(value).toLocaleString(locale)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-xs text-muted-foreground">{copy.generatedAt}: {date(status.generatedAt)}</p>
          <StatusHistory history={history} locale={locale} copy={copy.history} />
          <div className="mt-6 flex flex-col gap-3 rounded-card border border-line bg-paper p-4 sm:flex-row sm:items-end sm:justify-between">
            <label className="grid flex-1 gap-1.5 text-xs font-semibold text-muted-foreground">
              {copy.searchLabel}
              <span className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" aria-hidden="true" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.searchPlaceholder}
                  className="min-h-11 w-full rounded-control border border-control bg-surface pl-9 pr-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" />
              </span>
            </label>
            <label className="grid gap-1.5 text-xs font-semibold text-muted-foreground">
              {copy.sortLabel}
              <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}
                className="min-h-11 rounded-control border border-control bg-surface px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring">
                <option value="community">{copy.community}</option>
                <option value="state">{copy.state}</option>
                <option value="sync">{copy.lastSync}</option>
                <option value="jobs">{copy.openJobs}</option>
                <option value="post">{copy.lastPost}</option>
              </select>
            </label>
          </div>
          <p className="mt-3 text-xs text-muted-foreground" role="status">{visibleItems.length.toLocaleString(locale)} {copy.communities.toLocaleLowerCase(locale)}</p>
          <div className="mt-4 hidden overflow-x-auto rounded-card border border-line bg-paper md:block">
            <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
              <thead className="bg-surface-muted text-xs text-muted-foreground">
                <tr>{[copy.community, copy.state, copy.lastSync, copy.openJobs, copy.lastPost].map((label) => <th key={label} className="px-4 py-3 font-semibold">{label}</th>)}</tr>
              </thead>
              <tbody>
                {visibleItems.map((item) => (
                  <tr key={item.repository} className="border-t border-line">
                    <td className="px-4 py-3"><a href={item.repositoryUrl} target="_blank" rel="noreferrer" className="font-medium text-primary-deep hover:underline">{item.repository}</a></td>
                    <td className="px-4 py-3">{statusBadge(item)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{date(item.lastSuccessfulSyncAt)}</td>
                    <td className="px-4 py-3 font-medium">{item.openOpportunities.toLocaleString(locale)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{date(item.lastPostedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-4 grid gap-3 md:hidden">
            {visibleItems.map((item) => (
              <li key={item.repository} className="rounded-card border border-line bg-paper p-4">
                <a href={item.repositoryUrl} target="_blank" rel="noreferrer" className="font-semibold text-primary-deep hover:underline">{item.repository}</a>
                <dl className="mt-4 grid gap-3 text-sm">
                  {[
                    [copy.state, statusBadge(item)],
                    [copy.lastSync, date(item.lastSuccessfulSyncAt)],
                    [copy.openJobs, item.openOpportunities.toLocaleString(locale)],
                    [copy.lastPost, date(item.lastPostedAt)],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="grid grid-cols-[minmax(7rem,0.45fr)_minmax(0,1fr)] gap-3 border-t border-line pt-3 first:border-0 first:pt-0">
                      <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
                      <dd className="min-w-0 text-foreground">{value}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
