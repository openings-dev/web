import type { Metadata } from "next";
import { StatusScreen } from "./_components/status-screen";
import { createPageMetadata } from "@/lib/metadata/site-metadata";
import { getCommunityStatusBundle } from "@/lib/opportunities/status";

export const metadata: Metadata = createPageMetadata({
  title: "Community sync status",
  description: "Current synchronization status for the public GitHub communities indexed by openings.dev.",
  path: "/status",
});

export default async function StatusPage(): Promise<React.ReactNode> {
  const bundle = await getCommunityStatusBundle().catch(() => null);
  return <StatusScreen status={bundle?.status ?? null} history={bundle?.history ?? null} />;
}
