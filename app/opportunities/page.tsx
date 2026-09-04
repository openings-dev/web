import type { Metadata } from "next";
import { OpportunitiesPage } from "@/app/opportunities/_components/opportunities-page";
import { createPageMetadata } from "@/lib/metadata/site-metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Search tech jobs shared by GitHub communities",
  description:
    "Search tech jobs by role, stack, seniority, location, or work model, then verify each opening at its original public source.",
  path: "/opportunities",
});

export default function Opportunities(): React.ReactNode {
  return <OpportunitiesPage />;
}
