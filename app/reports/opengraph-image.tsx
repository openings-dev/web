import {
  createSocialCardImage,
  SOCIAL_CARD_CONTENT_TYPE,
  SOCIAL_CARD_SIZE,
} from "@/lib/metadata/social-card";
import { getMonthlyReport, listMonthlyReports } from "@/lib/reports/reports";

export const alt = "openings.dev monthly open tech jobs reports";
export const size = SOCIAL_CARD_SIZE;
export const contentType = SOCIAL_CARD_CONTENT_TYPE;
export const dynamic = "force-static";

export default async function ReportsSocialImage(): Promise<ReturnType<typeof createSocialCardImage>> {
  const index = await listMonthlyReports();
  const latest = index.latestPeriod ? await getMonthlyReport(index.latestPeriod) : null;
  return createSocialCardImage({
    eyebrow: "Open data · Monthly report",
    title: "Tech jobs, in public.",
    description: "Versioned snapshots of the jobs and communities indexed by openings.dev.",
    facts: latest ? [
      { label: "Open jobs", value: latest.totals.openOpportunities.toLocaleString("en-US") },
      { label: "Communities", value: latest.totals.communities.toLocaleString("en-US") },
      { label: "Salary disclosed", value: `${latest.salaryDisclosure.percentage}%` },
    ] : [],
    actionLabel: "Read the reports",
  });
}
