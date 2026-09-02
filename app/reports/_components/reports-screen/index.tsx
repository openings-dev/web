"use client";

import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import type { ReportsScreenProps } from "./types";
import { ReportDetail } from "./report-detail";
import { ReportSummary } from "./report-summary";

export function ReportsScreen({ index, report, detail, unavailable }: ReportsScreenProps): React.ReactNode {
  const { locale, messages } = useI18n();
  const copy = messages.reportsPage;
  const period = report
    ? new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${report.period}-01T00:00:00.000Z`))
    : null;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="max-w-4xl">
        <p className="text-label font-semibold text-primary-deep">{copy.kicker}</p>
        <h1 className="font-display mt-3 text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.04] tracking-[-0.045em]">{detail && period ? copy.reportTitle.replace("{period}", period) : copy.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">{copy.description}</p>
      </header>

      {unavailable ? <section className="mt-10 border-t border-line pt-8"><h2 className="font-display text-2xl font-semibold">{copy.unavailableTitle}</h2><p className="mt-2 text-sm text-muted-foreground">{copy.unavailableDescription}</p></section> : null}
      {!unavailable && !index?.reports.length ? <section className="mt-10 border-t border-line pt-8"><h2 className="font-display text-2xl font-semibold">{copy.emptyTitle}</h2><p className="mt-2 text-sm text-muted-foreground">{copy.emptyDescription}</p></section> : null}
      {!unavailable && report && detail ? <ReportDetail report={report} locale={locale} copy={copy} /> : null}
      {!unavailable && report && !detail ? <div className="mt-10"><ReportSummary report={report} locale={locale} copy={copy} featured /></div> : null}
      {!unavailable && index && !detail && index.reports.length > 0 ? (
        <section className="mt-14" aria-labelledby="report-archive-title">
          <h2 id="report-archive-title" className="font-display text-3xl font-semibold">{copy.archiveTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{copy.archiveDescription}</p>
          <div className="mt-6" aria-label={copy.reportListLabel}>{index.reports.map((item) => <ReportSummary key={item.period} report={item} locale={locale} copy={copy} />)}</div>
        </section>
      ) : null}
    </main>
  );
}
