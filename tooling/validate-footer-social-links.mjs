import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const localeFiles = ["en", "pt", "es", "it", "fr", "de"].map(
  (locale) => `lib/translations/${locale}.ts`,
);

const [
  routesSource,
  footerSource,
  iconSource,
  typesSource,
  packageSource,
  footerBrandSource,
  mobileNavigationSource,
  appDownloadLinksSource,
  ...localeSources
] = await Promise.all([
  readFile("lib/navigation/routes.ts", "utf8"),
  readFile("components/footer/index.tsx", "utf8"),
  readFile("components/icons/linkedin/index.tsx", "utf8").catch(() => ""),
  readFile("lib/translations/types.ts", "utf8"),
  readFile("package.json", "utf8"),
  readFile("components/footer/footer-brand/index.tsx", "utf8"),
  readFile("components/header/mobile-navigation/index.tsx", "utf8"),
  readFile("components/app-download-links/index.tsx", "utf8").catch(() => ""),
  ...localeFiles.map((file) => readFile(file, "utf8")),
]);

assert.match(
  routesSource,
  /linkedin:\s*"https:\/\/www\.linkedin\.com\/company\/openings-dev\/"/u,
);
assert.match(
  footerSource,
  /import \{ LinkedinIcon \} from "@\/components\/icons\/linkedin";/u,
);
assert.match(footerSource, /label: footerMessages\.links\.linkedin/u);
assert.match(footerSource, /href: EXTERNAL_ROUTES\.linkedin/u);
assert.match(footerSource, /icon: LinkedinIcon/u);
assert.match(
  footerSource,
  /ariaLabel: footerMessages\.social\.linkedinAriaLabel/u,
);
assert.ok(
  footerSource.indexOf("icon: GithubIcon") <
    footerSource.indexOf("icon: LinkedinIcon") &&
    footerSource.indexOf("icon: LinkedinIcon") <
      footerSource.indexOf("icon: BlueskyIcon"),
  "LinkedIn must render immediately after GitHub",
);
assert.match(iconSource, /export function LinkedinIcon/u);
assert.match(iconSource, /aria-hidden="true"/u);
assert.match(iconSource, /focusable="false"/u);
assert.match(typesSource, /linkedin: string;/u);
assert.match(typesSource, /linkedinAriaLabel: string;/u);
assert.match(
  routesSource,
  /iosApp:\s*"https:\/\/apps\.apple\.com\/app\/openings-dev\/id0000000000"/u,
  "The placeholder App Store URL must be centralized",
);
assert.match(
  routesSource,
  /androidApp:\s*"https:\/\/play\.google\.com\/store\/apps\/details\?id=dev\.openings\.mobile"/u,
  "The future Android package URL must be centralized",
);
assert.match(
  footerBrandSource,
  /<AppDownloadLinks/u,
  "The site footer must surface both app downloads",
);
assert.match(
  mobileNavigationSource,
  /<AppDownloadLinks/u,
  "The mobile navigation must surface both app downloads",
);
assert.match(appDownloadLinksSource, /Apple/u);
assert.match(appDownloadLinksSource, /Smartphone/u);
assert.match(appDownloadLinksSource, /EXTERNAL_ROUTES\.iosApp/u);
assert.match(appDownloadLinksSource, /EXTERNAL_ROUTES\.androidApp/u);
assert.match(typesSource, /appDownloads:\s*\{/u);
assert.match(typesSource, /iosAriaLabel: string;/u);
assert.match(typesSource, /androidAriaLabel: string;/u);

for (const [index, localeSource] of localeSources.entries()) {
  assert.match(
    localeSource,
    /linkedin: "LinkedIn"/u,
    `${localeFiles[index]} needs a label`,
  );
  assert.match(
    localeSource,
    /linkedinAriaLabel: "[^"]*LinkedIn[^"]*"/u,
    `${localeFiles[index]} needs an accessible name`,
  );
  assert.match(
    localeSource,
    /appDownloads:\s*\{[\s\S]*?title:\s*"[^"]+"[\s\S]*?iosAction:\s*"[^"]+"[\s\S]*?androidAction:\s*"[^"]+"[\s\S]*?iosAriaLabel:\s*"[^"]+"[\s\S]*?androidAriaLabel:\s*"[^"]+"[\s\S]*?\}/u,
    `${localeFiles[index]} needs complete app-download copy`,
  );
}

const packageJson = JSON.parse(packageSource);
assert.equal(
  packageJson.scripts["test:footer"],
  "node tooling/validate-footer-social-links.mjs",
);

console.log(
  `Footer social-link contract validated for ${localeFiles.length} locales.`,
);
