import type {
  MonthlyReport,
  MonthlyReportIndex,
  MonthlyReportRanking,
  MonthlyReportTotals,
} from "./types";

type RecordValue = Record<string, unknown>;

function record(value: unknown, name: string): RecordValue {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`Invalid ${name}`);
  return Object.fromEntries(Object.entries(value));
}

function text(value: unknown, name: string): string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`Invalid ${name}`);
  return value;
}

function count(value: unknown, name: string): number {
  if (!Number.isInteger(value) || Number(value) < 0) throw new Error(`Invalid ${name}`);
  return Number(value);
}

function totals(value: unknown): MonthlyReportTotals {
  const source = record(value, "report totals");
  return {
    openOpportunities: count(source.openOpportunities, "open opportunities"),
    communities: count(source.communities, "communities"),
    countries: count(source.countries, "countries"),
    regions: count(source.regions, "regions"),
    repositories: count(source.repositories, "repositories"),
  };
}

function rankings(value: unknown, labelKey: string): MonthlyReportRanking[] {
  if (!Array.isArray(value)) throw new Error(`Invalid ${labelKey} rankings`);
  return value.map((item) => {
    const source = record(item, `${labelKey} ranking`);
    return {
      label: text(source[labelKey], labelKey),
      openOpportunities: count(source.openOpportunities, `${labelKey} opportunities`),
    };
  });
}

export function parseMonthlyReport(value: unknown): MonthlyReport {
  const source = record(value, "monthly report");
  const snapshot = record(source.snapshot, "report snapshot");
  const salary = record(source.salaryDisclosure, "salary disclosure");
  const percentage = Number(salary.percentage);
  if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) throw new Error("Invalid salary percentage");
  return {
    schemaVersion: count(source.schemaVersion, "schema version"),
    methodologyVersion: count(source.methodologyVersion, "methodology version"),
    period: text(source.period, "report period"),
    generatedAt: text(snapshot.generatedAt, "report generatedAt"),
    dataHash: text(snapshot.dataHash, "report data hash"),
    totals: totals(source.totals),
    topCountries: rankings(source.topCountries, "country"),
    topTechnologies: rankings(source.topTechnologies, "technology"),
    workModels: rankings(source.workModels, "model"),
    salaryDisclosure: {
      disclosed: count(salary.disclosed, "disclosed salaries"),
      undisclosed: count(salary.undisclosed, "undisclosed salaries"),
      percentage,
    },
  };
}

export function parseMonthlyReportIndex(value: unknown): MonthlyReportIndex {
  const source = record(value, "monthly report index");
  if (!Array.isArray(source.reports)) throw new Error("Invalid monthly report summaries");
  return {
    generatedAt: source.generatedAt === null ? null : text(source.generatedAt, "index generatedAt"),
    latestPeriod: source.latestPeriod === null ? null : text(source.latestPeriod, "latest period"),
    reports: source.reports.map((item) => {
      const report = record(item, "monthly report summary");
      return {
        period: text(report.period, "summary period"),
        generatedAt: text(report.generatedAt, "summary generatedAt"),
        totals: totals(report.totals),
      };
    }),
  };
}
