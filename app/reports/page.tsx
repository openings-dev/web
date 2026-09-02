import type { Metadata } from "next";
import { ReportsScreen } from "./_components/reports-screen";
import { createPageMetadata } from "@/lib/metadata/site-metadata";
import { PUBLIC_ROUTES } from "@/lib/navigation/routes";
import { getMonthlyReport, listMonthlyReports } from "@/lib/reports/reports";
import { loadWithStatus, LoadResultStatus } from "@/lib/utils/load-safely";

export const metadata: Metadata = createPageMetadata({
  title: "Open tech jobs reports",
  description: "Explore monthly snapshots of the public technology jobs indexed by openings.dev.",
  path: PUBLIC_ROUTES.reports,
  socialImageAlt: "openings.dev open tech jobs reports",
});

export default async function ReportsPage(): Promise<React.ReactNode> {
  const result = await loadWithStatus({
    load: async () => {
      const index = await listMonthlyReports();
      const latest = index.latestPeriod
        ? await getMonthlyReport(index.latestPeriod)
        : null;
      return { index, latest };
    },
  });

  return result.status === LoadResultStatus.Success
    ? <ReportsScreen index={result.data.index} report={result.data.latest} />
    : <ReportsScreen index={null} report={null} unavailable />;
}
