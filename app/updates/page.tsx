import type { Metadata } from "next";
import { UpdatesScreen } from "./_components/updates-screen";
import { createPageMetadata } from "@/lib/metadata/site-metadata";
import { PUBLIC_ROUTES } from "@/lib/navigation/routes";
import { UPDATE_ENTRIES } from "@/lib/updates/content";

export const metadata: Metadata = createPageMetadata({
  title: "Product updates and roadmap",
  description: "See verified openings.dev changes, grouped releases, and roadmap direction without artificial delivery dates.",
  path: PUBLIC_ROUTES.updates,
});

export default function UpdatesPage(): React.ReactNode {
  return <UpdatesScreen entries={UPDATE_ENTRIES} />;
}
