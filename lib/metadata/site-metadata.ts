import type { Metadata } from "next";

export const SITE_NAME = "openings.dev";
export const SITE_ORIGIN = new URL("https://openings.dev");
export const SITE_DEFAULT_DESCRIPTION =
  "Find tech jobs shared by public GitHub communities, then open the original listing to verify current details.";
export const DEFAULT_SOCIAL_IMAGE = {
  url: "/opengraph-image.png",
  type: "image/png",
  width: 1200,
  height: 630,
  alt: "openings.dev: Technology jobs shared by public GitHub communities",
} as const;
export const DEFAULT_TWITTER_IMAGE = {
  ...DEFAULT_SOCIAL_IMAGE,
  url: "/twitter-image.png",
} as const;

type OpenGraphType = "website" | "article";

interface CreatePageMetadataParams {
  title: string;
  description: string;
  path: string;
  openGraphType?: OpenGraphType;
  socialImageAlt?: string;
}

function createRouteSocialImage(path: string, alt: string) {
  const pathname = path.split(/[?#]/u, 1)[0] ?? "/";
  const normalizedPath = pathname === "/" ? "" : pathname.replace(/\/+$/u, "");

  return {
    url: resolvePublicSiteUrl(`${normalizedPath}/opengraph-image.png`),
    type: "image/png",
    width: 1200,
    height: 630,
    alt,
  } as const;
}

export function resolveCanonicalUrl(path: string): string {
  const pathname = path.split(/[?#]/u, 1)[0] ?? "/";
  const normalizedPath = `/${pathname.replace(/^\/+|\/{2,}/gu, "/").replace(/^\//u, "")}`;
  const finalSegment = normalizedPath.split("/").at(-1) ?? "";
  const isFilePath = finalSegment.includes(".");
  const canonicalPath = normalizedPath === "/" || normalizedPath.endsWith("/") || isFilePath
    ? normalizedPath
    : `${normalizedPath}/`;
  const canonical = new URL(canonicalPath, SITE_ORIGIN);
  return canonical.toString();
}

export function resolvePublicSiteUrl(path: string): string {
  const candidate = new URL(path, SITE_ORIGIN);
  return new URL(`${candidate.pathname}${candidate.search}`, SITE_ORIGIN).toString();
}

export function createPageMetadata({
  title,
  description,
  path,
  openGraphType = "website",
  socialImageAlt,
}: CreatePageMetadataParams): Metadata {
  const canonical = resolveCanonicalUrl(path);
  const socialImage = socialImageAlt
    ? createRouteSocialImage(path, socialImageAlt)
    : DEFAULT_SOCIAL_IMAGE;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: openGraphType,
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "en_US",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImageAlt ? socialImage : DEFAULT_TWITTER_IMAGE],
    },
  };
}
