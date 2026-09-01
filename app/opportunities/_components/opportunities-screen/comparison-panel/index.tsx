import { Columns3, X } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { buildComparisonHref } from "@/lib/opportunities/comparison";
import type { OpportunityItem } from "@/lib/opportunities/types";
import { formatSalary } from "@/app/opportunities/_components/opportunities-screen/shared/format-salary";
import { trackProductEvent } from "@/lib/telemetry";

interface ComparisonPanelProps {
  items: OpportunityItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function ComparisonPanel({ items, onRemove, onClear }: ComparisonPanelProps): React.ReactNode {
  const { locale, messages } = useI18n();
  if (items.length === 0) return null;
  const copy = messages.opportunities.comparison;
  const trackComparisonOpened = () => {
    const possibleFacts = items.length * 4;
    const facts = items.reduce((count, item) => count + [
      item.salary,
      item.jobLocation?.displayText,
      item.taxonomy?.technologies.length,
      item.taxonomy?.seniority.length,
    ].filter(Boolean).length, 0);
    const ratio = possibleFacts === 0 ? 0 : facts / possibleFacts;
    trackProductEvent("Comparison Opened", {
      jobCount: items.length === 3 ? 3 : 2,
      completeness: ratio >= 0.8 ? "high" : ratio >= 0.5 ? "medium" : "low",
    });
  };

  return (
    <aside className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-6xl rounded-floating border border-line bg-surface-elevated p-4 shadow-floating-lg sm:inset-x-6"
      aria-label={copy.title}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Columns3 className="size-4 text-primary-deep" aria-hidden="true" />
          <h2 className="text-sm font-semibold">{copy.title}</h2>
          <span className="text-xs text-muted-foreground">{copy.selected.replace("{count}", items.length.toLocaleString(locale))}</span>
        </div>
        <div className="flex items-center gap-2">
          {items.length >= 2 ? <Button asChild size="sm"><Link onClick={trackComparisonOpened} href={buildComparisonHref(items.map((item) => item.id))}>{copy.title}</Link></Button> : null}
          <Button type="button" size="sm" variant="ghost" onClick={onClear}>{copy.clear}</Button>
        </div>
      </div>
      {items.length < 2 ? (
        <p className="text-xs text-muted-foreground">{copy.selectMore}</p>
      ) : (
        <div className="grid gap-3 overflow-x-auto" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(15rem, 1fr))` }}>
          {items.map((item) => (
            <article key={item.id} className="relative min-w-0 border-t border-line pt-3">
              <button type="button" className="absolute right-0 top-2 inline-flex size-8 items-center justify-center rounded-control text-muted-foreground hover:bg-surface-muted"
                aria-label={messages.opportunities.card.removeFromComparison} onClick={() => onRemove(item.id)}>
                <X className="size-4" aria-hidden="true" />
              </button>
              <h3 className="pr-10 text-sm font-semibold [overflow-wrap:anywhere]">{item.title}</h3>
              <dl className="mt-2 grid gap-1 text-xs text-muted-foreground">
                <div><dt className="inline font-medium text-foreground">{copy.salary}: </dt><dd className="inline">{formatSalary(item.salary, locale, {
                  month: messages.opportunities.card.salaryPeriodMonth,
                  year: messages.opportunities.card.salaryPeriodYear,
                  hour: messages.opportunities.card.salaryPeriodHour,
                  from: messages.opportunities.card.salaryFrom,
                  upTo: messages.opportunities.card.salaryUpTo,
                  range: messages.opportunities.card.salaryRange,
                }) || copy.unknown}</dd></div>
                <div><dt className="inline font-medium text-foreground">{copy.location}: </dt><dd className="inline">{item.jobLocation?.displayText ?? copy.unknown}</dd></div>
                <div><dt className="inline font-medium text-foreground">{copy.stack}: </dt><dd className="inline">{item.taxonomy?.technologies.slice(0, 4).join(", ") || copy.unknown}</dd></div>
                <div><dt className="inline font-medium text-foreground">{copy.level}: </dt><dd className="inline">{item.taxonomy?.seniority.join(", ") || copy.unknown}</dd></div>
                <div><dt className="inline font-medium text-foreground">{copy.date}: </dt><dd className="inline">{new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(item.createdAt))}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </aside>
  );
}
