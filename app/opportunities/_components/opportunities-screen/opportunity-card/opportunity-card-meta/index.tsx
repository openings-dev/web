import {
  MapPin,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  classifyOpportunityTags,
  OPPORTUNITY_TAG_BADGE_TONES,
} from "@/app/opportunities/_components/opportunities-screen/controller/tag-categories";
import { canonicalTagLabel } from "@/app/opportunities/_components/opportunities-screen/controller/tag-labels";
import { metadataRowStyles } from "@/app/opportunities/_components/opportunities-screen/styles";
import type { OpportunityItem } from "@/app/opportunities/_components/opportunities-screen/types";

interface OpportunityCardMetaProps {
  item: OpportunityItem;
  salaryLabel: string;
  locale: string;
}

export function OpportunityCardMeta({
  item,
  salaryLabel,
  locale,
}: OpportunityCardMetaProps): React.ReactNode {
  const { workModel } = classifyOpportunityTags(item.tags);
  const structuredWorkModel = item.taxonomy?.workModels[0];

  return (
    <div className={metadataRowStyles}>
      {salaryLabel ? (
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Wallet className="size-4 text-positive-foreground" aria-hidden="true" />
          {salaryLabel}
        </span>
      ) : null}
      {structuredWorkModel ? (
        <Badge tone="positive" size="compact">
          {canonicalTagLabel(structuredWorkModel, structuredWorkModel, locale)}
        </Badge>
      ) : workModel.slice(0, 1).map((tag) => (
        <Badge
          key={`${tag.canonicalValue}-${tag.value}`}
          tone={OPPORTUNITY_TAG_BADGE_TONES[tag.category]}
          size="compact"
        >
          {canonicalTagLabel(tag.canonicalValue, tag.value, locale)}
        </Badge>
      ))}
      {item.jobLocation?.displayText ? (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4" aria-hidden="true" />
          {item.jobLocation.displayText}
        </span>
      ) : null}
    </div>
  );
}
