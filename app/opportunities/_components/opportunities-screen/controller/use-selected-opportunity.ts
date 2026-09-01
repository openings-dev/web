import * as React from "react";
import { fetchOpportunityById } from "@/lib/opportunities/api";
import {
  OpportunitySelectionStatus,
  type OpportunityItem,
} from "@/app/opportunities/_components/opportunities-screen/types";

interface DirectOpportunityResolution {
  id: string;
  item: OpportunityItem | null;
  status:
    | OpportunitySelectionStatus.Ready
    | OpportunitySelectionStatus.NotFound
    | OpportunitySelectionStatus.LoadError;
}

export function useSelectedOpportunityId(
  selectedIdFromUrl: string | null,
) {
  const [selectedOpportunityId, setSelectedOpportunityId] =
    React.useState(selectedIdFromUrl);
  const [appliedSelectedIdFromUrl, setAppliedSelectedIdFromUrl] =
    React.useState(selectedIdFromUrl);
  const isApplyingSelectedIdFromUrl =
    appliedSelectedIdFromUrl !== selectedIdFromUrl;

  React.useEffect(() => {
    let current = true;

    queueMicrotask(() => {
      if (!current) return;

      setAppliedSelectedIdFromUrl(selectedIdFromUrl);
      setSelectedOpportunityId((previous) =>
        previous === selectedIdFromUrl ? previous : selectedIdFromUrl
      );
    });

    return () => {
      current = false;
    };
  }, [selectedIdFromUrl]);

  return {
    selectedOpportunityId,
    isApplyingSelectedIdFromUrl,
    setSelectedOpportunityId,
  };
}

export function useSelectedOpportunity(params: {
  loadedOpportunity: OpportunityItem | null;
  selectedOpportunityId: string | null;
  forcedRepository?: string | null;
  forcedAuthor?: string | null;
}) {
  const [directResolution, setDirectResolution] =
    React.useState<DirectOpportunityResolution | null>(null);
  const belongsToForcedScope = React.useCallback(
    (item: OpportunityItem) => {
      if (
        params.forcedRepository &&
        item.repository !== params.forcedRepository &&
        !item.sources?.some((source) => source.repository === params.forcedRepository)
      ) {
        return false;
      }

      return !params.forcedAuthor ||
        item.author.handle.toLocaleLowerCase("en-US") ===
          params.forcedAuthor.toLocaleLowerCase("en-US");
    },
    [params.forcedAuthor, params.forcedRepository],
  );
  const loadedOpportunity =
    params.loadedOpportunity?.id === params.selectedOpportunityId &&
    belongsToForcedScope(params.loadedOpportunity)
      ? params.loadedOpportunity
      : null;

  React.useEffect(() => {
    const selectedId = params.selectedOpportunityId;
    if (!selectedId || loadedOpportunity) return;

    let cancelled = false;

    fetchOpportunityById(selectedId)
      .then((item) => {
        if (cancelled) return;

        if (!item || !belongsToForcedScope(item)) {
          setDirectResolution({
            id: selectedId,
            item: null,
            status: OpportunitySelectionStatus.NotFound,
          });
          return;
        }

        setDirectResolution({
          id: selectedId,
          item,
          status: OpportunitySelectionStatus.Ready,
        });
      })
      .catch(() => {
        if (cancelled) return;

        setDirectResolution({
          id: selectedId,
          item: null,
          status: OpportunitySelectionStatus.LoadError,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [belongsToForcedScope, loadedOpportunity, params.selectedOpportunityId]);

  const currentDirectResolution =
    directResolution?.id === params.selectedOpportunityId
      ? directResolution
      : null;
  const selectedOpportunity = loadedOpportunity ?? currentDirectResolution?.item ?? null;
  const selectionStatus = !params.selectedOpportunityId
    ? OpportunitySelectionStatus.Idle
    : selectedOpportunity
      ? OpportunitySelectionStatus.Ready
      : currentDirectResolution?.status ?? OpportunitySelectionStatus.Loading;

  return {
    selectedOpportunity,
    selectionStatus,
  };
}
