import {
  OpportunityIssueState,
  OpportunityPromotionType,
  OpportunitySalaryPeriod,
  OpportunitySourceType,
} from "./enums";
import type {
  OpportunityFacetIndexDimensions,
  StaticFacetIndex,
  StaticManifest,
  StaticSearchIndex,
} from "./api-types";
import type {
  OpportunityCommunity,
  OpportunityFilterFacets,
  OpportunityItem,
  OpportunityPerson,
  OpportunitySalary,
} from "./types";

export interface StaticOpportunityOrder {
  generatedAt: string;
  ids: string[];
}

export interface StaticOpportunityPageLookup {
  generatedAt: string;
  pageLookup: Record<string, string>;
}

export interface StaticOpportunityPage {
  generatedAt: string;
  items: OpportunityItem[];
}

export interface StaticOpportunityBucket {
  generatedAt: string;
  items: Record<string, OpportunityItem>;
}

type UnknownRecord = Record<string, unknown>;
type ArtifactValidator<T extends object> = (value: unknown) => value is T;

const STATIC_OPPORTUNITY_SCHEMA_VERSION = 5;
const ISO_CURRENCY_PATTERN = /^[A-Za-z]{3}$/;
const DATA_HASH_PATTERN = /^[a-f\d]{64}$/i;

const MANIFEST_CACHE = new WeakMap<object, StaticManifest>();
const FACET_INDEX_CACHE = new WeakMap<object, StaticFacetIndex>();
const SEARCH_INDEX_CACHE = new WeakMap<object, StaticSearchIndex>();
const ORDER_CACHE = new WeakMap<object, StaticOpportunityOrder>();
const PROMOTIONS_CACHE = new WeakMap<object, StaticOpportunityOrder>();
const JOB_IDS_CACHE = new WeakMap<object, StaticOpportunityOrder>();
const PAGE_LOOKUP_CACHE = new WeakMap<object, StaticOpportunityPageLookup>();
const PAGE_CACHE = new WeakMap<object, StaticOpportunityPage>();
const BUCKET_CACHE = new WeakMap<object, StaticOpportunityBucket>();

function isObjectReference(value: unknown): value is object {
  return value !== null && typeof value === "object";
}

function isRecord(value: unknown): value is UnknownRecord {
  return isObjectReference(value) && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNonEmptyString(value: unknown): value is string {
  return isString(value) && value.trim().length > 0;
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || isString(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && isFiniteNumber(value) && value >= 0;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && isFiniteNumber(value) && value > 0;
}

function isTimestamp(value: unknown): value is string {
  return isNonEmptyString(value) && Number.isFinite(Date.parse(value));
}

function isHttpUrl(value: unknown): value is string {
  if (!isNonEmptyString(value)) return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isEmptyOrHttpUrl(value: unknown): value is string {
  return value === "" || isHttpUrl(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isIdentifierArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isNonEmptyString);
}

function isUniqueIdentifierArray(value: unknown): value is string[] {
  return isIdentifierArray(value) && new Set(value).size === value.length;
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.entries(value).every(
    ([key, item]) => key.length > 0 && isString(item),
  );
}

function isCountRecord(value: unknown): value is Record<string, number> {
  return isRecord(value) && Object.entries(value).every(
    ([key, count]) => key.length > 0 && isNonNegativeInteger(count),
  );
}

function isIdentifierArrayRecord(
  value: unknown,
): value is Record<string, string[]> {
  return isRecord(value) && Object.entries(value).every(
    ([key, ids]) => key.length > 0 && isUniqueIdentifierArray(ids),
  );
}

function isOpportunityFilterFacets(
  value: unknown,
): value is OpportunityFilterFacets {
  if (!isRecord(value)) return false;

  return isCountRecord(value.repositories) &&
    isCountRecord(value.regions) &&
    isCountRecord(value.countries) &&
    isCountRecord(value.tags) &&
    isCountRecord(value.authors) &&
    isStringRecord(value.authorLabels);
}

function isOpportunityFacetIndexDimensions(
  value: unknown,
): value is OpportunityFacetIndexDimensions {
  if (!isRecord(value)) return false;

  return isIdentifierArrayRecord(value.repositories) &&
    isIdentifierArrayRecord(value.regions) &&
    isIdentifierArrayRecord(value.countries) &&
    isIdentifierArrayRecord(value.tags) &&
    isIdentifierArrayRecord(value.authors);
}

function isOpportunityPerson(value: unknown): value is OpportunityPerson {
  if (!isRecord(value)) return false;

  return isNonEmptyString(value.id) &&
    isString(value.name) &&
    isNonEmptyString(value.handle) &&
    isEmptyOrHttpUrl(value.avatarUrl);
}

function isOpportunityCommunity(
  value: unknown,
): value is OpportunityCommunity {
  if (!isRecord(value)) return false;

  return isNonEmptyString(value.id) &&
    isString(value.name) &&
    isEmptyOrHttpUrl(value.avatarUrl) &&
    isNonEmptyString(value.repository) &&
    isHttpUrl(value.url);
}

function isOpportunitySalary(value: unknown): value is OpportunitySalary {
  if (!isRecord(value)) return false;

  const hasMin = value.min !== undefined;
  const hasMax = value.max !== undefined;
  const validMin = !hasMin || (isFiniteNumber(value.min) && value.min >= 0);
  const validMax = !hasMax || (isFiniteNumber(value.max) && value.max >= 0);
  const orderedRange = !hasMin || !hasMax ||
    (isFiniteNumber(value.min) && isFiniteNumber(value.max) && value.min <= value.max);

  return isString(value.currency) &&
    ISO_CURRENCY_PATTERN.test(value.currency) &&
    (hasMin || hasMax) &&
    validMin &&
    validMax &&
    orderedRange &&
    (value.period === OpportunitySalaryPeriod.Month ||
      value.period === OpportunitySalaryPeriod.Year ||
      value.period === OpportunitySalaryPeriod.Hour);
}

function isOpportunityPromotion(value: unknown): boolean {
  return isRecord(value) && value.type === OpportunityPromotionType.Sponsored;
}

function isOpportunityItem(value: unknown): value is OpportunityItem {
  if (!isRecord(value)) return false;

  return isNonEmptyString(value.id) &&
    isOptionalString(value.sourceId) &&
    isNonEmptyString(value.title) &&
    isString(value.description) &&
    isString(value.excerpt) &&
    (value.issueState === OpportunityIssueState.Open ||
      value.issueState === OpportunityIssueState.Closed) &&
    isNonEmptyString(value.repository) &&
    isHttpUrl(value.repositoryUrl) &&
    isString(value.region) &&
    isString(value.country) &&
    isStringArray(value.tags) &&
    isOpportunityPerson(value.author) &&
    isOpportunityCommunity(value.community) &&
    isOptionalString(value.companyName) &&
    (value.salary === undefined || isOpportunitySalary(value.salary)) &&
    (value.promotion === undefined || isOpportunityPromotion(value.promotion)) &&
    isTimestamp(value.createdAt) &&
    isTimestamp(value.updatedAt) &&
    isHttpUrl(value.url) &&
    (value.sourceType === OpportunitySourceType.GithubIssue ||
      value.sourceType === OpportunitySourceType.GithubDiscussion ||
      value.sourceType === OpportunitySourceType.CommunityBoard);
}

export function isValidOpportunityItem(value: unknown): value is OpportunityItem {
  return isOpportunityItem(value);
}

function isStaticManifest(value: unknown): value is StaticManifest {
  if (!isRecord(value)) return false;

  const totals = value.totals;
  const files = value.files;

  const hasValidShape = value.schemaVersion === STATIC_OPPORTUNITY_SCHEMA_VERSION &&
    isTimestamp(value.generatedAt) &&
    isNonEmptyString(value.dataHash) &&
    DATA_HASH_PATTERN.test(value.dataHash) &&
    isPositiveInteger(value.pageSize) &&
    isRecord(totals) &&
    isNonNegativeInteger(totals.openOpportunities) &&
    isNonNegativeInteger(totals.sponsoredOpportunities) &&
    isNonNegativeInteger(totals.pages) &&
    isNonNegativeInteger(totals.repositories) &&
    isNonNegativeInteger(totals.countries) &&
    isNonNegativeInteger(totals.regions) &&
    isNonNegativeInteger(totals.communities) &&
    isRecord(files) &&
    isNonEmptyString(files.facets) &&
    isNonEmptyString(files.pageLookup) &&
    isNonEmptyString(files.search) &&
    isNonEmptyString(files.jobIds) &&
    isNonEmptyString(files.order) &&
    isNonEmptyString(files.promotions) &&
    isNonEmptyString(files.communities) &&
    isOpportunityFilterFacets(value.facets) &&
    Array.isArray(value.pages) &&
    value.pages.every((page) =>
      isRecord(page) &&
      isPositiveInteger(page.page) &&
      isNonEmptyString(page.file) &&
      isNonNegativeInteger(page.count) &&
      page.count <= (value.pageSize as number)
    );

  if (!hasValidShape || !isRecord(totals) || !isRecord(files) || !Array.isArray(value.pages)) {
    return false;
  }

  const pageSize = value.pageSize as number;
  const openOpportunities = totals.openOpportunities as number;

  const pageFiles = value.pages.map((page) => (page as UnknownRecord).file as string);
  const filePaths = [
    files.facets,
    files.pageLookup,
    files.search,
    files.jobIds,
    files.order,
    files.promotions,
    files.communities,
    ...pageFiles,
  ] as string[];
  const pageCount = value.pages.reduce(
    (total, page) => total + ((page as UnknownRecord).count as number),
    0,
  );

  return totals.pages === value.pages.length &&
    totals.pages === Math.ceil(openOpportunities / pageSize) &&
    pageCount === openOpportunities &&
    new Set(filePaths).size === filePaths.length &&
    value.pages.every(
      (page, index) => (page as UnknownRecord).page === index + 1,
    );
}

function isStaticFacetIndex(value: unknown): value is StaticFacetIndex {
  if (!isRecord(value) || !isRecord(value.labels)) return false;

  return isTimestamp(value.generatedAt) &&
    isOpportunityFacetIndexDimensions(value.dimensions) &&
    (value.labels.authors === undefined || isStringRecord(value.labels.authors));
}

function isStaticSearchIndex(value: unknown): value is StaticSearchIndex {
  if (!isRecord(value) || !Array.isArray(value.items)) return false;

  return isTimestamp(value.generatedAt) && value.items.every((item) =>
    isRecord(item) && isNonEmptyString(item.id) && isString(item.text)
  );
}

function isStaticOpportunityOrder(
  value: unknown,
): value is StaticOpportunityOrder {
  return isRecord(value) &&
    isTimestamp(value.generatedAt) &&
    isUniqueIdentifierArray(value.ids);
}

function isStaticOpportunityPageLookup(
  value: unknown,
): value is StaticOpportunityPageLookup {
  if (
    !isRecord(value) ||
    !isTimestamp(value.generatedAt) ||
    !isRecord(value.pageLookup)
  ) return false;

  return Object.entries(value.pageLookup).every(
    ([id, file]) => id.length > 0 && isNonEmptyString(file),
  );
}

function isStaticOpportunityPage(
  value: unknown,
): value is StaticOpportunityPage {
  if (
    !isRecord(value) ||
    !isTimestamp(value.generatedAt) ||
    !Array.isArray(value.items)
  ) return false;

  const ids = new Set<string>();
  for (const item of value.items) {
    if (!isOpportunityItem(item) || ids.has(item.id)) return false;
    ids.add(item.id);
  }

  return true;
}

function isStaticOpportunityBucket(
  value: unknown,
): value is StaticOpportunityBucket {
  if (
    !isRecord(value) ||
    !isTimestamp(value.generatedAt) ||
    !isRecord(value.items)
  ) return false;

  return Object.entries(value.items).every(
    ([id, item]) => isNonEmptyString(id) && isOpportunityItem(item) && item.id === id,
  );
}

function parseArtifact<T extends object>(params: {
  value: unknown;
  path: string;
  name: string;
  cache: WeakMap<object, T>;
  validate: ArtifactValidator<T>;
}): T {
  if (isObjectReference(params.value)) {
    const cached = params.cache.get(params.value);
    if (cached) return cached;
  }

  if (!params.validate(params.value)) {
    throw new Error(
      `Invalid static opportunity ${params.name} at ${params.path}`,
    );
  }

  params.cache.set(params.value, params.value);
  return params.value;
}

export function parseStaticOpportunityManifest(
  value: unknown,
  path: string,
): StaticManifest {
  return parseArtifact({
    value,
    path,
    name: "manifest",
    cache: MANIFEST_CACHE,
    validate: isStaticManifest,
  });
}

export function parseStaticOpportunityFacetIndex(
  value: unknown,
  path: string,
): StaticFacetIndex {
  return parseArtifact({
    value,
    path,
    name: "facet index",
    cache: FACET_INDEX_CACHE,
    validate: isStaticFacetIndex,
  });
}

export function parseStaticOpportunitySearchIndex(
  value: unknown,
  path: string,
): StaticSearchIndex {
  return parseArtifact({
    value,
    path,
    name: "search index",
    cache: SEARCH_INDEX_CACHE,
    validate: isStaticSearchIndex,
  });
}

export function parseStaticOpportunityOrder(
  value: unknown,
  path: string,
): StaticOpportunityOrder {
  return parseArtifact({
    value,
    path,
    name: "order index",
    cache: ORDER_CACHE,
    validate: isStaticOpportunityOrder,
  });
}

export function parseStaticOpportunityPromotions(
  value: unknown,
  path: string,
): StaticOpportunityOrder {
  return parseArtifact({
    value,
    path,
    name: "promotions index",
    cache: PROMOTIONS_CACHE,
    validate: isStaticOpportunityOrder,
  });
}

export function parseStaticOpportunityJobIds(
  value: unknown,
  path: string,
): StaticOpportunityOrder {
  return parseArtifact({
    value,
    path,
    name: "job id index",
    cache: JOB_IDS_CACHE,
    validate: isStaticOpportunityOrder,
  });
}

export function parseStaticOpportunityPageLookup(
  value: unknown,
  path: string,
): StaticOpportunityPageLookup {
  return parseArtifact({
    value,
    path,
    name: "page lookup",
    cache: PAGE_LOOKUP_CACHE,
    validate: isStaticOpportunityPageLookup,
  });
}

export function parseStaticOpportunityPage(
  value: unknown,
  path: string,
): StaticOpportunityPage {
  return parseArtifact({
    value,
    path,
    name: "page",
    cache: PAGE_CACHE,
    validate: isStaticOpportunityPage,
  });
}

export function parseStaticOpportunityBucket(
  value: unknown,
  path: string,
): StaticOpportunityBucket {
  return parseArtifact({
    value,
    path,
    name: "item bucket",
    cache: BUCKET_CACHE,
    validate: isStaticOpportunityBucket,
  });
}
