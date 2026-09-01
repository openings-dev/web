import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import ts from "typescript";

function transpile(source) {
  return ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
}

function dataModule(source) {
  const javascript = transpile(source);
  return `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`;
}

const contractsSource = await readFile("lib/telemetry/contracts.ts", "utf8");
const contractsUrl = dataModule(contractsSource);
const contracts = await import(contractsUrl);
const sanitizeSource = await readFile("lib/telemetry/sanitize.ts", "utf8");
const sanitizeJavaScript = transpile(sanitizeSource).replace(
  '"./contracts"',
  `"${contractsUrl}"`,
);
const sanitizeUrl = `data:text/javascript;base64,${Buffer.from(sanitizeJavaScript).toString("base64")}`;
const sanitize = await import(sanitizeUrl);

assert.deepEqual(Object.keys(contracts.TELEMETRY_EVENT_FIELDS), [
  "Search Submitted",
  "Filter Applied",
  "Discovery Shortcut Opened",
  "Job Viewed",
  "Original Listing Opened",
  "Job Saved",
  "Comparison Opened",
  "Community Viewed",
  "Status Viewed",
  "Updates Viewed",
]);

assert.equal(sanitize.sanitizeProductEvent("Unknown Event", {}), null);
assert.deepEqual(sanitize.sanitizeProductEvent("Filter Applied", {
  dimension: "country",
  value: "United States",
  locale: "en-US",
  query: "senior react engineer",
  email: "person@example.com",
  arbitrary: "keep-me",
}), {
  name: "Filter Applied",
  properties: {
    dimension: "country",
    value: "united-states",
    locale: "en-US",
  },
});

assert.deepEqual(sanitize.sanitizeProductEvent("Job Viewed", {
  jobId: "a".repeat(97),
  age: "0-7",
  sponsored: false,
  sourceCount: 2,
  url: "https://example.com/private?q=react",
}), {
  name: "Job Viewed",
  properties: { age: "0-7", sourceCount: 2 },
});

assert.equal(
  sanitize.stripUrlDetails("https://openings.dev/jobs/1?query=secret#apply"),
  "https://openings.dev/jobs/1",
);
const sentry = sanitize.sanitizeSentryEvent({
  environment: "production",
  release: "abc123",
  user: { email: "person@example.com", ip_address: "127.0.0.1" },
  request: {
    url: "https://openings.dev/jobs/1?query=secret",
    headers: { authorization: "secret" },
    cookies: "secret",
    data: "search text",
    query_string: "query=secret",
  },
  tags: { category: "static-artifact-unavailable", email: "person@example.com" },
  extra: { filters: "react" },
  exception: { values: [{ type: "TypeError", value: "Failed at person@example.com" }] },
});
assert.equal(sentry.user, undefined);
assert.equal(sentry.request, undefined);
assert.equal(sentry.extra, undefined);
assert.deepEqual(sentry.tags, { category: "static-artifact-unavailable" });
assert.doesNotMatch(JSON.stringify(sentry), /person@example\.com|query=secret|authorization/u);

const [clientSource, serverSource, instrumentationSource, globalErrorSource,
  nextConfigSource, staticArtifactsSource] = await Promise.all([
  readFile("instrumentation-client.ts", "utf8"),
  readFile("sentry.server.config.ts", "utf8"),
  readFile("instrumentation.ts", "utf8"),
  readFile("app/global-error.tsx", "utf8"),
  readFile("next.config.ts", "utf8"),
  readFile("lib/opportunities/static-artifacts.ts", "utf8"),
]);
assert.match(clientSource, /sendDefaultPii:\s*false/u);
assert.match(clientSource, /replaysSessionSampleRate:\s*0/u);
assert.match(clientSource, /replaysOnErrorSampleRate:\s*0/u);
assert.match(clientSource, /tracesSampleRate:\s*0\.05/u);
assert.match(clientSource, /beforeSend:/u);
assert.match(serverSource, /sendDefaultPii:\s*false/u);
assert.match(serverSource, /tracesSampleRate:\s*0/u);
assert.match(instrumentationSource, /NEXT_RUNTIME\s*===\s*"nodejs"/u);
assert.match(globalErrorSource, /captureException/u);
assert.doesNotMatch(globalErrorSource, /error\.message/u);
assert.match(nextConfigSource, /output:\s*"export"/u);
assert.match(nextConfigSource, /withSentryConfig/u);
assert.match(nextConfigSource, /@sentry\/nextjs\/config/u);
assert.match(nextConfigSource, /removeDebugLogging:\s*true/u);
assert.doesNotMatch(nextConfigSource, /disableLogger/u);
assert.match(nextConfigSource, /deleteSourcemapsAfterUpload:\s*true/u);
assert.match(staticArtifactsSource, /static-artifact-unavailable/u);

const consentSource = await readFile("lib/telemetry/consent.ts", "utf8");
const consent = await import(dataModule(consentSource));
const storageValues = new Map();
const storage = {
  getItem: (key) => storageValues.get(key) ?? null,
  setItem: (key, value) => storageValues.set(key, value),
};
assert.equal(consent.readAnalyticsConsent(storage), "undecided");
storageValues.set(consent.ANALYTICS_CONSENT_KEY, "not-json");
assert.equal(consent.readAnalyticsConsent(storage), "undecided");
storageValues.set(consent.ANALYTICS_CONSENT_KEY, JSON.stringify({
  version: 2,
  state: "granted",
  updatedAt: "2026-09-01T00:00:00.000Z",
}));
assert.equal(consent.readAnalyticsConsent(storage), "undecided");
storageValues.set(consent.ANALYTICS_CONSENT_KEY, JSON.stringify({
  version: 1,
  state: "granted",
  updatedAt: "2026-09-01T00:00:00.000Z",
}));
assert.equal(consent.readAnalyticsConsent(storage), "granted");
assert.equal(consent.writeAnalyticsConsent("denied", storage), true);
assert.equal(consent.readAnalyticsConsent(storage), "denied");
assert.equal(consent.readAnalyticsConsent({
  getItem: () => { throw new Error("blocked"); },
  setItem: () => { throw new Error("blocked"); },
}), "undecided");
assert.equal(consent.writeAnalyticsConsent("granted", {
  getItem: () => null,
  setItem: () => { throw new Error("blocked"); },
}), false);

const mixpanelSource = await readFile("lib/telemetry/mixpanel-client.ts", "utf8");
assert.doesNotMatch(mixpanelSource, /^import .* from ["']mixpanel-browser["']/mu);
assert.match(mixpanelSource, /import\("mixpanel-browser"\)/u);
assert.match(mixpanelSource, /autocapture:\s*false/u);
assert.match(mixpanelSource, /track_pageview:\s*false/u);
assert.match(mixpanelSource, /record_sessions_percent:\s*0/u);
assert.match(mixpanelSource, /ip:\s*false/u);
assert.match(mixpanelSource, /stop_utm_persistence:\s*true/u);

for (const locale of ["en", "pt", "es", "it", "fr", "de"]) {
  const translationSource = await readFile(`lib/translations/${locale}.ts`, "utf8");
  assert.match(translationSource, /analyticsConsent:/u);
}

const productCallSites = await Promise.all([
  readFile("app/opportunities/_components/opportunities-screen/controller/use-discovery-telemetry.ts", "utf8"),
  readFile("app/opportunities/_components/opportunities-screen/opportunities-quick-filters/discovery-shortcuts/index.tsx", "utf8"),
  readFile("app/opportunities/_components/opportunity-details/index.tsx", "utf8"),
  readFile("app/opportunities/_components/opportunities-screen/comparison-panel/index.tsx", "utf8"),
  readFile("app/communities/[owner]/[name]/_components/community-telemetry.tsx", "utf8"),
  readFile("app/status/_components/status-telemetry.tsx", "utf8"),
  readFile("app/updates/_components/updates-telemetry.tsx", "utf8"),
]);
for (const event of Object.keys(contracts.TELEMETRY_EVENT_FIELDS)) {
  const pattern = new RegExp(`trackProductEvent\\(\\s*["']${event}["']`, "gu");
  const matches = productCallSites.flatMap((source) => source.match(pattern) ?? []);
  assert.equal(matches.length, 1, `${event} must have one explicit call site`);
}

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = `${directory}/${entry.name}`;
    return entry.isDirectory() ? sourceFiles(path)
      : /\.(?:ts|tsx)$/u.test(entry.name) ? [path] : [];
  }));
  return nested.flat();
}
for (const path of await sourceFiles("app")) {
  if (path === "app/global-error.tsx") continue;
  const source = await readFile(path, "utf8");
  assert.doesNotMatch(source, /from ["'](?:mixpanel-browser|@sentry\/)/u);
}

const facadeJavaScript = `
  let handler = null;
  export function setProductEventHandler(next) { handler = next; }
  export function emit(name, properties) { handler?.(name, properties); }
`;
const facadeUrl = `data:text/javascript;base64,${Buffer.from(facadeJavaScript).toString("base64")}`;
const facade = await import(facadeUrl);
const consentUrl = dataModule(consentSource);
const mixpanelJavaScript = transpile(mixpanelSource)
  .replace('"./consent"', `"${consentUrl}"`)
  .replace('"."', `"${facadeUrl}"`);
const mixpanelUrl = `data:text/javascript;base64,${Buffer.from(mixpanelJavaScript).toString("base64")}`;
const mixpanel = await import(mixpanelUrl);
const lifecycleValues = new Map();
const lifecycleStorage = {
  get length() { return lifecycleValues.size; },
  getItem: (key) => lifecycleValues.get(key) ?? null,
  setItem: (key, value) => lifecycleValues.set(key, value),
  removeItem: (key) => lifecycleValues.delete(key),
  key: (index) => [...lifecycleValues.keys()][index] ?? null,
};
const previousWindow = globalThis.window;
const previousToken = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
const previousApiHost = process.env.NEXT_PUBLIC_MIXPANEL_API_HOST;
globalThis.window = { localStorage: lifecycleStorage };
process.env.NEXT_PUBLIC_MIXPANEL_TOKEN = "public-token";
delete process.env.NEXT_PUBLIC_MIXPANEL_API_HOST;
let loads = 0;
let tracked = 0;
let initializedConfig;
const fakeSdk = {
  init: (_token, config) => {
    initializedConfig = config;
    lifecycleValues.set("mp_public-token_mixpanel", "identity");
  },
  opt_in_tracking: () => undefined,
  opt_out_tracking: () => lifecycleValues.set("__mp_opt_in_out_public-token", "0"),
  reset: () => lifecycleValues.set("mp_public-token_mixpanel", "new-identity"),
  track: () => { tracked += 1; },
};
mixpanel.setMixpanelLoaderForTests(async () => {
  loads += 1;
  return { default: fakeSdk };
});
assert.equal(await mixpanel.enableAnalytics(), false);
assert.equal(loads, 0);
consent.writeAnalyticsConsent("denied", lifecycleStorage);
assert.equal(await mixpanel.enableAnalytics(), false);
assert.equal(loads, 0);
consent.writeAnalyticsConsent("granted", lifecycleStorage);
assert.equal(await mixpanel.enableAnalytics(), true);
assert.equal(loads, 1);
assert.equal(initializedConfig.autocapture, false);
assert.equal(initializedConfig.api_host, "https://api.mixpanel.com");
facade.emit("Status Viewed", { health: "healthy" });
assert.equal(tracked, 1);
consent.writeAnalyticsConsent("denied", lifecycleStorage);
mixpanel.disableAnalytics();
facade.emit("Status Viewed", { health: "healthy" });
assert.equal(tracked, 1);
assert.equal(lifecycleValues.has("mp_public-token_mixpanel"), false);
consent.writeAnalyticsConsent("granted", lifecycleStorage);
delete process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
assert.equal(await mixpanel.enableAnalytics(), false);
assert.equal(loads, 1);
if (previousWindow === undefined) delete globalThis.window;
else globalThis.window = previousWindow;
if (previousToken === undefined) delete process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
else process.env.NEXT_PUBLIC_MIXPANEL_TOKEN = previousToken;
if (previousApiHost === undefined) delete process.env.NEXT_PUBLIC_MIXPANEL_API_HOST;
else process.env.NEXT_PUBLIC_MIXPANEL_API_HOST = previousApiHost;

console.log("Privacy-first telemetry contract is valid.");
