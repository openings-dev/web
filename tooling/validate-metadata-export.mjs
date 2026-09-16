import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const OUTPUT_DIRECTORY = path.join(process.cwd(), "out");
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function metadataContent(html, attribute, value) {
  const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const pattern = new RegExp(
    `<meta\\s+${attribute}=["']${escapedValue}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    "u",
  );
  return html.match(pattern)?.[1];
}

async function assertPng(relativePath) {
  const file = await readFile(path.join(OUTPUT_DIRECTORY, relativePath));
  assert.ok(file.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE), `${relativePath} must be a PNG file`);
}

async function assertRouteSpecificSocialImage() {
  const jobsDirectory = path.join(OUTPUT_DIRECTORY, "jobs");
  const entries = await readdir(jobsDirectory, { withFileTypes: true });
  const route = entries.find((entry) => entry.isDirectory());

  assert.ok(route, "The export must contain at least one generated job route");

  const html = await readFile(path.join(jobsDirectory, route.name, "index.html"), "utf8");
  const imageUrl = metadataContent(html, "property", "og:image");

  assert.ok(imageUrl, "The sampled job route must declare an Open Graph image");
  const imagePath = new URL(imageUrl).pathname.replace(/^\//u, "");
  assert.match(imagePath, /^jobs\/[^/]+\/opengraph-image\.png$/u);
  assert.equal(metadataContent(html, "property", "og:image:type"), "image/png");
  await assertPng(imagePath);
}

async function main() {
  const html = await readFile(path.join(OUTPUT_DIRECTORY, "index.html"), "utf8");

  assert.match(
    html,
    /<title>openings\.dev \| Find tech jobs shared by GitHub communities<\/title>/u,
  );
  assert.match(html, /<script type="application\/ld\+json">[^<]*"@type":"WebSite"/u);
  assert.match(html, /<script type="application\/ld\+json">[^<]*"@type":"Organization"/u);

  const [designHtml, compareHtml, localizedHtml, sitemapXml] = await Promise.all([
    readFile(path.join(OUTPUT_DIRECTORY, "design", "index.html"), "utf8"),
    readFile(path.join(OUTPUT_DIRECTORY, "compare", "index.html"), "utf8"),
    readFile(path.join(OUTPUT_DIRECTORY, "en", "discover", "remote", "index.html"), "utf8"),
    readFile(path.join(OUTPUT_DIRECTORY, "sitemap.xml"), "utf8"),
  ]);
  for (const utilityHtml of [designHtml, compareHtml]) {
    assert.match(utilityHtml, /<meta name="robots" content="noindex, follow"\/>/u);
  }
  assert.match(localizedHtml, /<meta property="og:locale" content="en_US"\/>/u);
  assert.match(localizedHtml, /<meta property="og:locale:alternate" content="pt_BR"\/>/u);
  assert.match(sitemapXml, /hreflang="x-default"/u);
  assert.match(sitemapXml, /hreflang="pt"/u);

  const [portugueseHome, portugueseSearch, portugueseBackend] = await Promise.all([
    readFile(path.join(OUTPUT_DIRECTORY, "pt", "index.html"), "utf8"),
    readFile(path.join(OUTPUT_DIRECTORY, "pt", "opportunities", "index.html"), "utf8"),
    readFile(path.join(OUTPUT_DIRECTORY, "pt", "discover", "backend", "index.html"), "utf8"),
  ]);
  assert.match(portugueseHome, /^<!DOCTYPE html><html lang="pt"/u);
  assert.match(portugueseHome, /<link rel="canonical" href="https:\/\/openings\.dev\/pt\/"\/>/u);
  assert.match(portugueseHome, /hrefLang="en" href="https:\/\/openings\.dev\/"/u);
  assert.match(portugueseHome, /hrefLang="x-default" href="https:\/\/openings\.dev\/"/u);
  assert.match(portugueseHome, /Encontre as vagas de tecnologia que as comunidades já estão publicando\./u);
  assert.match(portugueseSearch, /^<!DOCTYPE html><html lang="pt"/u);
  assert.match(portugueseSearch, /Vagas de tecnologia publicadas em comunidades públicas no GitHub\./u);
  assert.match(portugueseBackend, /^<!DOCTYPE html><html lang="pt"/u);
  assert.match(portugueseBackend, /Vagas para desenvolvedores backend/u);
  for (const slug of ["backend", "frontend", "mobile", "full-stack"]) {
    assert.match(sitemapXml, new RegExp(`/pt/discover/${slug}`, "u"));
  }

  assert.match(html, /<link rel="icon" href="\/brand-mark-light\.svg"/u);
  assert.match(html, /<link rel="icon" href="\/brand-mark-dark\.svg"/u);
  assert.match(html, /<link rel="apple-touch-icon" href="\/apple-touch-icon\.png"/u);

  const openGraphImage = metadataContent(html, "property", "og:image");
  const twitterImage = metadataContent(html, "name", "twitter:image");

  assert.equal(openGraphImage, "https://openings.dev/opengraph-image.png");
  assert.equal(twitterImage, "https://openings.dev/twitter-image.png");
  assert.equal(metadataContent(html, "property", "og:image:type"), "image/png");
  assert.equal(metadataContent(html, "property", "og:image:width"), "1200");
  assert.equal(metadataContent(html, "property", "og:image:height"), "630");
  assert.ok(metadataContent(html, "property", "og:image:alt"));
  assert.equal(metadataContent(html, "name", "twitter:image:type"), "image/png");

  await assertPng("opengraph-image.png");
  await assertPng("twitter-image.png");
  await assertRouteSpecificSocialImage();

  console.log("Static metadata export is valid.");
}

await main();
