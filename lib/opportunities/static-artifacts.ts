import type {
  StaticCommunities,
  StaticFacetIndex,
  StaticManifest,
  StaticSearchIndex,
  StaticCommunityStatus,
  StaticCommunityStatusHistory,
  StaticOpportunityAliases,
} from "./api-types";
import {
  parseStaticCommunityStatus,
  parseStaticCommunityStatusHistory,
  parseStaticOpportunityAliases,
} from "./discovery-artifact-validation";
import { parseStaticCommunities } from "./community-artifact-validation";
import {
  parseStaticOpportunityBucket,
  parseStaticOpportunityFacetIndex,
  parseStaticOpportunityJobIds,
  parseStaticOpportunityManifest,
  parseStaticOpportunityOrder,
  parseStaticOpportunityPage,
  parseStaticOpportunityPageLookup,
  parseStaticOpportunitySearchIndex,
  type StaticOpportunityBucket,
  type StaticOpportunityOrder,
  type StaticOpportunityPage,
  type StaticOpportunityPageLookup,
} from "./static-artifact-validation";
import { fetchStaticJson } from "./fetch-static-json";
import { uniqueOpportunityIds } from "./index-operations";
import {
  createStaticArtifactViewToken,
  isStaticArtifactOutsideView,
  versionStaticArtifactPath,
} from "./static-artifact-versioning";
import { captureTechnicalException } from "@/lib/telemetry";

type StaticArtifactParser<T> = (value: unknown, path: string) => T;

interface StaticArtifactView {
  id: number;
  baseKey: string;
  generatedAt: string;
  token: string;
  manifest: StaticManifest;
}

interface PendingStaticArtifactRecovery {
  baseKey: string | null;
  attempt: number;
}

class StaticArtifactViewChangedError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "StaticArtifactViewChangedError";
  }
}

const MAX_STATIC_ARTIFACT_RECOVERY_ATTEMPTS = 2;
const MANIFEST_PATH = "api/manifest.json";

// Upstream artifact paths are mutable. Keep one validated view per module
// lifetime so a refreshed manifest is never combined with previously cached
// dependent artifacts; a reload or rebuild starts a fresh view. Any failed
// fetch, parse, or generation mismatch invalidates that view atomically.
const FACET_INDEX_CACHE = new Map<string, Promise<StaticFacetIndex>>();
const COMMUNITIES_CACHE = new Map<string, Promise<StaticCommunities>>();
const STATUS_CACHE = new Map<string, Promise<StaticCommunityStatus>>();
const STATUS_HISTORY_CACHE = new Map<string, Promise<StaticCommunityStatusHistory>>();
const ALIASES_CACHE = new Map<string, Promise<StaticOpportunityAliases>>();
const SEARCH_INDEX_CACHE = new Map<string, Promise<StaticSearchIndex>>();
const ORDER_CACHE = new Map<string, Promise<StaticOpportunityOrder>>();
const JOB_IDS_CACHE = new Map<string, Promise<StaticOpportunityOrder>>();
const PAGE_LOOKUP_CACHE = new Map<string, Promise<StaticOpportunityPageLookup>>();
const PAGE_CACHE = new Map<string, Promise<StaticOpportunityPage>>();
const BUCKET_CACHE = new Map<string, Promise<StaticOpportunityBucket>>();
const INDEX_CONSISTENCY_CACHE = new Map<string, Promise<void>>();
const VIEW_BY_MANIFEST = new WeakMap<StaticManifest, StaticArtifactView>();

let activeStaticArtifactView: StaticArtifactView | null = null;
let activeStaticArtifactViewRequest: Promise<StaticArtifactView> | null = null;
let pendingStaticArtifactRecovery: PendingStaticArtifactRecovery | null = null;
let staticArtifactViewSequence = 0;

function clearStaticArtifactCaches() {
  FACET_INDEX_CACHE.clear();
  COMMUNITIES_CACHE.clear();
  STATUS_CACHE.clear();
  STATUS_HISTORY_CACHE.clear();
  ALIASES_CACHE.clear();
  SEARCH_INDEX_CACHE.clear();
  ORDER_CACHE.clear();
  JOB_IDS_CACHE.clear();
  PAGE_LOOKUP_CACHE.clear();
  PAGE_CACHE.clear();
  BUCKET_CACHE.clear();
  INDEX_CONSISTENCY_CACHE.clear();
}

function staticArtifactBaseKey(manifest: StaticManifest) {
  return `${manifest.generatedAt}:${manifest.dataHash}`;
}

function buildStaticArtifactView(sourceManifest: StaticManifest): StaticArtifactView {
  const baseKey = staticArtifactBaseKey(sourceManifest);
  const generatedAt = sourceManifest.generatedAt;
  const manifest = sourceManifest;
  const id = ++staticArtifactViewSequence;
  const view: StaticArtifactView = {
    id,
    baseKey,
    generatedAt,
    token: createStaticArtifactViewToken({
      manifestGeneratedAt: sourceManifest.generatedAt,
      dataHash: sourceManifest.dataHash,
      viewGeneratedAt: generatedAt,
      viewNonce: id,
    }),
    manifest,
  };
  VIEW_BY_MANIFEST.set(manifest, view);
  return view;
}

function manifestPathForRecovery(
  recovery: PendingStaticArtifactRecovery | null,
): string {
  if (!recovery) return MANIFEST_PATH;

  return versionStaticArtifactPath(
    MANIFEST_PATH,
    [
      "recovery",
      recovery.baseKey ?? "unknown-view",
      recovery.attempt,
      staticArtifactViewSequence + 1,
    ].join(":"),
  );
}

function loadStaticArtifactView(): Promise<StaticArtifactView> {
  if (activeStaticArtifactView) return Promise.resolve(activeStaticArtifactView);
  if (activeStaticArtifactViewRequest) return activeStaticArtifactViewRequest;

  const recovery = pendingStaticArtifactRecovery;
  const manifestPath = manifestPathForRecovery(recovery);
  const request = fetchStaticJson(manifestPath, { cache: "force-cache" })
    .then((payload) => parseStaticOpportunityManifest(payload, MANIFEST_PATH))
    .then((manifest) => {
      const view = buildStaticArtifactView(manifest);
      activeStaticArtifactView = view;
      pendingStaticArtifactRecovery = null;
      return view;
    })
    .catch((error) => {
      pendingStaticArtifactRecovery = {
        baseKey: recovery?.baseKey ?? null,
        attempt: (recovery?.attempt ?? 0) + 1,
      };
      clearStaticArtifactCaches();
      throw new StaticArtifactViewChangedError(
        `Unable to load the static opportunity manifest at ${MANIFEST_PATH}`,
        { cause: error },
      );
    })
    .finally(() => {
      if (activeStaticArtifactViewRequest === request) {
        activeStaticArtifactViewRequest = null;
      }
    });

  activeStaticArtifactViewRequest = request;
  return request;
}

function invalidateStaticArtifactView(
  view: StaticArtifactView,
): void {
  if (activeStaticArtifactView?.id !== view.id) {
    return;
  }

  pendingStaticArtifactRecovery = {
    baseKey: view.baseKey,
    attempt: 1,
  };
  activeStaticArtifactView = null;
  activeStaticArtifactViewRequest = null;
  clearStaticArtifactCaches();
}

function retryStaticArtifactView(
  view: StaticArtifactView,
  message: string,
  options?: ErrorOptions,
): never {
  invalidateStaticArtifactView(view);
  throw new StaticArtifactViewChangedError(message, options);
}

function viewForManifest(manifest: StaticManifest): StaticArtifactView {
  const view = VIEW_BY_MANIFEST.get(manifest);
  if (!view) {
    throw new Error("Static opportunity manifest is not attached to an active view");
  }
  return view;
}

function assertStaticArtifactViewIsActive(
  view: StaticArtifactView,
  path: string,
): void {
  if (activeStaticArtifactView?.id !== view.id) {
    throw new StaticArtifactViewChangedError(
      `Static opportunity artifact view changed while loading ${path}`,
    );
  }
}

async function loadStaticArtifact<T>(
  path: string,
  parse: StaticArtifactParser<T>,
  artifactCache: Map<string, Promise<T>>,
  options: { cache?: RequestCache } = {},
) {
  const cached = artifactCache.get(path);
  if (cached) return cached;

  const request = fetchStaticJson(path, options).then((payload) =>
    parse(payload, path)
  );
  artifactCache.set(path, request);
  request.catch(() => {
    if (artifactCache.get(path) === request) artifactCache.delete(path);
  });
  return request;
}

async function loadVersionedStaticArtifact<T extends { generatedAt: string }>(
  path: string,
  manifest: StaticManifest,
  parse: StaticArtifactParser<T>,
  artifactCache: Map<string, Promise<T>>,
): Promise<T> {
  const view = viewForManifest(manifest);
  const versionedPath = versionStaticArtifactPath(path, view.token);
  try {
    assertStaticArtifactViewIsActive(view, versionedPath);
    const artifact = await loadStaticArtifact(
      versionedPath,
      parse,
      artifactCache,
    );
    assertStaticArtifactViewIsActive(view, versionedPath);
    if (isStaticArtifactOutsideView({
      artifactGeneratedAt: artifact.generatedAt,
      viewGeneratedAt: view.generatedAt,
    })) {
      invalidateStaticArtifactView(view);
      throw new StaticArtifactViewChangedError(
        `Static opportunity artifact generation does not match the active view at ${versionedPath}`,
      );
    }
    return artifact;
  } catch (error) {
    if (error instanceof StaticArtifactViewChangedError) throw error;
    retryStaticArtifactView(
      view,
      `Unable to load a consistent static opportunity artifact at ${versionedPath}`,
      { cause: error },
    );
    throw error;
  }
}

export async function withStaticArtifactRecovery<T>(
  operation: () => Promise<T>,
): Promise<T> {
  for (
    let attempt = 0;
    attempt <= MAX_STATIC_ARTIFACT_RECOVERY_ATTEMPTS;
    attempt += 1
  ) {
    try {
      return await operation();
    } catch (error) {
      if (!(error instanceof StaticArtifactViewChangedError)) throw error;
      if (attempt === MAX_STATIC_ARTIFACT_RECOVERY_ATTEMPTS) {
        const exhaustedError = new Error(
          "Static opportunity artifact view could not be stabilized",
          { cause: error },
        );
        captureTechnicalException(exhaustedError, {
          category: "static-artifact-unavailable",
        });
        throw exhaustedError;
      }
    }
  }

  throw new Error("Static opportunity artifact recovery exhausted");
}

export async function loadOpportunityManifest() {
  return (await loadStaticArtifactView()).manifest;
}

export function loadOpportunityCommunities(manifest: StaticManifest) {
  return loadVersionedStaticArtifact(
    manifest.files.communities,
    manifest,
    parseStaticCommunities,
    COMMUNITIES_CACHE,
  );
}

export function loadCommunityStatus(manifest: StaticManifest) {
  return loadVersionedStaticArtifact(
    manifest.files.status,
    manifest,
    parseStaticCommunityStatus,
    STATUS_CACHE,
  );
}

export async function loadCommunityStatusHistory(
  manifest: StaticManifest,
): Promise<StaticCommunityStatusHistory | null> {
  const path = manifest.files.statusHistory;
  if (!path) return null;

  const view = viewForManifest(manifest);
  const versionedPath = versionStaticArtifactPath(path, view.token);
  try {
    assertStaticArtifactViewIsActive(view, versionedPath);
    const artifact = await loadStaticArtifact(
      versionedPath,
      parseStaticCommunityStatusHistory,
      STATUS_HISTORY_CACHE,
    );
    assertStaticArtifactViewIsActive(view, versionedPath);
    if (isStaticArtifactOutsideView({
      artifactGeneratedAt: artifact.generatedAt,
      viewGeneratedAt: view.generatedAt,
    })) return null;
    return artifact;
  } catch {
    return null;
  }
}

export function loadOpportunityAliases(manifest: StaticManifest) {
  return loadVersionedStaticArtifact(
    manifest.files.aliases,
    manifest,
    parseStaticOpportunityAliases,
    ALIASES_CACHE,
  );
}

export function loadOpportunityFacetIndex(
  manifest: StaticManifest,
) {
  return loadVersionedStaticArtifact(
    manifest.files.facets,
    manifest,
    parseStaticOpportunityFacetIndex,
    FACET_INDEX_CACHE,
  );
}

export function loadOpportunitySearchIndex(
  manifest: StaticManifest,
) {
  return loadVersionedStaticArtifact(
    manifest.files.search,
    manifest,
    parseStaticOpportunitySearchIndex,
    SEARCH_INDEX_CACHE,
  );
}

export async function loadOpportunityOrder(
  manifest: StaticManifest,
) {
  const payload = await loadVersionedStaticArtifact(
    manifest.files.order,
    manifest,
    parseStaticOpportunityOrder,
    ORDER_CACHE,
  );
  return payload.ids;
}

export async function loadOpportunityJobIds(
  manifest: StaticManifest,
) {
  const payload = await loadVersionedStaticArtifact(
    manifest.files.jobIds,
    manifest,
    parseStaticOpportunityJobIds,
    JOB_IDS_CACHE,
  );
  return payload.ids;
}

export async function assertStaticOpportunityIndexConsistency(
  manifest: StaticManifest,
): Promise<void> {
  const view = viewForManifest(manifest);
  const existing = INDEX_CONSISTENCY_CACHE.get(view.token);
  if (existing) return existing;

  const request = Promise.all([
    loadVersionedStaticArtifact(
      manifest.files.order,
      manifest,
      parseStaticOpportunityOrder,
      ORDER_CACHE,
    ),
    loadVersionedStaticArtifact(
      manifest.files.jobIds,
      manifest,
      parseStaticOpportunityJobIds,
      JOB_IDS_CACHE,
    ),
    loadVersionedStaticArtifact(
      manifest.files.pageLookup,
      manifest,
      parseStaticOpportunityPageLookup,
      PAGE_LOOKUP_CACHE,
    ),
  ]).then(([order, jobIds, pageLookup]) => {
    const orderIds = new Set(order.ids);
    const jobIdSet = new Set(jobIds.ids);
    const lookupIds = new Set(Object.keys(pageLookup.pageLookup));
    const expectedCount = manifest.totals.openOpportunities;
    const setsMatch = orderIds.size === expectedCount &&
      jobIdSet.size === expectedCount &&
      lookupIds.size === expectedCount &&
      order.ids.every((id) => jobIdSet.has(id) && lookupIds.has(id));

    if (!setsMatch) {
      retryStaticArtifactView(
        view,
        "Static opportunity order, job IDs, page lookup, and manifest total do not match",
      );
    }
  });

  INDEX_CONSISTENCY_CACHE.set(view.token, request);
  request.catch(() => {
    if (INDEX_CONSISTENCY_CACHE.get(view.token) === request) {
      INDEX_CONSISTENCY_CACHE.delete(view.token);
    }
  });
  return request;
}

export async function loadOpportunityItems(
  ids: string[],
  manifest: StaticManifest,
) {
  const lookup = await loadVersionedStaticArtifact(
    manifest.files.pageLookup,
    manifest,
    parseStaticOpportunityPageLookup,
    PAGE_LOOKUP_CACHE,
  );
  const missingLookupId = ids.find((id) => !lookup.pageLookup[id]);
  if (missingLookupId) {
    retryStaticArtifactView(
      viewForManifest(manifest),
      `Invalid static opportunity page lookup at ${manifest.files.pageLookup}: missing ${missingLookupId}`,
    );
  }

  const files = uniqueOpportunityIds(
    ids.map((id) => lookup.pageLookup[id]).filter(Boolean),
  );
  const pages = await Promise.all(
    files.map((file) =>
      loadVersionedStaticArtifact(
        file,
        manifest,
        parseStaticOpportunityPage,
        PAGE_CACHE,
      )
    ),
  );
  const itemsById = new Map(
    pages.flatMap((page) => page.items.map((item) => [item.id, item] as const)),
  );
  return ids.map((id) => {
    const item = itemsById.get(id);
    if (!item) {
      retryStaticArtifactView(
        viewForManifest(manifest),
        `Invalid static opportunity page at ${lookup.pageLookup[id]}: missing ${id}`,
      );
    }
    return item;
  });
}

export async function loadOpportunityById(id: string) {
  const manifest = await loadOpportunityManifest();
  await assertStaticOpportunityIndexConsistency(manifest);
  const aliases = await loadOpportunityAliases(manifest);
  const canonicalId = aliases.ids[id] ?? id;
  const jobIds = await loadOpportunityJobIds(manifest);
  if (!jobIds.includes(canonicalId)) return null;

  const bucket = canonicalId.replace(/^gh_/, "").slice(0, 2) || "unknown";
  const path = `api/jobs/${encodeURIComponent(bucket)}.json`;
  const payload = await loadVersionedStaticArtifact(
    path,
    manifest,
    parseStaticOpportunityBucket,
    BUCKET_CACHE,
  );
  const item = payload.items[canonicalId];
  if (!item) {
    retryStaticArtifactView(
      viewForManifest(manifest),
      `Invalid static opportunity bucket at ${path}: missing ${canonicalId}`,
    );
  }
  return item;
}
