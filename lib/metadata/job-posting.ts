import type { OpportunityItem } from "@/lib/opportunities/types";

export type JobPostingIneligibilityReason =
  | "closed"
  | "stale"
  | "missing-title"
  | "missing-description"
  | "missing-organization"
  | "missing-location"
  | "missing-application-path";

export interface JobPostingEligibility {
  eligible: boolean;
  reasons: JobPostingIneligibilityReason[];
}

function jobOnlyTitle(title: string) {
  const normalized = title.trim();
  return normalized.length >= 8 &&
    !/^(?:job|jobs|vaga|vagas|hiring|we are hiring|oportunidade|emprego)$/iu.test(normalized);
}

function completeDescription(description: string) {
  return description.trim().length >= 100;
}

function hasApplicationPath(description: string) {
  if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/iu.test(description)) return true;
  if (/^#{1,6}\s*(?:apply|how to apply|candidatura|aplicar|postuler|candidarsi|bewerben)\b/imu.test(description)) return true;
  const urls = description.match(/https:\/\/[^\s<>)\]}]+/giu) ?? [];
  return urls.some((value) => {
    try {
      const hostname = new URL(value.replace(/[.,;:!?]+$/u, "")).hostname.toLowerCase();
      return hostname !== "github.com" && !hostname.endsWith(".github.com") &&
        hostname !== "openings.dev" && !hostname.endsWith(".openings.dev");
    } catch {
      return false;
    }
  });
}

function hasSupportedLocation(item: OpportunityItem) {
  const location = item.jobLocation;
  const declaredPhysical = item.dataProvenance?.location === "declared" &&
    Boolean(location?.countryCode || location?.country || location?.city);
  const declaredRemote = item.dataProvenance?.workModel === "declared" &&
    location?.workModel === "remote" &&
    (location.remoteScope === "global" || location.remoteScope === "country");
  return declaredPhysical || declaredRemote;
}

export function evaluateJobPostingEligibility(
  item: OpportunityItem,
): JobPostingEligibility {
  const reasons: JobPostingIneligibilityReason[] = [];
  if (item.issueState !== "open") reasons.push("closed");
  if (item.freshness?.status === "stale") reasons.push("stale");
  if (!jobOnlyTitle(item.title ?? "")) reasons.push("missing-title");
  if (!completeDescription(item.description ?? "")) reasons.push("missing-description");
  if (!item.companyName?.trim()) reasons.push("missing-organization");
  if (!hasSupportedLocation(item)) reasons.push("missing-location");
  if (!hasApplicationPath(item.description ?? "")) reasons.push("missing-application-path");
  return { eligible: reasons.length === 0, reasons };
}

function employmentTypes(item: OpportunityItem) {
  const mapping: Record<string, string> = {
    employee: "FULL_TIME", "full-time": "FULL_TIME", contractor: "CONTRACTOR",
    "part-time": "PART_TIME", internship: "INTERN",
  };
  return [...new Set((item.taxonomy?.employmentTypes ?? []).map((value) => mapping[value]).filter(Boolean))];
}

export function buildJobPostingJsonLd(item: OpportunityItem): Record<string, unknown> | null {
  if (!evaluateJobPostingEligibility(item).eligible) return null;
  const location = item.jobLocation;
  const types = employmentTypes(item);
  const remote = location?.workModel === "remote" &&
    (location.remoteScope === "global" || location.remoteScope === "country");
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: item.title,
    description: item.description,
    datePosted: item.createdAt,
    hiringOrganization: { "@type": "Organization", name: item.companyName?.trim() },
    ...(types.length ? { employmentType: types.length === 1 ? types[0] : types } : {}),
    ...(remote ? {
      jobLocationType: "TELECOMMUTE",
      ...(location?.remoteScope === "country" && (location.countryCode || location.country)
        ? { applicantLocationRequirements: {
            "@type": "Country",
            name: location.countryCode ?? location.country,
          } }
        : {}),
    } : {
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          ...(location?.countryCode || location?.country
            ? { addressCountry: location.countryCode ?? location.country } : {}),
          ...(location?.subdivision ? { addressRegion: location.subdivision } : {}),
          ...(location?.city ? { addressLocality: location.city } : {}),
        },
      },
    }),
  };
}

export function serializeJobPostingJsonLd(value: Record<string, unknown>) {
  return JSON.stringify(value).replace(/</gu, "\\u003c");
}
