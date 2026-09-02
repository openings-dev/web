"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Menu, Star, X } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { AppDownloadLinks } from "@/components/app-download-links";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/tailwind";
import type { MobileNavigationItem, MobileNavigationProps } from "./types";

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

const MOBILE_NAVIGATION_DIALOG_ID = "mobile-navigation-dialog";

interface MobileNavigationLinkProps {
  item: MobileNavigationItem;
  pathname: string;
  onNavigate: () => void;
}

function MobileNavigationLink({
  item,
  pathname,
  onNavigate,
}: MobileNavigationLinkProps): React.ReactNode {
  const internal = item.href.startsWith("/");
  const active = internal && isActivePath(pathname, item.href);
  const className = cn(
    "relative flex min-h-11 min-w-0 items-center gap-2 rounded-control px-3 text-sm font-medium transition-colors before:absolute before:bottom-2.5 before:left-0 before:top-2.5 before:w-0.5 before:rounded-full before:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    active
      ? "bg-primary-soft font-semibold text-primary-deep before:opacity-100"
      : "text-muted-foreground before:opacity-0 hover:bg-surface-muted hover:text-foreground",
  );
  const content = (
    <>
      <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{item.label}</span>
      {item.external ? (
        <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
      ) : null}
    </>
  );

  if (internal) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={className}
        aria-current={active ? "page" : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <a
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noreferrer" : undefined}
      onClick={onNavigate}
      className={className}
    >
      {content}
    </a>
  );
}

export function MobileNavigation({
  groups,
  appDownloads,
  githubStar,
  ariaLabel,
  openMenuAriaLabel,
  closeMenuAriaLabel,
  children,
}: MobileNavigationProps): React.ReactNode {
  const pathname = usePathname();
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [dialogElement, setDialogElement] =
    React.useState<HTMLDialogElement | null>(null);
  const [open, setOpen] = React.useState(false);

  const handleDialogRef = React.useCallback(
    (node: HTMLDialogElement | null) => {
      dialogRef.current = node;
      setDialogElement(node);
    },
    [],
  );

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!open) {
      if (dialog.open) dialog.close();
      return;
    }

    const documentElementOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    const desktopQuery = window.matchMedia("(min-width: 1280px)");
    const handleDesktopBreakpoint = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    desktopQuery.addEventListener("change", handleDesktopBreakpoint);
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();

    const frameId = window.requestAnimationFrame(() => {
      dialog.querySelector<HTMLElement>("[data-mobile-navigation-close]")?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      desktopQuery.removeEventListener("change", handleDesktopBreakpoint);
      if (dialog.open) dialog.close();
      document.documentElement.style.overflow = documentElementOverflow;
      document.body.style.overflow = bodyOverflow;
      trigger?.focus();
    };
  }, [open]);

  const close = React.useCallback(() => setOpen(false), []);

  return (
    <div className="xl:hidden">
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="icon"
        aria-label={openMenuAriaLabel}
        aria-expanded={open}
        aria-controls={MOBILE_NAVIGATION_DIALOG_ID}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <Menu className="size-5" aria-hidden="true" />
      </Button>
      <dialog
        id={MOBILE_NAVIGATION_DIALOG_ID}
        ref={handleDialogRef}
        aria-label={ariaLabel}
        className="m-0 ml-auto h-dvh max-h-none w-[min(23rem,100%)] max-w-none border-0 border-l border-line bg-surface-elevated p-0 text-foreground shadow-floating-lg backdrop:bg-overlay"
        onCancel={(event) => { event.preventDefault(); close(); }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            close();
          }
        }}
        onClose={() => setOpen(false)}
      >
        <div className="flex h-full flex-col pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
          <header className="flex min-h-18 items-center justify-between border-b border-line px-4">
            <Wordmark />
            <Button data-mobile-navigation-close type="button" variant="ghost" size="icon" aria-label={closeMenuAriaLabel} onClick={close}>
              <X className="size-5" aria-hidden="true" />
            </Button>
          </header>
          <nav className="flex-1 space-y-6 overflow-y-auto p-4" aria-label={ariaLabel}>
            {groups.map((group) => {
              const headingId = `mobile-navigation-${group.id}`;
              return (
                <section key={group.id} aria-labelledby={headingId}>
                  <h2
                    id={headingId}
                    className="px-3 pb-2 text-label font-semibold text-foreground"
                  >
                    {group.label}
                  </h2>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => (
                      <li key={`${group.id}-${item.href}`}>
                        <MobileNavigationLink
                          item={item}
                          pathname={pathname}
                          onNavigate={close}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
            <AppDownloadLinks messages={appDownloads} layout="stacked" />
          </nav>
          <footer className="space-y-3 border-t border-line bg-surface p-4">
            <section className="rounded-card border border-primary/40 bg-primary-soft p-4">
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Star className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 space-y-1">
                  <h2 className="text-sm font-semibold text-foreground">
                    {githubStar.title}
                  </h2>
                  <p className="text-xs leading-5 text-muted-foreground">
                    {githubStar.description}
                  </p>
                </div>
              </div>
              <Button asChild size="sm" className="mt-4 w-full">
                <a
                  href={githubStar.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={githubStar.ariaLabel}
                >
                  <Star className="size-4" aria-hidden="true" />
                  {githubStar.action}
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
              </Button>
            </section>
            <div className="flex min-w-0 items-center gap-2">
              {typeof children === "function"
                ? children(dialogElement)
                : children}
            </div>
          </footer>
        </div>
      </dialog>
    </div>
  );
}
