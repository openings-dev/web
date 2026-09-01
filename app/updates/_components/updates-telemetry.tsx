"use client";

import { useEffect, useRef } from "react";
import { trackProductEvent } from "@/lib/telemetry";

const SECTIONS = new Set(["changelog", "releases", "roadmap"] as const);

export function UpdatesTelemetry() {
  const seen = useRef(new Set<string>());

  useEffect(() => {
    const observeSection = () => {
      const hash = window.location.hash.replace(/^#/u, "") || "changelog";
      if (!SECTIONS.has(hash as "changelog") || seen.current.has(hash)) return;
      seen.current.add(hash);
      trackProductEvent("Updates Viewed", {
        section: hash as "changelog" | "releases" | "roadmap",
      });
    };
    observeSection();
    window.addEventListener("hashchange", observeSection);
    return () => window.removeEventListener("hashchange", observeSection);
  }, []);

  return null;
}
