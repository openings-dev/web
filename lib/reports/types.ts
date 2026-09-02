export interface MonthlyReportTotals {
  openOpportunities: number;
  communities: number;
  countries: number;
  regions: number;
  repositories: number;
}

export interface MonthlyReportRanking {
  label: string;
  openOpportunities: number;
}

export interface MonthlyReportSummary {
  period: string;
  generatedAt: string;
  totals: MonthlyReportTotals;
}

export interface MonthlyReport extends MonthlyReportSummary {
  schemaVersion: number;
  methodologyVersion: number;
  dataHash: string;
  topCountries: MonthlyReportRanking[];
  topTechnologies: MonthlyReportRanking[];
  workModels: MonthlyReportRanking[];
  salaryDisclosure: {
    disclosed: number;
    undisclosed: number;
    percentage: number;
  };
}

export interface MonthlyReportIndex {
  generatedAt: string | null;
  latestPeriod: string | null;
  reports: MonthlyReportSummary[];
}
