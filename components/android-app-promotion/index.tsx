"use client";

import * as React from "react";
import { ExternalLink, Smartphone, X } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import { useTelemetry } from "@/components/providers/telemetry-provider/use-telemetry";
import { Button } from "@/components/ui/button";
import { EXTERNAL_ROUTES } from "@/lib/navigation/routes";
import { trackProductEvent } from "@/lib/telemetry";
import {
  readAndroidAppPromotionDismissed,
  subscribeAndroidAppPromotionDismissed,
  writeAndroidAppPromotionDismissed,
} from "./dismissal";

const serverDismissed = () => true;

export function AndroidAppPromotion(): React.ReactNode {
  const { locale, messages } = useI18n();
  const { consent } = useTelemetry();
  const [dismissedInMemory, setDismissedInMemory] = React.useState(false);
  const dismissed = React.useSyncExternalStore(
    subscribeAndroidAppPromotionDismissed,
    readAndroidAppPromotionDismissed,
    serverDismissed,
  );
  const copy = messages.androidAppPromotion;

  if (consent === "undecided" || dismissedInMemory || dismissed) return null;

  const dismiss = () => {
    setDismissedInMemory(true);
    writeAndroidAppPromotionDismissed();
  };

  const trackOpened = () => {
    trackProductEvent("Android App Promotion Opened", { locale });
  };

  return (
    <aside
      data-android-app-promotion
      aria-labelledby="android-app-promotion-title"
      className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto max-h-[calc(100dvh-1.5rem-env(safe-area-inset-bottom))] max-w-sm overflow-x-hidden overflow-y-auto rounded-floating border border-primary/25 bg-primary p-4 text-primary-foreground shadow-floating-lg sm:inset-x-auto sm:right-6"
    >
      <div className="flex gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-control bg-primary-foreground/10">
          <Smartphone className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 id="android-app-promotion-title" className="text-sm font-semibold [overflow-wrap:anywhere]">
            {copy.title}
          </h2>
          <p className="mt-1 text-sm leading-5 text-primary-foreground/80 [overflow-wrap:anywhere]">
            {copy.description}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          asChild
          size="sm"
          variant="secondary"
          className="!h-auto min-h-11 min-w-0 max-w-full !whitespace-normal py-2 text-left"
        >
          <a
            href={EXTERNAL_ROUTES.androidApp}
            target="_blank"
            rel="noreferrer"
            onClick={trackOpened}
          >
            {copy.action}
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          aria-label={copy.closeLabel}
          onClick={dismiss}
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </aside>
  );
}
