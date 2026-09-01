import type { Metadata } from "next";
import { DocumentPage } from "@/app/_components/document-page";
import { AnalyticsPreferences } from "./_components/analytics-preferences";
import { ProjectDocumentKey } from "@/lib/content/document-types";
import { readProjectDocumentBundle } from "@/lib/content/read-project-document";
import { createPageMetadata } from "@/lib/metadata/site-metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy policy",
  description:
    "Read how openings.dev displays public listing and GitHub author data, stores theme and language preferences, and handles external links.",
  path: "/privacy",
  openGraphType: "article",
});

export default async function PrivacyPage() {
  const document = await readProjectDocumentBundle(ProjectDocumentKey.Privacy);
  return (
    <>
      <DocumentPage
        documentKey="privacy"
        markdownByLocale={document.markdownByLocale}
        sourceFileByLocale={document.sourceFileByLocale}
      />
      <AnalyticsPreferences />
    </>
  );
}
