import type { CommunitySummary } from "@/lib/opportunities/communities";
import type { TranslationMessages } from "@/lib/translations/types";
import type { StaticCommunityStatus } from "@/lib/opportunities/api-types";

export interface CommunitiesScreenProps {
  communities: CommunitySummary[];
  sourceUnavailable: boolean;
  status: StaticCommunityStatus | null;
}

export type CommunityListMessages = TranslationMessages["communities"]["list"];

export interface CommunityCardProps {
  item: CommunitySummary;
  locale: string;
  listMessages: CommunityListMessages;
}

export interface CommunitiesListProps {
  locale: string;
  listMessages: CommunityListMessages;
  items: CommunitySummary[];
  emptyReason: import("@/app/_components/directory/types").DirectoryEmptyReason;
  onClearAll: () => void;
}
