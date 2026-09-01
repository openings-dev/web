"use client";

import { useEffect } from "react";
import { trackProductEvent } from "@/lib/telemetry";

export function CommunityTelemetry({
  repository,
  activity,
}: {
  repository: string;
  activity: "active" | "no-openings" | "error";
}) {
  useEffect(() => {
    trackProductEvent("Community Viewed", { repository, activity });
  }, [activity, repository]);
  return null;
}
