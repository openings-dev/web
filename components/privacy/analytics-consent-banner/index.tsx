"use client";

import Link from "next/link";
import * as React from "react";
import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import { useTelemetry } from "@/components/providers/telemetry-provider/use-telemetry";
import { Button } from "@/components/ui/button";
import { PUBLIC_ROUTES } from "@/lib/navigation/routes";

export function AnalyticsConsentBanner() {
  const { messages } = useI18n();
  const { consent, setConsent } = useTelemetry();
  const [announcement, setAnnouncement] = React.useState("");
  if (consent !== "undecided") return null;
  const copy = messages.analyticsConsent;

  const choose = (state: "granted" | "denied") => {
    const saved = setConsent(state);
    setAnnouncement(saved ? copy.saved : copy.couldNotSave);
  };

  return (
    <aside
      aria-labelledby="analytics-consent-title"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-card border border-control bg-surface p-5 shadow-xl sm:inset-x-6 sm:p-6"
    >
      <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div>
          <h2 id="analytics-consent-title" className="text-base font-semibold text-foreground">
            {copy.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {copy.purpose}{" "}
            <Link className="font-medium text-primary-deep underline underline-offset-4" href={PUBLIC_ROUTES.privacy}>
              {messages.footer.links.privacyPolicy}
            </Link>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button type="button" variant="outline" onClick={() => choose("denied")}>
            {copy.decline}
          </Button>
          <Button type="button" onClick={() => choose("granted")}>
            {copy.accept}
          </Button>
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </aside>
  );
}
