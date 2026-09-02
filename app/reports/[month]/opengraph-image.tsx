import {
  createSocialCardImage,
  SOCIAL_CARD_CONTENT_TYPE,
  SOCIAL_CARD_SIZE,
} from "@/lib/metadata/social-card";
import { getMonthlyReport, listMonthlyReports } from "@/lib/reports/reports";

interface ReportSocialImageProps {
  params: Promise<{ month: string }>;
}

export const alt = "Monthly open tech jobs report on openings.dev";
export const size = SOCIAL_CARD_SIZE;
export const contentType = SOCIAL_CARD_CONTENT_TYPE;
export const dynamic = "force-static";

export async function generateStaticParams(): Promise<Array<{ month: string }>> {
  const index = await listMonthlyReports();
  return index.reports.map(({ period }) => ({ month: period }));
}

export default async function ReportSocialImage({ params }: ReportSocialImageProps): Promise<ReturnType<typeof createSocialCardImage>> {
  const { month } = await params;
  const report = await getMonthlyReport(month);
  return createSocialCardImage({
    eyebrow: "Open data · Monthly report",
    title: `${month} tech jobs report`,
    description: "A versioned point-in-time view of public GitHub community listings.",
    facts: [
      { label: "Open jobs", value: report.totals.openOpportunities.toLocaleString("en-US") },
      { label: "Communities", value: report.totals.communities.toLocaleString("en-US") },
      { label: "Countries", value: report.totals.countries.toLocaleString("en-US") },
    ],
    actionLabel: "Explore the report",
  });
}
