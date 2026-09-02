import type { MonthlyReportRanking } from "@/lib/reports/types";

interface RankingTableProps {
  title: string;
  items: MonthlyReportRanking[];
  locale: string;
  valueLabel: string;
}

export function RankingTable({ title, items, locale, valueLabel }: RankingTableProps): React.ReactNode {
  return (
    <section aria-labelledby={`${title.replaceAll(" ", "-")}-title`}>
      <h2 id={`${title.replaceAll(" ", "-")}-title`} className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-5 overflow-hidden rounded-card border border-line bg-paper">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-surface-muted text-xs text-muted-foreground">
            <tr><th className="px-4 py-3 font-semibold">#</th><th className="px-2 py-3 font-semibold">{title}</th><th className="px-4 py-3 text-right font-semibold">{valueLabel}</th></tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.label} className="border-t border-line">
                <td className="font-mono px-4 py-3 text-xs text-muted-foreground">{index + 1}</td>
                <th scope="row" className="px-2 py-3 font-medium">{item.label}</th>
                <td className="font-mono px-4 py-3 text-right">{item.openOpportunities.toLocaleString(locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
