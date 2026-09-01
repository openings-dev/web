"use client";

import * as React from "react";
import { trackProductEvent } from "@/lib/telemetry";
import type { TelemetryFilterDimension } from "@/lib/telemetry/contracts";
import type { OpportunityFiltersState } from "../types";

const FILTER_DIMENSIONS: Partial<Record<keyof OpportunityFiltersState, TelemetryFilterDimension>> = {
  country: "country",
  region: "region",
  workModels: "work-model",
  areas: "area",
  technologies: "technology",
  seniority: "seniority",
  employmentTypes: "employment-type",
  freshnessDays: "freshness",
  salaryOnly: "salary",
};

function lengthBucket(length: number): "1-3" | "4-10" | "11-30" | "31+" {
  if (length <= 3) return "1-3";
  if (length <= 10) return "4-10";
  if (length <= 30) return "11-30";
  return "31+";
}

function resultBucket(count: number): "0" | "1-10" | "11-50" | "51+" {
  if (count === 0) return "0";
  if (count <= 10) return "1-10";
  if (count <= 50) return "11-50";
  return "51+";
}

function changedValue(previous: unknown, next: unknown) {
  if (Array.isArray(next)) {
    const before = Array.isArray(previous) ? previous : [];
    return next.find((value) => !before.includes(value)) ??
      before.find((value) => !next.includes(value)) ?? "none";
  }
  if (typeof next === "boolean") return next ? "enabled" : "disabled";
  return String(next);
}

export function useDiscoveryTelemetry({
  filters,
  locale,
  resultCount,
  activeFilterCount,
}: {
  filters: OpportunityFiltersState;
  locale: string;
  resultCount: number;
  activeFilterCount: number;
}) {
  const lastSubmittedSearch = React.useRef("");
  const trackSearch = React.useCallback((searchText: string) => {
    const normalized = searchText.trim();
    if (!normalized || normalized === lastSubmittedSearch.current) return;
    lastSubmittedSearch.current = normalized;
    trackProductEvent("Search Submitted", {
      queryLength: lengthBucket(Array.from(normalized).length),
      resultCount: resultBucket(resultCount),
      activeFilterCount,
      locale,
    });
  }, [activeFilterCount, locale, resultCount]);
  const trackFilter = React.useCallback(<Field extends keyof OpportunityFiltersState>(
    field: Field,
    value: OpportunityFiltersState[Field],
  ) => {
    const dimension = FILTER_DIMENSIONS[field];
    if (!dimension) return;
    trackProductEvent("Filter Applied", {
      dimension,
      value: changedValue(filters[field], value),
      locale,
    });
  }, [filters, locale]);
  return { trackSearch, trackFilter };
}
