import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const localeFiles = ["en", "pt", "es", "it", "fr", "de"].map(
  (locale) => `lib/translations/${locale}.ts`,
);

const [routes, footer, promotion, types, ...locales] = await Promise.all([
  readFile("lib/navigation/routes.ts", "utf8"),
  readFile("components/footer/index.tsx", "utf8"),
  readFile("components/footer/footer-promotion/index.tsx", "utf8"),
  readFile("lib/translations/types.ts", "utf8"),
  ...localeFiles.map((file) => readFile(file, "utf8")),
]);

assert.match(routes, /iosApp:\s*"https:\/\/apps\.apple\.com\//u);
assert.match(routes, /androidApp:\s*"https:\/\/play\.google\.com\//u);
assert.match(footer, /<FooterPromotion/u);
assert.match(footer, /EXTERNAL_ROUTES\.githubRepository/u);
assert.match(footer, /EXTERNAL_ROUTES\.iosApp/u);
assert.match(footer, /EXTERNAL_ROUTES\.androidApp/u);
assert.match(promotion, /aria-labelledby/u);
assert.match(promotion, /target="_blank"/u);
assert.match(types, /promotion:\s*\{/u);
assert.match(types, /githubAction: string/u);
assert.match(types, /iosAction: string/u);
assert.match(types, /androidAction: string/u);

for (const [index, locale] of locales.entries()) {
  assert.match(locale, /promotion:\s*\{/u, `${localeFiles[index]} needs promotion copy`);
  assert.match(locale, /githubAction:\s*"[^"]+"/u);
  assert.match(locale, /iosAction:\s*"[^"]+"/u);
  assert.match(locale, /androidAction:\s*"[^"]+"/u);
}

console.log(`Footer growth contract validated for ${localeFiles.length} locales.`);
