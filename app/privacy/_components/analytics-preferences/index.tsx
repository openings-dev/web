"use client";

import * as React from "react";
import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import { useTelemetry } from "@/components/providers/telemetry-provider/use-telemetry";
import { Button } from "@/components/ui/button";

export function AnalyticsPreferences() {
  const { messages } = useI18n();
  const { consent, setConsent } = useTelemetry();
  const [announcement, setAnnouncement] = React.useState("");
  const copy = messages.analyticsConsent;
  const stateLabel = {
    granted: copy.granted,
    denied: copy.denied,
    undecided: copy.undecided,
  }[consent];

  const choose = (state: "granted" | "denied") => {
    setAnnouncement(setConsent(state) ? copy.saved : copy.couldNotSave);
  };

  return (
    <section
      id="analytics-preferences"
      aria-labelledby="analytics-preferences-title"
      className="mx-auto mb-20 w-[calc(100%-2rem)] max-w-[74ch] border-t border-line pt-8 sm:w-[calc(100%-3rem)]"
    >
      <h2 id="analytics-preferences-title" className="font-display text-section-title font-semibold text-foreground">
        {copy.changePreference}
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy.purpose}</p>
      <p className="mt-4 text-sm font-medium text-foreground">
        {copy.currentState}: <span className="text-primary-deep">{stateLabel}</span>
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => choose("denied")}>
          {copy.decline}
        </Button>
        <Button type="button" onClick={() => choose("granted")}>
          {copy.accept}
        </Button>
      </div>
      <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm text-muted-foreground">
        {announcement}
      </p>
    </section>
  );
}
