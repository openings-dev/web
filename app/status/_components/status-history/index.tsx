import { Badge } from "@/components/ui/badge";
import type {
  StaticCommunityStatusHistory,
  StaticCommunityStatusHistoryDay,
} from "@/lib/opportunities/api-types";
import type { TranslationMessages } from "@/lib/translations/types";

interface StatusHistoryProps {
  history: StaticCommunityStatusHistory | null;
  locale: string;
  copy: TranslationMessages["statusPage"]["history"];
}

const DAY_MS = 24 * 60 * 60 * 1_000;

function template(value: string, fields: Record<string, string | number>) {
  return Object.entries(fields).reduce(
    (result, [key, field]) => result.replaceAll(`{${key}}`, String(field)),
    value,
  );
}

function duration(value: number, locale: string) {
  const seconds = Math.max(0, Math.round(value / 1_000));
  if (seconds < 60) return new Intl.NumberFormat(locale, {
    style: "unit", unit: "second", unitDisplay: "short",
  }).format(seconds);
  return new Intl.NumberFormat(locale, {
    style: "unit", unit: "minute", unitDisplay: "short", maximumFractionDigits: 1,
  }).format(seconds / 60);
}

function lastThirtyDays(
  history: StaticCommunityStatusHistory,
): Array<{ date: string; item: StaticCommunityStatusHistoryDay | null }> {
  const byDate = new Map(history.days.map((item) => [item.date, item]));
  const end = Date.parse(`${history.generatedAt.slice(0, 10)}T00:00:00.000Z`);
  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date(end - (29 - index) * DAY_MS).toISOString().slice(0, 10);
    return { date, item: byDate.get(date) ?? null };
  });
}

export function StatusHistory({ history, locale, copy }: StatusHistoryProps) {
  if (!history) {
    return (
      <section className="mt-10 rounded-card border border-line bg-surface-muted p-6" aria-labelledby="sync-history-title">
        <h2 id="sync-history-title" className="font-display text-xl font-semibold">{copy.title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.noHistory}</p>
      </section>
    );
  }

  const dates = lastThirtyDays(history);
  const daysWithPartial = history.days.filter((day) => day.partialRuns > 0).length;
  const failureOccurrences = history.days.reduce((total, day) => total + day.failedCommunityRuns, 0);
  const recent = history.runs.slice(0, 3);
  const latestPartial = recent[0]?.outcome === "partial";
  const recurring = recent.filter((run) => run.outcome === "partial").length >= 2;
  const dateTime = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium", timeStyle: "short", timeZone: "UTC",
  });

  return (
    <section className="mt-10 border-t border-line pt-10" aria-labelledby="sync-history-title">
      <div className="max-w-3xl">
        <p className="text-label font-semibold text-primary-deep">{copy.last30Days}</p>
        <h2 id="sync-history-title" className="font-display mt-2 text-2xl font-semibold">{copy.title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.description}</p>
        {latestPartial ? (
          <p className="mt-4 rounded-control border border-warning-foreground/25 bg-warning px-4 py-3 text-sm text-warning-foreground">
            {recurring ? copy.recurring : copy.isolated}
          </p>
        ) : null}
      </div>

      <div className="mt-6 rounded-card border border-line bg-paper p-5">
        <div className="grid h-20 grid-cols-[repeat(30,minmax(0,1fr))] items-end gap-1" role="group" aria-label={copy.last30Days}>
          {dates.map(({ date, item }) => {
            const ratio = item && item.runs > 0 ? item.partialRuns / item.runs : 0;
            const label = template(copy.daySummary, {
              date,
              partial: item?.partialRuns ?? 0,
              runs: item?.runs ?? 0,
              failures: item?.failedCommunityRuns ?? 0,
            });
            return (
              <span key={date} role="img" className="relative h-full overflow-hidden rounded-pill bg-surface-muted" aria-label={label}>
                {ratio > 0 ? (
                  <span className="absolute inset-x-0 bottom-0 rounded-pill bg-warning-foreground" style={{ height: `${Math.max(8, ratio * 100)}%` }} />
                ) : null}
              </span>
            );
          })}
        </div>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-muted-foreground">{copy.daysWithPartial}</dt><dd className="mt-1 font-semibold">{daysWithPartial.toLocaleString(locale)}</dd></div>
          <div><dt className="text-muted-foreground">{copy.failuresObserved}</dt><dd className="mt-1 font-semibold">{failureOccurrences.toLocaleString(locale)}</dd></div>
        </dl>
        {daysWithPartial === 0 ? <p className="mt-4 text-sm text-muted-foreground">{copy.noPartialDays}</p> : null}
      </div>

      <h3 className="mt-8 text-sm font-semibold">{copy.recentRuns}</h3>
      <ul className="mt-3 grid gap-3">
        {history.runs.slice(0, 12).map((run) => (
          <li key={run.completedAt} className="rounded-card border border-line bg-paper p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <time dateTime={run.completedAt} className="text-sm font-semibold">{dateTime.format(new Date(run.completedAt))}</time>
              <Badge tone={run.outcome === "healthy" ? "positive" : "warning"}>{run.outcome === "healthy" ? copy.healthy : copy.partial}</Badge>
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
              <div><dt className="text-xs text-muted-foreground">{copy.duration}</dt><dd className="mt-1 font-medium">{duration(run.durationMs, locale)}</dd></div>
              <div><dt className="text-xs text-muted-foreground">{copy.synchronized}</dt><dd className="mt-1 font-medium">{run.successful.toLocaleString(locale)} / {run.communities.toLocaleString(locale)}</dd></div>
              <div><dt className="text-xs text-muted-foreground">{copy.failedCommunities}</dt><dd className="mt-1 font-medium">{run.failed.toLocaleString(locale)}</dd></div>
              <div><dt className="text-xs text-muted-foreground">{copy.openJobs}</dt><dd className="mt-1 font-medium">{run.openOpportunities.toLocaleString(locale)}</dd></div>
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}
