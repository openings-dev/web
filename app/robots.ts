import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/metadata/site-metadata";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", SITE_ORIGIN).toString(),
    host: SITE_ORIGIN.toString(),
  };
}
