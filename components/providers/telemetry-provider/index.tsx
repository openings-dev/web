"use client";

import * as React from "react";
import {
  readAnalyticsConsent,
  subscribeAnalyticsConsent,
  writeAnalyticsConsent,
} from "@/lib/telemetry/consent";
import {
  disableAnalytics,
  enableAnalytics,
} from "@/lib/telemetry/mixpanel-client";
import { TelemetryContext, type TelemetryContextValue } from "./context";

const serverConsent = () => "undecided" as const;

export function TelemetryProvider({ children }: React.PropsWithChildren) {
  const consent = React.useSyncExternalStore(
    subscribeAnalyticsConsent,
    readAnalyticsConsent,
    serverConsent,
  );
  const setConsent = React.useCallback((state: "granted" | "denied") =>
    writeAnalyticsConsent(state), []);

  React.useEffect(() => {
    if (consent === "granted") {
      void enableAnalytics();
      return;
    }
    disableAnalytics();
  }, [consent]);

  const value = React.useMemo<TelemetryContextValue>(
    () => ({ consent, setConsent }),
    [consent, setConsent],
  );

  return (
    <TelemetryContext.Provider value={value}>
      {children}
    </TelemetryContext.Provider>
  );
}
