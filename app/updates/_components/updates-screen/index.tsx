"use client";

import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import type { RoadmapLane, UpdateEntry, UpdateKind } from "@/lib/updates/types";
import { UpdateCard } from "../update-card";
import { UpdatesTelemetry } from "../updates-telemetry";

interface UpdatesScreenProps {
  entries: UpdateEntry[];
}

export function UpdatesScreen({ entries }: UpdatesScreenProps) {
  const { locale, messages } = useI18n();
  const copy = messages.updatesPage;
  const byKind = (kind: UpdateKind) => entries.filter((entry) => entry.kind === kind);
  const changelog = byKind("changelog");
  const releases = byKind("release");
  const roadmap = byKind("roadmap");
  const sections = [
    ["changelog", copy.tabs.changelog],
    ["releases", copy.tabs.releases],
    ["roadmap", copy.tabs.roadmap],
  ] as const;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <UpdatesTelemetry />
      <header className="max-w-4xl">
        <p className="text-label font-semibold text-primary-deep">{copy.kicker}</p>
        <h1 className="font-display mt-3 text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.04] tracking-[-0.045em]">{copy.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">{copy.description}</p>
      </header>
      <nav className="sticky top-3 z-10 mt-8 flex w-fit max-w-full gap-1 overflow-x-auto rounded-pill border border-line bg-surface-elevated/95 p-1 shadow-floating-sm backdrop-blur" aria-label={copy.navigationLabel}>
        {sections.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="inline-flex min-h-10 shrink-0 items-center rounded-pill px-4 text-sm font-semibold text-muted-foreground hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{label}</a>
        ))}
      </nav>

      <section id="changelog" className="scroll-mt-24 border-t border-line pt-12 mt-14" aria-labelledby="changelog-title">
        <h2 id="changelog-title" className="font-display text-3xl font-semibold">{copy.sections.changelog.title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.sections.changelog.description}</p>
        {changelog.length ? <div className="mt-6 grid gap-4 lg:grid-cols-2">{changelog.map((entry) => <UpdateCard key={entry.id} entry={entry} locale={locale} copy={copy} />)}</div> : <p className="mt-6 text-sm text-muted-foreground">{copy.sections.changelog.empty}</p>}
      </section>

      <section id="releases" className="scroll-mt-24 border-t border-line pt-12 mt-14" aria-labelledby="releases-title">
        <h2 id="releases-title" className="font-display text-3xl font-semibold">{copy.sections.releases.title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.sections.releases.description}</p>
        {releases.length ? <div className="mt-6 grid gap-4">{releases.map((entry) => <UpdateCard key={entry.id} entry={entry} locale={locale} copy={copy} />)}</div> : <p className="mt-6 text-sm text-muted-foreground">{copy.sections.releases.empty}</p>}
      </section>

      <section id="roadmap" className="scroll-mt-24 border-t border-line pt-12 mt-14" aria-labelledby="roadmap-title">
        <h2 id="roadmap-title" className="font-display text-3xl font-semibold">{copy.sections.roadmap.title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy.sections.roadmap.description}</p>
        {roadmap.length ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {(["now", "next", "later"] as RoadmapLane[]).map((lane) => (
              <section key={lane} aria-labelledby={`roadmap-${lane}`}>
                <h3 id={`roadmap-${lane}`} className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{copy.lanes[lane]}</h3>
                <div className="mt-3 grid gap-4">{roadmap.filter((entry) => entry.kind === "roadmap" && entry.lane === lane).map((entry) => <UpdateCard key={entry.id} entry={entry} locale={locale} copy={copy} />)}</div>
              </section>
            ))}
          </div>
        ) : <p className="mt-6 text-sm text-muted-foreground">{copy.sections.roadmap.empty}</p>}
      </section>
    </main>
  );
}
