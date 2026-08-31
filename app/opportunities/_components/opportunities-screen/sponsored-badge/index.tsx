"use client";

import { Megaphone } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import { Badge } from "@/components/ui/badge";
import { OpportunityPromotionType } from "@/lib/opportunities/types";
import type { SponsoredBadgeProps } from "./types";

export function SponsoredBadge({
  promotion,
}: SponsoredBadgeProps): React.ReactNode {
  const { messages } = useI18n();

  if (promotion?.type !== OpportunityPromotionType.Sponsored) return null;

  const copy = messages.sponsorship.badge;

  return (
    <Badge
      tone="primary"
      size="compact"
      title={copy.description}
      aria-label={`${copy.label}. ${copy.description}`}
    >
      <Megaphone aria-hidden="true" />
      {copy.label}
    </Badge>
  );
}
