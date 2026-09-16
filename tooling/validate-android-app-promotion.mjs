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

console.log("Android app promotion contract validated.");
