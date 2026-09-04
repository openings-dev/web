"use client";

import Link from "next/link";
import * as React from "react";
import { LoaderCircle } from "lucide-react";
import { OpportunityDetails } from "@/app/opportunities/_components/opportunity-details";
import { OpportunityDetailsMode } from "@/app/opportunities/_components/opportunity-details/types";
import { OpportunitySelectionStatus } from "@/app/opportunities/_components/opportunities-screen/types";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import { fetchOpportunityById } from "@/lib/opportunities/api";
import { buildCommunityPath, buildUserPath } from "@/lib/opportunities/routing";
import type { OpportunityItem } from "@/lib/opportunities/types";

function jobIdFromLocation(): string | null {
  const segments = window.location.pathname.split("/").filter(Boolean);
  if (segments.length !== 2 || segments[0] !== "jobs") return null;
  try {
    return decodeURIComponent(segments[1] ?? "") || null;
  } catch {
    return null;
  }
}

export function ClientJobPage(): React.ReactNode {
  const { messages } = useI18n();
  const [item, setItem] = React.useState<OpportunityItem | null>(null);
  const [status, setStatus] = React.useState(OpportunitySelectionStatus.Loading);

  React.useEffect(() => {
    const id = jobIdFromLocation();
    if (!id) {
      queueMicrotask(() => setStatus(OpportunitySelectionStatus.NotFound));
      return;
    }

    let active = true;
    fetchOpportunityById(id)
      .then((opportunity) => {
        if (!active) return;
        setItem(opportunity);
        setStatus(opportunity
          ? OpportunitySelectionStatus.Ready
          : OpportunitySelectionStatus.NotFound);
      })
      .catch(() => {
        if (active) setStatus(OpportunitySelectionStatus.LoadError);
      });
    return () => { active = false; };
  }, []);

  if (item) {
    return (
      <OpportunityDetails
        item={item}
        mode={OpportunityDetailsMode.Page}
        shareUrl={window.location.href}
        communityHref={buildCommunityPath(item.repository)}
        authorHref={buildUserPath(item.author.handle)}
      />
    );
  }

  const loading = status === OpportunitySelectionStatus.Loading;
  const description = loading
    ? messages.opportunities.feedback.selectedLoading
    : status === OpportunitySelectionStatus.LoadError
      ? messages.opportunities.feedback.selectedLoadError
      : messages.opportunities.feedback.selectedNotFound;

  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center gap-5 px-4 py-16 text-center">
      {loading ? (
        <LoaderCircle
          className="size-6 animate-spin text-primary-deep motion-reduce:animate-none"
          aria-hidden="true"
        />
      ) : null}
      <p
        className="max-w-md text-sm leading-6 text-muted-foreground"
        role={loading ? "status" : "alert"}
        aria-live={loading ? "polite" : "assertive"}
      >
        {description}
      </p>
      {!loading ? <Button asChild><Link href="/opportunities">{messages.notFound.action}</Link></Button> : null}
    </section>
  );
}
