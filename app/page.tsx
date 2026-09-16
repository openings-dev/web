import type { Metadata } from "next";
import { DeferredHomeOpportunities } from "@/app/_components/deferred-home-opportunities";
import { HomeHero } from "@/app/_components/home-hero";
import { createPageMetadata } from "@/lib/metadata/site-metadata";
import { LocaleCode } from "@/lib/constants/locales";
import { localizedPublicAlternates } from "@/lib/metadata/localized-alternates";
import {
  buildSiteIdentityJsonLd,
  serializeSiteIdentityJsonLd,
} from "@/lib/metadata/site-identity";

const homeMetadata = createPageMetadata({
  title: "openings.dev | Find tech jobs shared by GitHub communities",
  description:
    "Search tech jobs shared by public GitHub communities, then open the original listing to verify current details and next steps.",
  path: "/",
});

export const metadata: Metadata = {
  ...homeMetadata,
  alternates: localizedPublicAlternates(LocaleCode.English, "/"),
};

export default function Home(): React.ReactNode {
  const siteIdentity = buildSiteIdentityJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeSiteIdentityJsonLd(siteIdentity) }}
      />
      <HomeHero />
      <DeferredHomeOpportunities />
    </>
  );
}
