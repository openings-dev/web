import type {
  StaticCommunityStatus,
  StaticCommunityStatusHistory,
  StaticOpportunityAliases,
} from "./api-types";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isTimestamp(value: unknown): value is string {
  return isString(value) && Number.isFinite(Date.parse(value));
}

function isNullableTimestamp(value: unknown) {
  return value === null || isTimestamp(value);
}

function isCount(value: unknown) {
  return Number.isInteger(value) && Number(value) >= 0;
}

export function parseStaticOpportunityAliases(
  value: unknown,
  path: string,
): StaticOpportunityAliases {
  if (!isRecord(value) || !isTimestamp(value.generatedAt) || !isRecord(value.ids) ||
    !Object.entries(value.ids).every(([id, target]) => isString(id) && isString(target))) {
    throw new Error(`Invalid static opportunity aliases at ${path}`);
  }
  return value as unknown as StaticOpportunityAliases;
}

export function parseStaticCommunityStatus(
  value: unknown,
  path: string,
): StaticCommunityStatus {
  const totals = isRecord(value) && isRecord(value.totals) ? value.totals : null;
  const valid = isRecord(value) && isTimestamp(value.generatedAt) && totals !== null &&
    ["communities", "healthy", "noOpenings", "errors"].every((key) => isCount(totals[key])) &&
    Array.isArray(value.items) && value.items.every((item) =>
      isRecord(item) && isString(item.repository) && isString(item.repositoryUrl) &&
      isString(item.name) && isString(item.country) && isString(item.countryCode) &&
      isString(item.region) && ["healthy", "no-openings", "error"].includes(String(item.state)) &&
      isCount(item.openOpportunities) && isNullableTimestamp(item.lastSuccessfulSyncAt) &&
      isNullableTimestamp(item.lastPostedAt));
  if (!valid) throw new Error(`Invalid static community status at ${path}`);
  return value as unknown as StaticCommunityStatus;
}

function includesPrivateFailureFields(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(includesPrivateFailureFields);
  if (!isRecord(value)) return false;
  return Object.entries(value).some(([key, item]) =>
    /^(?:error|message)$/iu.test(key) || includesPrivateFailureFields(item));
}

function isHistoryRun(value: unknown): boolean {
  if (!isRecord(value)) return false;
  const countKeys = ["durationMs", "communities", "successful", "failed",
    "noOpenings", "openOpportunities"];
  return isTimestamp(value.startedAt) && isTimestamp(value.completedAt) &&
    Date.parse(value.startedAt) <= Date.parse(value.completedAt) &&
    (value.outcome === "healthy" || value.outcome === "partial") &&
    countKeys.every((key) => isCount(value[key])) &&
    Number(value.successful) + Number(value.failed) <= Number(value.communities);
}

function isHistoryDay(value: unknown): boolean {
  if (!isRecord(value) || !/^\d{4}-\d{2}-\d{2}$/u.test(String(value.date))) return false;
  return isCount(value.runs) && Number(value.runs) > 0 &&
    isCount(value.partialRuns) && Number(value.partialRuns) <= Number(value.runs) &&
    isCount(value.failedCommunityRuns) && isCount(value.latestOpenOpportunities);
}

function isStrictlyNewestFirst(values: number[]): boolean {
  return values.every((value, index) => index === 0 || values[index - 1] > value);
}

export function parseStaticCommunityStatusHistory(
  value: unknown,
  path: string,
): StaticCommunityStatusHistory {
  const generatedAt = isRecord(value) && isTimestamp(value.generatedAt)
    ? Date.parse(value.generatedAt) : Number.NaN;
  const cutoff = generatedAt - 30 * 24 * 60 * 60 * 1_000;
  const runs = isRecord(value) && Array.isArray(value.runs) ? value.runs : [];
  const days = isRecord(value) && Array.isArray(value.days) ? value.days : [];
  const runTimes = runs.map((run) => isRecord(run) ? Date.parse(String(run.completedAt)) : Number.NaN);
  const dayTimes = days.map((day) => isRecord(day) ? Date.parse(`${String(day.date)}T00:00:00.000Z`) : Number.NaN);
  const valid = isRecord(value) && Number.isFinite(generatedAt) &&
    value.retentionDays === 30 && Array.isArray(value.runs) &&
    runs.every(isHistoryRun) && isStrictlyNewestFirst(runTimes) &&
    runTimes.every((time) => time >= cutoff && time <= generatedAt) &&
    Array.isArray(value.days) && days.every(isHistoryDay) &&
    isStrictlyNewestFirst(dayTimes) && !includesPrivateFailureFields(value);
  if (!valid) throw new Error(`Invalid static community status history at ${path}`);
  return value as unknown as StaticCommunityStatusHistory;
}
