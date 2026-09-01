import { Badge } from "@/components/ui/badge";
import type { LocaleCode } from "@/lib/constants/locales";
import type { TranslationMessages } from "@/lib/translations/types";
import type { UpdateEntry } from "@/lib/updates/types";

interface UpdateCardProps {
  entry: UpdateEntry;
  locale: LocaleCode;
  copy: TranslationMessages["updatesPage"];
}

export function UpdateCard({ entry, locale, copy }: UpdateCardProps) {
  const content = entry.copy[locale];
  const formattedDate = entry.kind === "roadmap" ? null : new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${entry.date}T00:00:00.000Z`));

  return (
    <article id={`update-${entry.id}`} className="scroll-mt-24 rounded-card border border-line bg-paper p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="informational">{copy.categories[entry.category]}</Badge>
        {entry.kind === "release" ? <Badge tone="primary">{copy.versionLabel} {entry.version}</Badge> : null}
        {entry.kind === "roadmap" ? <Badge tone="neutral">{copy.lanes[entry.lane]}</Badge> : null}
      </div>
      <h3 className="font-display mt-4 text-xl font-semibold tracking-tight">{content.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{content.summary}</p>
      {formattedDate ? (
        <p className="mt-4 text-xs text-muted-foreground">
          {copy.dateLabel}: <time dateTime={entry.date}>{formattedDate}</time>
        </p>
      ) : null}
      {entry.href ? (
        <a href={entry.href} className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-primary-deep underline-offset-4 hover:underline">
          {copy.learnMore}
        </a>
      ) : null}
    </article>
  );
}
