import Link from "next/link";
import { PUBLIC_ROUTES } from "@/lib/navigation/routes";
import { cn } from "@/lib/utils/tailwind";
import type { DocumentPageKey } from "../types";
import type { DocumentNavigationProps } from "./types";

const DOCUMENT_DESTINATIONS: ReadonlyArray<{
  key: DocumentPageKey;
  href: string;
}> = [
  { key: "overview", href: PUBLIC_ROUTES.overview },
  { key: "apiReference", href: PUBLIC_ROUTES.apiReference },
  { key: "maintainers", href: PUBLIC_ROUTES.communityGuide },
  { key: "contributing", href: PUBLIC_ROUTES.contributing },
  { key: "methodology", href: PUBLIC_ROUTES.methodology },
  { key: "privacy", href: PUBLIC_ROUTES.privacy },
  { key: "terms", href: PUBLIC_ROUTES.terms },
];

export function DocumentNavigation({
  currentDocument,
  ariaLabel,
  labels,
}: DocumentNavigationProps): React.ReactNode {
  return (
    <nav aria-label={ariaLabel}>
      <ul className="space-y-1">
        {DOCUMENT_DESTINATIONS.map(({ key, href }) => {
          const active = key === currentDocument;
          return (
            <li key={key}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-11 min-w-0 items-center rounded-control px-3 text-sm transition-colors [overflow-wrap:anywhere] before:absolute before:bottom-2.5 before:left-0 before:top-2.5 before:w-0.5 before:rounded-pill before:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-primary-soft font-semibold text-primary-deep before:opacity-100"
                    : "text-muted-foreground before:opacity-0 hover:bg-surface-muted hover:text-foreground",
                )}
              >
                {labels[key]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
