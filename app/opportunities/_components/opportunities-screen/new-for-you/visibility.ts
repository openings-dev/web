interface NewForYouVisibility {
  hasForcedScope: boolean;
  previousVisitAt: string | null;
  hasPersistedPreferences: boolean;
  newOnly: boolean;
  dismissed: boolean;
}

export function shouldShowNewForYou({
  hasForcedScope,
  previousVisitAt,
  hasPersistedPreferences,
  newOnly,
  dismissed,
}: NewForYouVisibility) {
  return !hasForcedScope &&
    Boolean(previousVisitAt && Number.isFinite(Date.parse(previousVisitAt))) &&
    hasPersistedPreferences &&
    !newOnly &&
    !dismissed;
}
