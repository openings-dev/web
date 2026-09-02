import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(path, "utf8");
const locales = ["en", "pt", "es", "it", "fr", "de"];

const [parser, dataSource, indexPage, detailPage, sitemap, routes, footer, types] =
  await Promise.all([
    read("lib/reports/report-parser.ts"),
    read("lib/reports/reports.ts"),
    read("app/reports/page.tsx"),
    read("app/reports/[month]/page.tsx"),
    read("app/sitemap.ts"),
    read("lib/navigation/routes.ts"),
    read("components/footer/index.tsx"),
    read("lib/translations/types.ts"),
  ]);

assert.match(parser, /unknown/u);
assert.match(parser, /parseMonthlyReportIndex/u);
assert.match(parser, /parseMonthlyReport/u);
assert.match(parser, /methodologyVersion/u);
assert.match(dataSource, /fetchJson/u);
assert.match(dataSource, /openingsDataRepositoryUrl/u);
assert.match(dataSource, /allowedUrlPrefix/u);
assert.match(indexPage, /loadWithStatus/u);
assert.match(indexPage, /ReportsScreen/u);
assert.match(detailPage, /dynamicParams = false/u);
assert.match(detailPage, /generateStaticParams/u);
assert.match(detailPage, /generateMetadata/u);
assert.match(detailPage, /ReportsScreen/u);
assert.match(sitemap, /listMonthlyReports/u);
assert.match(routes, /reports:\s*"\/reports"/u);
assert.match(footer, /footerMessages\.links\.reports/u);
assert.match(types, /reportsPage:/u);

for (const locale of locales) {
  const dictionary = await read(`lib/translations/${locale}.ts`);
  assert.match(dictionary, /reportsPage:/u, `${locale} needs report copy`);
}

console.log("Public reports contract is valid.");
