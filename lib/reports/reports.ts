import {
  getOpeningsDataRepositoryBaseUrl,
  openingsDataRepositoryUrl,
} from "@/lib/opportunities/data-source";
import { fetchJson } from "@/lib/opportunities/fetch-json";
import { parseMonthlyReport, parseMonthlyReportIndex } from "./report-parser";

const REPORTS_ROOT = "reports/monthly";
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/u;

async function fetchReportJson(path: string): Promise<unknown> {
  const allowedUrlPrefix = getOpeningsDataRepositoryBaseUrl();
  return fetchJson(openingsDataRepositoryUrl(`${REPORTS_ROOT}/${path}`), {
    allowedUrlPrefix,
    cache: "force-cache",
  });
}

export async function listMonthlyReports() {
  return parseMonthlyReportIndex(await fetchReportJson("index.json"));
}

export async function getMonthlyReport(period: string) {
  if (!MONTH_PATTERN.test(period)) throw new Error("Invalid monthly report period");
  return parseMonthlyReport(await fetchReportJson(`${period}.json`));
}
