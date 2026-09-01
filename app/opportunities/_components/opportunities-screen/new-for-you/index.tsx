"use client";

import * as React from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import { shouldShowNewForYou } from "./visibility";

interface NewForYouProps {
  previousVisitAt: string | null;
  hasPersistedPreferences: boolean;
  hasForcedScope: boolean;
  newOnly: boolean;
  onShowNew: () => void;
}

export function NewForYou({
  previousVisitAt,
  hasPersistedPreferences,
  hasForcedScope,
  newOnly,
  onShowNew,
}: NewForYouProps): React.ReactNode {
  const { messages } = useI18n();
  const copy = messages.opportunities.newForYou;
  const [dismissed, setDismissed] = React.useState(false);

  if (!shouldShowNewForYou({
    hasForcedScope,
    previousVisitAt,
    hasPersistedPreferences,
    newOnly,
    dismissed,
  })) {
    return null;
  }

  return (
    <aside className="relative overflow-hidden rounded-card border border-primary/25 bg-primary-soft/55 p-5 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
      <div className="flex min-w-0 gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
          <Sparkles className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 pr-8 sm:pr-0">
          <h2 className="font-display text-lg font-semibold tracking-[-0.02em] text-foreground">
            {copy.title}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            {copy.description}
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {copy.localNote}
          </p>
        </div>
      </div>
      <div className="mt-4 shrink-0 sm:mt-0">
        <Button type="button" onClick={onShowNew}>
          {copy.action}
        </Button>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2"
        aria-label={copy.dismiss}
        onClick={() => setDismissed(true)}
      >
        <X aria-hidden="true" />
      </Button>
    </aside>
  );
}
