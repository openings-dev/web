import type { Metadata } from "next";
import { createProjectDocumentPage } from "@/app/_components/document-page/create-project-document-page";
import { ProjectDocumentKey } from "@/lib/content/document-types";
import { createPageMetadata } from "@/lib/metadata/site-metadata";
import { PUBLIC_ROUTES } from "@/lib/navigation/routes";

export const metadata: Metadata = createPageMetadata({
  title: "Data methodology",
  description: "Understand how openings.dev selects sources, synchronizes jobs, separates geography, classifies fields, groups duplicates, and protects privacy.",
  path: PUBLIC_ROUTES.methodology,
  openGraphType: "article",
});

export default createProjectDocumentPage(
  ProjectDocumentKey.Methodology,
  "methodology",
);
