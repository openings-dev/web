"use client";

import { createContext } from "react";
import type { AnalyticsConsentState } from "@/lib/telemetry/consent";

export interface TelemetryContextValue {
  consent: AnalyticsConsentState;
  setConsent: (state: "granted" | "denied") => boolean;
}

export const TelemetryContext = createContext<TelemetryContextValue | null>(null);
