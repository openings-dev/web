import type { OpportunityItem } from "@/lib/opportunities/types";
import type { OpportunityTrustSummary } from "@/lib/opportunities/trust";

export enum OpportunityDetailsMode {
  Dialog = "dialog",
  Page = "page",
}

export interface OpportunityDetailsProps {
  item: OpportunityItem;
  shareUrl: string;
  mode?: OpportunityDetailsMode;
  hideCommunityIdentity?: boolean;
  hideAuthorIdentity?: boolean;
  onClose?: () => void;
  onCommunitySelect?: (repository: string) => void;
  onAuthorSelect?: (authorHandle: string) => void;
  communityHref?: string;
  authorHref?: string;
  returnHref?: string;
  specimenMode?: boolean;
  isSaved?: boolean;
  onToggleSaved?: (id: string) => void;
  trustSummary?: OpportunityTrustSummary;
  similarItems?: OpportunityItem[];
}
