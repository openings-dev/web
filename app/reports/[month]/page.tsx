import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReportsScreen } from "../_components/reports-screen";
import { createPageMetadata } from "@/lib/metadata/site-metadata";
import { getMonthlyReport, listMonthlyReports } from "@/lib/reports/reports";

interface ReportPageProps {
  params: Promise<{ month: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams(): Promise<Array<{ month: string }>> {
  const index = await listMonthlyReports();
  return index.reports.map(({ period }) => ({ month: period }));
}

export async function generateMetadata({ params }: ReportPageProps): Promise<Metadata> {
  const { month } = await params;
  return createPageMetadata({
    title: `${month} open tech jobs report`,
    description: `A public point-in-time report of the technology jobs indexed by openings.dev in ${month}.`,
    path: `/reports/${month}`,
    openGraphType: "article",
    socialImageAlt: `${month} openings.dev tech jobs report`,
  });
}

export default async function ReportPage({ params }: ReportPageProps): Promise<React.ReactNode> {
  const { month } = await params;
  const [index, report] = await Promise.all([
    listMonthlyReports(),
    getMonthlyReport(month).catch(() => null),
  ]);
  if (!report) notFound();
  return <ReportsScreen index={index} report={report} detail />;
}
