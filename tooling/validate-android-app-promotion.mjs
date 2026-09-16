import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

function dataModule(source) {
  const javascript = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;

  return `data:text/javascript;base64,${Buffer.from(javascript).toString("base64")}`;
}

const source = await readFile("components/android-app-promotion/dismissal.ts", "utf8");
const dismissal = await import(dataModule(source));
const translationTypes = await readFile("lib/translations/types.ts", "utf8");
assert.match(
  translationTypes,
  /androidAppPromotion:\s*\{\s*title:\s*string;\s*description:\s*string;\s*action:\s*string;\s*closeLabel:\s*string;/s,
);

for (const [locale, exportName] of [
  ["en", "enTranslations"],
  ["pt", "ptTranslations"],
  ["es", "esTranslations"],
  ["it", "itTranslations"],
  ["fr", "frTranslations"],
  ["de", "deTranslations"],
]) {
  const localeSource = await readFile(`lib/translations/${locale}.ts`, "utf8");
  const dictionary = (await import(dataModule(localeSource)))[exportName];
  assert.ok(dictionary?.androidAppPromotion, `${locale} promotion copy is missing`);

  for (const key of ["title", "description", "action", "closeLabel"]) {
    assert.match(
      localeSource,
      new RegExp(`${key}: \\"[^\\"]+\\"`),
      `${locale} ${key} must be a non-empty double-quoted string`,
    );
    assert.ok(dictionary.androidAppPromotion[key], `${locale} ${key} is empty`);
  }
}

const values = new Map();
const storage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
};

assert.equal(
  dismissal.ANDROID_APP_PROMOTION_DISMISSED_KEY,
  "openings:android-app-promotion:dismissed:v1",
);
assert.equal(dismissal.readAndroidAppPromotionDismissed(storage), false);
assert.equal(dismissal.writeAndroidAppPromotionDismissed(storage), true);
assert.equal(dismissal.readAndroidAppPromotionDismissed(storage), true);
assert.equal(
  dismissal.readAndroidAppPromotionDismissed({
    getItem: () => {
      throw new Error("storage unavailable");
    },
    setItem: storage.setItem,
  }),
  false,
);
assert.equal(
  dismissal.writeAndroidAppPromotionDismissed({
    getItem: storage.getItem,
    setItem: () => {
      throw new Error("storage unavailable");
    },
  }),
  false,
);

const [
  componentSource,
  layoutSource,
  globalsSource,
  comparisonPanelSource,
  routesSource,
  telemetryContractsSource,
] = await Promise.all([
  readFile("components/android-app-promotion/index.tsx", "utf8"),
  readFile("app/layout.tsx", "utf8"),
  readFile("app/globals.css", "utf8"),
  readFile("app/opportunities/_components/opportunities-screen/comparison-panel/index.tsx", "utf8"),
  readFile("lib/navigation/routes.ts", "utf8"),
  readFile("lib/telemetry/contracts.ts", "utf8"),
]);

assert.match(layoutSource, /<AndroidAppPromotion\s*\/>/u);
assert.match(componentSource, /EXTERNAL_ROUTES\.androidApp/u);
assert.match(componentSource, /consent\s*===\s*["']undecided["']/u);
assert.match(componentSource, /target=["']_blank["']/u);
assert.match(componentSource, /rel=["']noreferrer["']/u);
assert.match(componentSource, /aria-label=\{copy\.closeLabel\}/u);
assert.match(componentSource, /data-android-app-promotion/u);
assert.match(
  componentSource,
  /max-h-\[calc\(100dvh-1\.5rem-env\(safe-area-inset-bottom\)\)\]/u,
);
assert.match(componentSource, /overflow-x-hidden overflow-y-auto/u);
assert.equal(
  (componentSource.match(/\[overflow-wrap:anywhere\]/gu) ?? []).length,
  2,
);
assert.match(componentSource, /className="mt-4 flex flex-wrap items-center gap-2"/u);
assert.match(
  componentSource,
  /className="!h-auto min-h-11 min-w-0 max-w-full !whitespace-normal py-2 text-left"/u,
);
assert.match(
  componentSource,
  /trackProductEvent\(\s*["']Android App Promotion Opened["']\s*,\s*\{\s*locale\s*[,}]/u,
);
assert.match(comparisonPanelSource, /data-comparison-panel/u);
assert.match(
  globalsSource,
  /body:has\(\[data-comparison-panel\]\)\s+\[data-android-app-promotion\]/u,
);
assert.match(
  routesSource,
  /androidApp:\s*["']https:\/\/play\.google\.com\/store\/apps\/details\?id=dev\.openings\.mobile["']/u,
);
assert.match(
  telemetryContractsSource,
  /["']Android App Promotion Opened["']:\s*\{\s*locale:\s*string\s*\};/u,
);

console.log("Android app promotion contract validated.");
