"use client";

import { useEffect } from "react";
import { trackProductEvent } from "@/lib/telemetry";

export function StatusTelemetry({
  health,
}: {
  health: "healthy" | "partial" | "unavailable";
}) {
  useEffect(() => {
    trackProductEvent("Status Viewed", { health });
  }, [health]);
  return null;
}
