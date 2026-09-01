import { Bookmark, Clock3, Sparkles } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import { Button } from "@/components/ui/button";
import type {
  OnFilterFieldChange,
  OpportunityFiltersState,
} from "@/app/opportunities/_components/opportunities-screen/types";
import { trackProductEvent } from "@/lib/telemetry";

interface DiscoveryShortcutsProps {
  filters: OpportunityFiltersState;
  onFieldChange: OnFilterFieldChange;
  curatedLinks?: boolean;
}

function toggled(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value];
}

export function DiscoveryShortcuts({
  filters,
  onFieldChange,
  curatedLinks = false,
}: DiscoveryShortcutsProps): React.ReactNode {
  const { locale, messages } = useI18n();
  const copy = messages.opportunities.discovery;
  const shortcuts = [
    { id: "remote", slug: "remote", label: copy.remote, active: filters.workModels.includes("remote"), action: () => onFieldChange("workModels", toggled(filters.workModels, "remote")) },
    { id: "internship", slug: "internships", label: copy.internship, active: filters.seniority.includes("internship"), action: () => onFieldChange("seniority", toggled(filters.seniority, "internship")) },
    { id: "react", slug: "react", label: "React", active: filters.technologies.includes("react"), action: () => onFieldChange("technologies", toggled(filters.technologies, "react")) },
    { id: "data-ai", slug: "data-ai", label: copy.dataAi, active: filters.areas.includes("data-ai"), action: () => onFieldChange("areas", toggled(filters.areas, "data-ai")) },
    { id: "devops", slug: "devops", label: "DevOps", active: filters.areas.includes("devops-sre"), action: () => onFieldChange("areas", toggled(filters.areas, "devops-sre")) },
    { id: "with-salary", slug: "salary", label: copy.withSalary, active: filters.salaryOnly, action: () => onFieldChange("salaryOnly", !filters.salaryOnly) },
  ];
  const trackShortcut = (shortcut: typeof shortcuts[number]) => {
    trackProductEvent("Discovery Shortcut Opened", {
      shortcut: shortcut.id,
      locale,
    });
  };
  const openShortcut = (shortcut: typeof shortcuts[number]) => {
    trackShortcut(shortcut);
    shortcut.action();
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
      <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Sparkles className="size-3.5" aria-hidden="true" />
        {copy.shortcutsLabel}
      </span>
      {shortcuts.map((shortcut) => (
        curatedLinks ? (
          <Button key={shortcut.id} asChild size="sm" variant="outline">
            <Link href={`/${locale}/discover/${shortcut.slug}`} onClick={() => trackShortcut(shortcut)}>{shortcut.label}</Link>
          </Button>
        ) : (
          <Button key={shortcut.id} type="button" size="sm"
            variant={shortcut.active ? "default" : "outline"
            } aria-pressed={shortcut.active} onClick={() => openShortcut(shortcut)}>
            {shortcut.label}
          </Button>
        )
      ))}
      {["7", "30", "90"].map((days) => (
        <Button key={days} type="button" size="sm"
          variant={filters.freshnessDays === days ? "default" : "outline"}
          aria-pressed={filters.freshnessDays === days}
          onClick={() => onFieldChange("freshnessDays", filters.freshnessDays === days ? "all" : days)}>
          <Clock3 className="size-3.5" aria-hidden="true" />
          {copy.lastDays.replace("{days}", days)}
        </Button>
      ))}
      <Button type="button" size="sm" variant={filters.savedOnly ? "default" : "outline"}
        aria-pressed={filters.savedOnly} onClick={() => onFieldChange("savedOnly", !filters.savedOnly)}>
        <Bookmark className="size-3.5" aria-hidden="true" />
        {copy.saved}
      </Button>
      <Button type="button" size="sm" variant={filters.newOnly ? "default" : "outline"}
        aria-pressed={filters.newOnly} onClick={() => onFieldChange("newOnly", !filters.newOnly)}>
        {copy.newSinceVisit}
      </Button>
    </div>
  );
}
