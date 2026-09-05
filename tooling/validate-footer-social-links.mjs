import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const localeFiles = ["en", "pt", "es", "it", "fr", "de"].map(
  (locale) => `lib/translations/${locale}.ts`,
);

const [
  routesSource,
  footerSource,
  footerBottomSource,
  iconSource,
  typesSource,
  packageSource,
  ...localeSources
] = await Promise.all([
  readFile("lib/navigation/routes.ts", "utf8"),
  readFile("components/footer/index.tsx", "utf8"),
  readFile("components/footer/footer-bottom/index.tsx", "utf8"),
  readFile("components/icons/linkedin/index.tsx", "utf8").catch(() => ""),
  readFile("lib/translations/types.ts", "utf8"),
  readFile("package.json", "utf8"),
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
  footerBottomSource,
  /aria-label=\{`\$\{supportEmailButtonLabel\}: \$\{supportEmail\}`\}/u,
);

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
}

const packageJson = JSON.parse(packageSource);
assert.equal(
  packageJson.scripts["test:footer"],
  "node tooling/validate-footer-social-links.mjs",
);

console.log(
  `Footer social-link contract validated for ${localeFiles.length} locales.`,
);
