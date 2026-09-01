"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { badgeVariants } from "@/components/ui/badge/constants";
import { formatTemplate } from "@/lib/utils/format-template";
import { cn } from "@/lib/utils/tailwind";
import type {
  ActiveOpportunityFilter,
  ActiveOpportunityFilterKind,
} from "@/app/opportunities/_components/opportunities-screen/types";

interface ActiveFilterListProps {
  items: ActiveOpportunityFilter[];
  clearAllLabel: string;
  removeFilterLabel: string;
  onRemove: (item: ActiveOpportunityFilter) => void;
  onClearAll: () => void;
  fallbackFocusId: string;
}

const FILTER_TONES = {
  search: "neutral",
  repository: "primary",
  region: "positive",
  country: "positive",
  stack: "informational",
  "advanced-tag": "primary",
  author: "neutral",
  sort: "informational",
  "work-model": "positive",
  area: "informational",
  technology: "informational",
  "technology-match": "informational",
  seniority: "primary",
  employment: "neutral",
  language: "neutral",
  freshness: "positive",
  salary: "positive",
  saved: "primary",
  new: "primary",
} as const satisfies Record<
  ActiveOpportunityFilterKind,
  "neutral" | "positive" | "informational" | "primary"
>;

export function ActiveFilterList({
  items,
  clearAllLabel,
  removeFilterLabel,
  onRemove,
  onClearAll,
  fallbackFocusId,
}: ActiveFilterListProps): React.ReactNode {
  const moveFocusAfterMutation = React.useCallback(
    (fallbackTarget: HTMLElement | null) => {
      window.requestAnimationFrame(() => {
        if (fallbackTarget?.isConnected) {
          fallbackTarget.focus();
          return;
        }

        document.getElementById(fallbackFocusId)?.focus();
      });
    },
    [fallbackFocusId],
  );

  return (
    <div className="mt-3 flex min-w-0 flex-col items-stretch gap-2 border-t border-line pt-3 sm:flex-row sm:items-start">
      {items.length > 0 ? (
        <ul className="flex min-w-0 flex-1 flex-wrap gap-2">
          {items.map((item, index) => (
            <li key={item.id} className="min-w-0 max-w-full">
              <button
                type="button"
                className={cn(
                  badgeVariants({ tone: FILTER_TONES[item.kind] }),
                  "min-h-11 min-w-0 max-w-full cursor-pointer touch-manipulation justify-center px-3 text-left transition-colors hover:border-primary/35 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
                aria-label={formatTemplate(removeFilterLabel, {
                  label: item.label,
                })}
                title={item.label}
                onClick={(event) => {
                  const list = event.currentTarget.closest("ul");
                  const buttons = list
                    ? Array.from(list.querySelectorAll<HTMLButtonElement>("button"))
                    : [];
                  const fallbackTarget = buttons[index + 1] ?? buttons[index - 1] ?? null;
                  onRemove(item);
                  moveFocusAfterMutation(fallbackTarget);
                }}
              >
                <span className="truncate">{item.label}</span>
                <X aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <span className="flex-1" aria-hidden="true" />
      )}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="self-start px-2.5 sm:shrink-0"
        onClick={() => {
          onClearAll();
          moveFocusAfterMutation(null);
        }}
      >
        {clearAllLabel}
      </Button>
    </div>
  );
}
