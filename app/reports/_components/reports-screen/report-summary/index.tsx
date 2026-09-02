import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { LocaleCode } from "@/lib/constants/locales";
import type { MonthlyReportSummary } from "@/lib/reports/types";
import type { TranslationMessages } from "@/lib/translations/types";

interface ReportSummaryProps {
  report: MonthlyReportSummary;
  locale: LocaleCode;
  copy: TranslationMessages["reportsPage"];
  featured?: boolean;
}

export function ReportSummary({ report, locale, copy, featured }: ReportSummaryProps): React.ReactNode {
  const period = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${report.period}-01T00:00:00.000Z`));
  const count = (value: number) => value.toLocaleString(locale);

  return (
    <article className={featured ? "rounded-panel border border-fresh-line bg-fresh-mint p-6 sm:p-8" : "border-t border-line py-6"}>
      <p className="text-label font-semibold text-primary-deep">{featured ? copy.latestReport : period}</p>
      <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{copy.reportTitle.replace("{period}", period)}</h2>
      <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4">
        {[
          [copy.openJobs, report.totals.openOpportunities],
          [copy.communities, report.totals.communities],
          [copy.repositories, report.totals.repositories],
          [copy.countries, report.totals.countries],
        ].map(([label, value]) => (
          <div key={String(label)}>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="font-mono mt-1 text-xl font-semibold">{count(Number(value))}</dd>
          </div>
        ))}
      </dl>
      <Link href={`/reports/${report.period}`} className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary-deep underline-offset-4 hover:underline">
        {copy.viewReport}<ArrowUpRight aria-hidden="true" className="size-4" />
      </Link>
    </article>
  );
}
