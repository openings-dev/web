"use client";

import { LoaderCircle, X } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import { Wordmark } from "@/components/brand/wordmark";
import { WordmarkSize } from "@/components/brand/wordmark/types";
import { Button } from "@/components/ui/button";
import { OpportunityDetails } from "@/app/opportunities/_components/opportunity-details";
import { OpportunityDetailsMode } from "@/app/opportunities/_components/opportunity-details/types";
import {
  OpportunitySelectionStatus,
  type OpportunityDrawerProps,
} from "@/app/opportunities/_components/opportunities-screen/types";
import { buildOpportunityPath } from "@/lib/opportunities/routing";
import { resolvePublicSiteUrl } from "@/lib/metadata/site-metadata";
import { formatTemplate } from "@/lib/utils/format-template";
import { getOpportunityDetailsElementIds } from "@/app/opportunities/_components/opportunities-screen/opportunity-card/trigger-contract";
import { DetailsDialog } from "./details-dialog";

export function OpportunityDrawer({
  item,
  open,
  selectedOpportunityId,
  selectionStatus,
  hideCommunityIdentity,
  hideAuthorIdentity,
  onClose,
  onCommunitySelect,
  onAuthorSelect,
  specimenMode = false,
  savedIds,
  onToggleSaved,
}: OpportunityDrawerProps): React.ReactNode {
  const { messages } = useI18n();
  const copy = messages.opportunities.card;
  const itemId = item?.id ?? selectedOpportunityId ?? "";
  const dialogId = itemId
    ? getOpportunityDetailsElementIds(itemId).dialog
    : "opportunity-details-dialog";
  const dialogLabel = item
    ? formatTemplate(copy.openDetailsAriaLabel, { title: item.title })
    : selectionStatus === OpportunitySelectionStatus.NotFound
      ? messages.opportunities.feedback.selectedNotFound
      : selectionStatus === OpportunitySelectionStatus.LoadError
        ? messages.opportunities.feedback.selectedLoadError
        : messages.opportunities.feedback.selectedLoading;

  if (!open) return null;

  return (
    <DetailsDialog
      open={open}
      dialogId={dialogId}
      dialogLabel={dialogLabel}
      returnFocusOpportunityId={itemId}
      onClose={onClose}
    >
      {item ? (
        <OpportunityDetails
          item={item}
          mode={OpportunityDetailsMode.Dialog}
          shareUrl={resolvePublicSiteUrl(buildOpportunityPath(item.id))}
          hideCommunityIdentity={hideCommunityIdentity}
          hideAuthorIdentity={hideAuthorIdentity}
          onClose={onClose}
          onCommunitySelect={onCommunitySelect}
          onAuthorSelect={onAuthorSelect}
          specimenMode={specimenMode}
          isSaved={savedIds?.has(item.id)}
          onToggleSaved={onToggleSaved}
        />
      ) : (
        <div className="flex h-full min-h-0 flex-col bg-surface-elevated">
          <header className="flex min-h-16 items-center border-b border-line px-4 sm:min-h-[4.5rem] sm:px-6 lg:px-8">
            <Wordmark size={WordmarkSize.Compact} className="h-7" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="ml-auto"
              data-detail-close=""
              onClick={onClose}
              aria-label={copy.closeDetails}
            >
              <X className="size-5" aria-hidden="true" />
            </Button>
          </header>
          <div className="flex min-h-64 flex-1 flex-col items-center justify-center gap-5 px-6 py-10 text-center">
            {selectionStatus === OpportunitySelectionStatus.Loading ? (
              <LoaderCircle
                className="size-6 animate-spin text-primary-deep motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : null}
            <p
              className="max-w-md text-sm leading-6 text-muted-foreground"
              role={selectionStatus === OpportunitySelectionStatus.Loading ? "status" : "alert"}
              aria-live={selectionStatus === OpportunitySelectionStatus.Loading ? "polite" : "assertive"}
              aria-atomic="true"
            >
              {dialogLabel}
            </p>
            {selectionStatus !== OpportunitySelectionStatus.Loading ? (
              <Button type="button" variant="outline" onClick={onClose}>
                {copy.closeDetails}
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </DetailsDialog>
  );
}
