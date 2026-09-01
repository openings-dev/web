import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { buildOpportunityPath } from "@/lib/opportunities/routing";
import type { OpportunityItem } from "@/lib/opportunities/types";
import type { TranslationMessages } from "@/lib/translations/types";

interface SimilarOpportunitiesProps {
  items: OpportunityItem[];
  copy: TranslationMessages["opportunities"]["card"]["similar"];
}

export function SimilarOpportunities({ items, copy }: SimilarOpportunitiesProps) {
  if (items.length === 0) return null;
  return (
    <section className="mx-auto w-full max-w-7xl border-t border-line px-4 py-10 sm:px-6 lg:px-8" aria-labelledby="similar-jobs-title">
      <h2 id="similar-jobs-title" className="font-display text-2xl font-semibold">{copy.title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{copy.description}</p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const freshness = item.freshness?.status;
          const freshnessLabel = freshness ? copy.freshness[freshness] : copy.freshness.unknown;
          return (
          <li key={item.id} className="rounded-card border border-line bg-paper p-4">
            <Badge
              size="compact"
              tone={freshness === "fresh" ? "positive" : freshness === "aging" ? "warning" : "neutral"}
            >
              {freshnessLabel}
            </Badge>
            <p className="mt-2 text-xs font-semibold text-muted-foreground">{item.companyName ?? item.community.name ?? item.repository}</p>
            <h3 className="font-display mt-2 text-lg font-semibold leading-snug">{item.title}</h3>
            <p className="mt-3 text-xs text-muted-foreground">{item.jobLocation?.displayText ?? copy.locationUnavailable}</p>
            <Link href={buildOpportunityPath(item.id)} className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-primary-deep underline-offset-4 hover:underline">{copy.viewJob}</Link>
          </li>
          );
        })}
      </ul>
    </section>
  );
}
