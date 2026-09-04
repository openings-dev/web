import type { Metadata } from "next";
import { DeferredHomeOpportunities } from "@/app/_components/deferred-home-opportunities";
import { HomeHero } from "@/app/_components/home-hero";
import { createPageMetadata } from "@/lib/metadata/site-metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Find tech jobs shared by GitHub communities",
  description:
    "Search tech jobs shared by public GitHub communities, then open the original listing to verify current details and next steps.",
  path: "/",
});

export default function Home(): React.ReactNode {
  return (
    <>
      <HomeHero />
      <DeferredHomeOpportunities />
    </>
  );
}
