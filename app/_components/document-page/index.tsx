"use client";

import * as React from "react";
import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import {
  extractMarkdownHeadings,
  removeLeadingMarkdownTitle,
} from "@/lib/content/markdown-headings";
import { DocumentMarkdown } from "./document-markdown";
import { DocumentNavigation } from "./document-navigation";
import { DocumentTableOfContents } from "./document-table-of-contents";
import type { DocumentPageProps } from "./types";

export function DocumentPage({
  documentKey,
  markdownByLocale,
  sourceFileByLocale,
}: DocumentPageProps): React.ReactNode {
  const { locale, messages } = useI18n();
  const copy = messages.documents[documentKey];
  const selectedMarkdown = markdownByLocale[locale];
  const sourceFile = sourceFileByLocale[locale];
  const sourceLabel = sourceFile
    ? messages.documents.sourceLabel.replace("{file}", sourceFile)
    : null;
  const markdown = React.useMemo(
    () => selectedMarkdown ? removeLeadingMarkdownTitle(selectedMarkdown) : "",
    [selectedMarkdown],
  );
  const headings = React.useMemo(() => extractMarkdownHeadings(markdown), [markdown]);
  const documentLabels = {
    overview: messages.documents.overview.title,
    apiReference: messages.documents.apiReference.title,
    maintainers: messages.documents.maintainers.title,
    contributing: messages.documents.contributing.title,
    privacy: messages.documents.privacy.title,
    terms: messages.documents.terms.title,
    methodology: messages.documents.methodology.title,
  };

  React.useEffect(() => {
    const currentHash = window.location.hash;
    if (!currentHash) return;

    const encodedId = currentHash.slice(1);
    let decodedId = encodedId;

    try {
      decodedId = decodeURIComponent(encodedId);
    } catch {
      // A malformed legacy hash can still match its literal DOM identifier.
    }

    const targetExists = [decodedId, encodedId].some(
      (id, index, candidates) =>
        id.length > 0 && candidates.indexOf(id) === index && document.getElementById(id),
    );

    if (targetExists) return;

    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${window.location.search}`,
    );
  }, [headings, locale]);

  return (
    <section className="mx-auto w-full max-w-[90rem] flex-1 px-4 pb-20 pt-8 sm:px-6 sm:pt-12 lg:px-8 xl:px-10">
      <header className="min-w-0 border-b border-line pb-8 sm:pb-10">
        <p className="text-label font-semibold text-primary-deep">{messages.documents.breadcrumb}</p>
        <h1 className="font-display mt-3 min-w-0 max-w-4xl text-page-title font-semibold tracking-[-0.045em] text-foreground [overflow-wrap:anywhere]">{copy.title}</h1>
        <p className="mt-4 min-w-0 max-w-3xl text-base leading-7 text-muted-foreground [overflow-wrap:anywhere] sm:text-lg sm:leading-8">{copy.description}</p>
      </header>

      <div className="mt-6 space-y-3 xl:hidden">
        <details className="rounded-control border border-control bg-surface lg:hidden">
          <summary className="min-h-11 px-4 py-3 text-sm font-semibold text-foreground marker:text-primary-deep">{messages.documents.navigationSummary}</summary>
          <div className="border-t border-line p-3">
            <DocumentNavigation currentDocument={documentKey} ariaLabel={messages.documents.navigationLabel} labels={documentLabels} />
          </div>
        </details>
        {headings.length > 0 ? (
          <details className="rounded-control border border-control bg-surface 2xl:hidden">
            <summary className="min-h-11 px-4 py-3 text-sm font-semibold text-foreground marker:text-primary-deep">{messages.documents.tableOfContentsSummary}</summary>
            <div className="border-t border-line p-4">
              <DocumentTableOfContents headings={headings} ariaLabel={messages.documents.tableOfContentsLabel} />
            </div>
          </details>
        ) : null}
      </div>

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[13rem_minmax(0,74ch)] lg:justify-center xl:grid-cols-[13rem_minmax(0,74ch)_13rem] xl:gap-10 2xl:gap-14">
        <aside className="sticky top-24 hidden lg:block">
          <p className="mb-3 text-label font-semibold text-foreground">{messages.documents.navigationLabel}</p>
          <DocumentNavigation currentDocument={documentKey} ariaLabel={messages.documents.navigationLabel} labels={documentLabels} />
        </aside>

        <div id="document-content" tabIndex={-1} className="min-w-0 scroll-mt-24 outline-none">
          {selectedMarkdown ? (
            <DocumentMarkdown markdown={markdown} />
          ) : (
            <div className="border-y border-line bg-surface-muted/60 px-5 py-10 sm:px-7 sm:py-12">
              <h2 className="font-display text-section-title font-semibold text-foreground">
                {messages.documents.unavailableTitle}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                {messages.documents.unavailableDescription}
              </p>
            </div>
          )}
          {sourceLabel ? (
            <p className="mt-10 border-t border-line pt-4 font-mono text-xs text-subtle-foreground">{sourceLabel}</p>
          ) : null}
        </div>

        <aside className="sticky top-24 hidden xl:block">
          {headings.length > 0 ? (
            <>
              <p className="mb-3 text-label font-semibold text-foreground">{messages.documents.tableOfContentsLabel}</p>
              <DocumentTableOfContents headings={headings} ariaLabel={messages.documents.tableOfContentsLabel} />
            </>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
