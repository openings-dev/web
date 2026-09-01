import { Badge } from "@/components/ui/badge";
import type { OpportunityTrustSummary } from "@/lib/opportunities/trust";
import type { OpportunityItem } from "@/lib/opportunities/types";
import type { TranslationMessages } from "@/lib/translations/types";

interface DataConfidenceProps {
  item: OpportunityItem;
  summary: OpportunityTrustSummary;
  locale: string;
  copy: TranslationMessages["opportunities"]["card"]["dataConfidence"];
}

export function DataConfidence({ item, summary, locale, copy }: DataConfidenceProps) {
  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });
  const sources = item.sources?.length
    ? item.sources
    : [{ id: item.id, repository: item.repository, url: item.url }];

  return (
    <section className="mt-8 rounded-card border border-line bg-paper p-5" aria-labelledby="data-confidence-title">
      <h2 id="data-confidence-title" className="font-display text-xl font-semibold">{copy.title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.description}</p>
      {summary.stale ? (
        <p className="mt-4 rounded-control border border-warning-foreground/25 bg-warning px-4 py-3 text-sm text-warning-foreground">{copy.staleWarning}</p>
      ) : null}
      {summary.incomplete ? (
        <p className="mt-3 rounded-control border border-line bg-surface-muted px-4 py-3 text-sm text-muted-foreground">{copy.incompleteWarning}</p>
      ) : null}

      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs text-muted-foreground">{copy.lastVerified}</dt>
          <dd className="mt-1 font-medium">
            {summary.lastVerifiedAt
              ? <time dateTime={summary.lastVerifiedAt}>{formatter.format(new Date(summary.lastVerifiedAt))}</time>
              : copy.verificationUnavailable}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{copy.published}</dt>
          <dd className="mt-1 font-medium"><time dateTime={item.createdAt}>{formatter.format(new Date(item.createdAt))}</time></dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">{copy.sources}</dt>
          <dd className="mt-1 font-medium">{summary.sourceCount.toLocaleString(locale)}</dd>
        </div>
      </dl>

      <dl className="mt-5 grid gap-3 border-t border-line pt-5 sm:grid-cols-2">
        {summary.fields.map((field) => (
          <div key={field.field} className="flex flex-wrap items-center justify-between gap-3">
            <dt className="text-sm text-muted-foreground">{copy.fields[field.field]}</dt>
            <dd><Badge tone={field.provenance === "declared" ? "positive" : field.provenance === "inferred" ? "informational" : "neutral"}>{copy.states[field.provenance]}</Badge></dd>
          </div>
        ))}
      </dl>

      <ul className="mt-5 space-y-2 border-t border-line pt-5 text-sm">
        {sources.map((source) => (
          <li key={source.id}>
            <a href={source.url} target="_blank" rel="noreferrer" className="text-primary-deep underline-offset-4 hover:underline">
              {source.repository}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-xs leading-5 text-muted-foreground">{copy.originalAuthority}</p>
    </section>
  );
}
