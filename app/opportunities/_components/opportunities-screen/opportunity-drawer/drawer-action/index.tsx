import * as React from "react";
import { Bookmark, CircleAlert, Ellipsis, ExternalLink, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/tailwind";

interface DrawerActionProps {
  openOriginalLabel: string;
  actionsLabel: string;
  closeActionsLabel: string;
  url: string;
  shareLabel?: string;
  shareSharedLabel?: string;
  shareCopiedLabel?: string;
  shareFailedLabel?: string;
  shareUrl?: string;
  className?: string;
  inert?: boolean;
  reportLabel?: string;
  reportUrl?: string;
  saveLabel?: string;
  isSaved?: boolean;
  onToggleSaved?: () => void;
  onOpenOriginal?: () => void;
}

export function DrawerAction({
  openOriginalLabel,
  actionsLabel,
  closeActionsLabel,
  url,
  shareLabel,
  shareSharedLabel,
  shareCopiedLabel,
  shareFailedLabel,
  shareUrl,
  className,
  inert = false,
  reportLabel,
  reportUrl,
  saveLabel,
  isSaved = false,
  onToggleSaved,
  onOpenOriginal,
}: DrawerActionProps): React.ReactNode {
  const [inlineAnnouncement, setInlineAnnouncement] = React.useState("");
  const [actionsOpen, setActionsOpen] = React.useState(false);
  const actionsButtonRef = React.useRef<HTMLButtonElement>(null);
  const sheetRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const actionsTitleId = React.useId();
  const isAbortError = (error: unknown) =>
    error instanceof DOMException && error.name === "AbortError";

  React.useEffect(() => {
    if (!actionsOpen) return;

    const previousDocumentOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const actionsButton = actionsButtonRef.current;
    const frameId = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      window.cancelAnimationFrame(frameId);
      document.documentElement.style.overflow = previousDocumentOverflow;
      document.body.style.overflow = previousBodyOverflow;
      actionsButton?.focus();
    };
  }, [actionsOpen]);

  const announce = (message: string, tone: "error" | "success") => {
    const modalDialog = actionsButtonRef.current?.closest("dialog");
    if (modalDialog?.open) {
      setInlineAnnouncement(message);
      return;
    }

    toast[tone](message);
  };

  const handleShare = async () => {
    if (!shareUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({ url: shareUrl });
        if (shareSharedLabel) announce(shareSharedLabel, "success");
        return;
      } catch (error) {
        if (isAbortError(error)) return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      if (shareCopiedLabel) announce(shareCopiedLabel, "success");
    } catch {
      if (shareFailedLabel) announce(shareFailedLabel, "error");
    }
  };

  const handleSecondaryAction = (action: () => void | Promise<void>) => {
    setActionsOpen(false);
    queueMicrotask(() => void action());
  };

  const handleSheetKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setActionsOpen(false);
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = sheetRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href]',
    );
    if (!focusable?.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className={cn("grid grid-cols-[minmax(0,1fr)_auto] gap-2", className)}>
      <div className="min-w-0">
        {inert ? (
          <Button type="button" className="w-full" disabled>
            <ExternalLink className="size-4" aria-hidden="true" />
            {openOriginalLabel}
          </Button>
        ) : (
          <Button asChild className="w-full">
            <a href={url} target="_blank" rel="noreferrer" onClick={onOpenOriginal}>
              <ExternalLink className="size-4" aria-hidden="true" />
              <span className="truncate">{openOriginalLabel}</span>
            </a>
          </Button>
        )}
      </div>
      <Button
        ref={actionsButtonRef}
        type="button"
        variant="outline"
        disabled={inert}
        aria-haspopup="dialog"
        aria-expanded={actionsOpen}
        onClick={() => setActionsOpen(true)}
      >
        <Ellipsis className="size-4" aria-hidden="true" />
        {actionsLabel}
      </Button>

      {actionsOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-overlay"
            aria-label={closeActionsLabel}
            onClick={() => setActionsOpen(false)}
          />
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={actionsTitleId}
            className="relative z-10 w-full rounded-t-card border border-b-0 border-line bg-surface-elevated px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-floating sm:max-w-md sm:rounded-card sm:border sm:mb-6"
            onKeyDown={handleSheetKeyDown}
          >
            <div className="mb-3 flex min-h-11 items-center gap-3">
              <h2 id={actionsTitleId} className="text-base font-semibold text-foreground">
                {actionsLabel}
              </h2>
              <Button
                ref={closeButtonRef}
                type="button"
                variant="ghost"
                size="icon"
                className="ml-auto"
                aria-label={closeActionsLabel}
                onClick={() => setActionsOpen(false)}
              >
                <X className="size-5" aria-hidden="true" />
              </Button>
            </div>
            <div className="grid gap-2">
              {shareUrl && shareLabel ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleSecondaryAction(handleShare)}
                >
                  <Share2 className="size-4" aria-hidden="true" />
                  {shareLabel}
                </Button>
              ) : null}
              {saveLabel && onToggleSaved ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start"
                  aria-pressed={isSaved}
                  onClick={() => handleSecondaryAction(onToggleSaved)}
                >
                  <Bookmark className="size-4" fill={isSaved ? "currentColor" : "none"} aria-hidden="true" />
                  {saveLabel}
                </Button>
              ) : null}
              {reportLabel && reportUrl ? (
                <Button asChild variant="ghost" className="w-full justify-start">
                  <a href={reportUrl} onClick={() => setActionsOpen(false)}>
                    <CircleAlert className="size-4" aria-hidden="true" />
                    {reportLabel}
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {inlineAnnouncement}
      </p>
    </div>
  );
}
