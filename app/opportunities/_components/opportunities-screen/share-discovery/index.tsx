"use client";

import * as React from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import { OPPORTUNITY_QUERY_KEYS } from "../controller/url-filters";
import { buildShareableDiscoveryUrl } from "./share-url";

export function ShareDiscovery() {
  const { messages } = useI18n();
  const copy = messages.opportunities.toolbar;
  const [announcement, setAnnouncement] = React.useState("");

  const share = async () => {
    const url = buildShareableDiscoveryUrl(
      window.location.href,
      Object.values(OPPORTUNITY_QUERY_KEYS),
      {
        selectedKey: OPPORTUNITY_QUERY_KEYS.selectedOpportunity,
        localOnlyKeys: [OPPORTUNITY_QUERY_KEYS.savedOnly, OPPORTUNITY_QUERY_KEYS.newOnly],
      },
    );
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
        setAnnouncement(copy.shareShared);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setAnnouncement(copy.shareCopied);
      } else {
        setAnnouncement(copy.shareFailed);
      }
    } catch {
      setAnnouncement(copy.shareFailed);
    }
  };

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={share}>
        <Share2 aria-hidden="true" />
        {copy.shareDiscovery}
      </Button>
      <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
    </>
  );
}
