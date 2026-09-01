import * as React from "react";
import { resolveOpportunityIds } from "@/lib/opportunities/api";
import {
  readCandidateState,
  updateCandidateState,
} from "@/lib/opportunities/local-candidate-state";
import type { OpportunityItem } from "@/lib/opportunities/types";

function canonicalTimestampRecord(
  source: Record<string, string>,
  sourceIds: string[],
  canonicalIds: string[],
) {
  const result: Record<string, string> = {};
  sourceIds.forEach((id, index) => {
    const canonicalId = canonicalIds[index] ?? id;
    const timestamp = source[id];
    if (!result[canonicalId] || Date.parse(timestamp) < Date.parse(result[canonicalId])) {
      result[canonicalId] = timestamp;
    }
  });
  return result;
}

export function useLocalDiscovery() {
  const [saved, setSaved] = React.useState<Record<string, string>>({});
  const [viewed, setViewed] = React.useState<Record<string, string>>({});
  const [comparison, setComparison] = React.useState<OpportunityItem[]>([]);
  const [previousVisitAt, setPreviousVisitAt] = React.useState<string | null>(null);
  const [hasPersistedPreferences, setHasPersistedPreferences] = React.useState(false);

  React.useEffect(() => {
    const stored = readCandidateState();
    const savedIds = Object.keys(stored.saved);
    const viewedIds = Object.keys(stored.viewed);
    let active = true;
    Promise.all([
      resolveOpportunityIds(savedIds).catch(() => savedIds),
      resolveOpportunityIds(viewedIds).catch(() => viewedIds),
    ]).then(([canonicalSavedIds, canonicalViewedIds]) => {
      if (!active) return;
      const canonicalSaved = canonicalTimestampRecord(stored.saved, savedIds, canonicalSavedIds);
      const canonicalViewed = canonicalTimestampRecord(stored.viewed, viewedIds, canonicalViewedIds);
      setSaved(canonicalSaved);
      setViewed(canonicalViewed);
      setPreviousVisitAt(stored.lastVisitAt);
      setHasPersistedPreferences(Boolean(
        stored.preferences.country ||
        stored.preferences.workModels?.length ||
        stored.preferences.technologies?.length ||
        stored.preferences.seniority?.length,
      ));
      updateCandidateState((state) => ({
        ...state,
        saved: canonicalSaved,
        viewed: canonicalViewed,
        lastVisitAt: new Date().toISOString(),
      }));
    });
    return () => { active = false; };
  }, []);

  const toggleSaved = React.useCallback((id: string) => {
    setSaved((current) => {
      const next = { ...current };
      if (next[id]) delete next[id];
      else next[id] = new Date().toISOString();
      updateCandidateState((state) => ({ ...state, saved: next }));
      return next;
    });
  }, []);

  const markViewed = React.useCallback((id: string) => {
    if (!id) return;
    setViewed((current) => {
      if (current[id]) return current;
      const next = { ...current, [id]: new Date().toISOString() };
      updateCandidateState((state) => ({ ...state, viewed: next }));
      return next;
    });
  }, []);

  const toggleComparison = React.useCallback((item: OpportunityItem) => {
    setComparison((current) => current.some(({ id }) => id === item.id)
      ? current.filter(({ id }) => id !== item.id)
      : current.length < 3 ? [...current, item] : current);
  }, []);

  const removeComparison = React.useCallback((id: string) => {
    setComparison((current) => current.filter((item) => item.id !== id));
  }, []);

  return {
    savedIds: React.useMemo(() => new Set(Object.keys(saved)), [saved]),
    viewedIds: React.useMemo(() => new Set(Object.keys(viewed)), [viewed]),
    comparisonIds: React.useMemo(() => new Set(comparison.map(({ id }) => id)), [comparison]),
    comparisonItems: comparison,
    previousVisitAt,
    hasPersistedPreferences,
    toggleSaved,
    markViewed,
    toggleComparison,
    removeComparison,
    clearComparison: React.useCallback(() => setComparison([]), []),
  };
}
