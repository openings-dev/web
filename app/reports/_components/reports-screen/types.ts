import type { MonthlyReport, MonthlyReportIndex } from "@/lib/reports/types";

export interface ReportsScreenProps {
  index: MonthlyReportIndex | null;
  report: MonthlyReport | null;
  detail?: boolean;
  unavailable?: boolean;
}
