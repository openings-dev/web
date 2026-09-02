import Link from "next/link";
import { ArrowRight, BookOpen, Database } from "lucide-react";
import type { LocaleCode } from "@/lib/constants/locales";
import { PUBLIC_ROUTES } from "@/lib/navigation/routes";
import type { MonthlyReport } from "@/lib/reports/types";
import type { TranslationMessages } from "@/lib/translations/types";
import { RankingTable } from "../ranking-table";

interface ReportDetailProps {
  report: MonthlyReport;
  locale: LocaleCode;
  copy: TranslationMessages["reportsPage"];
}

export function ReportDetail({ report, locale, copy }: ReportDetailProps): React.ReactNode {
  const number = (value: number) => value.toLocaleString(locale);
  const totalSalary = report.salaryDisclosure.disclosed + report.salaryDisclosure.undisclosed;
  const generatedAt = new Intl.DateTimeFormat(locale, { dateStyle: "long", timeStyle: "short" }).format(new Date(report.generatedAt));

  return (
    <>
      <dl className="mt-10 grid border-y border-line sm:grid-cols-3 lg:grid-cols-5">
        {[
          [copy.openJobs, report.totals.openOpportunities], [copy.communities, report.totals.communities],
          [copy.repositories, report.totals.repositories], [copy.countries, report.totals.countries],
          [copy.regions, report.totals.regions],
        ].map(([label, value]) => (
          <div key={String(label)} className="border-b border-line px-1 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0 sm:last:border-r-0">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="font-mono mt-1 text-3xl font-semibold tracking-tight">{number(Number(value))}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Database aria-hidden="true" className="size-4" />{copy.snapshotLabel.replace("{date}", generatedAt)}</p>

      <div className="mt-14 grid gap-10 lg:grid-cols-2">
        <RankingTable title={copy.topCountries} items={report.topCountries} locale={locale} valueLabel={copy.openJobs} />
        <RankingTable title={copy.topTechnologies} items={report.topTechnologies} locale={locale} valueLabel={copy.openJobs} />
      </div>

      <div className="mt-14 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-panel border border-line bg-paper p-6 sm:p-8" aria-labelledby="work-models-title">
          <h2 id="work-models-title" className="font-display text-2xl font-semibold">{copy.workModels}</h2>
          <div className="mt-6 space-y-5">
            {report.workModels.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between gap-4 text-sm"><span className="font-medium">{item.label}</span><span className="font-mono">{number(item.openOpportunities)}</span></div>
                <div className="mt-2 h-2 overflow-hidden rounded-pill bg-surface-muted"><div className="h-full rounded-pill bg-primary" style={{ width: `${Math.min(100, (item.openOpportunities / report.totals.openOpportunities) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-panel border border-fresh-line bg-fresh-mint p-6 sm:p-8" aria-labelledby="salary-title">
          <p className="font-mono text-5xl font-semibold tracking-tight">{report.salaryDisclosure.percentage.toLocaleString(locale)}%</p>
          <h2 id="salary-title" className="font-display mt-4 text-2xl font-semibold">{copy.salaryDisclosure}</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy.salaryDescription.replace("{percentage}", report.salaryDisclosure.percentage.toLocaleString(locale)).replace("{disclosed}", number(report.salaryDisclosure.disclosed)).replace("{total}", number(totalSalary))}</p>
        </section>
      </div>

      <aside className="mt-14 flex flex-col gap-5 border-t border-line pt-8 sm:flex-row sm:items-end sm:justify-between" aria-labelledby="methodology-title">
        <div className="max-w-2xl"><BookOpen aria-hidden="true" className="size-5 text-primary-deep" /><h2 id="methodology-title" className="font-display mt-3 text-2xl font-semibold">{copy.methodologyTitle}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.methodologyDescription}</p></div>
        <div className="flex flex-wrap gap-3"><Link href={PUBLIC_ROUTES.methodology} className="inline-flex min-h-11 items-center px-4 text-sm font-semibold text-primary-deep underline-offset-4 hover:underline">{copy.methodologyLink}</Link><Link href={PUBLIC_ROUTES.home} className="inline-flex min-h-11 items-center gap-2 rounded-control bg-primary px-5 text-sm font-semibold text-primary-foreground">{copy.browseJobs}<ArrowRight aria-hidden="true" className="size-4" /></Link></div>
      </aside>
    </>
  );
}
