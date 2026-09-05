import * as React from "react";
import { Copy, Mail } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/tailwind";
import type { FooterBottomProps } from "../types";

export function FooterBottom({
  className,
  supportEmail,
  supportEmailButtonLabel,
  supportEmailCopiedMessage,
  supportEmailCopyErrorMessage,
  supportText,
  copyrightText,
  signature,
}: FooterBottomProps): React.ReactNode {
  const handleCopySupportEmail = React.useCallback(async () => {
    if (!supportEmail) {
      return;
    }

    try {
      await navigator.clipboard.writeText(supportEmail);
      toast.success(supportEmailCopiedMessage);
    } catch {
      toast.error(supportEmailCopyErrorMessage);
    }
  }, [supportEmail, supportEmailCopiedMessage, supportEmailCopyErrorMessage]);

  return (
    <div
      className={cn(
        "flex flex-col gap-5 border-t border-night-foreground/15 pt-7 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1">
        <p className="text-sm text-night-muted-foreground">{copyrightText}</p>
        <p className="text-sm text-night-muted-foreground">{supportText}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        {supportEmail ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopySupportEmail}
            className="border-night-foreground/20 bg-transparent px-3 text-xs text-night-foreground hover:border-night-foreground/35 hover:bg-night-foreground/10"
            aria-label={`${supportEmailButtonLabel}: ${supportEmail}`}
          >
            <Mail className="size-3.5" aria-hidden="true" />
            <span>{supportEmail}</span>
            <Copy className="size-3.5 opacity-70" aria-hidden="true" />
          </Button>
        ) : null}

        <a
          href="https://treb.la"
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 cursor-pointer items-center gap-2 rounded-control px-2 text-night-muted-foreground transition-colors hover:text-night-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="text-sm font-medium tracking-[-0.01em]">
            {signature}
          </span>

          <Image
            src="/trebla-solid-white-logo-inline.svg"
            alt="Trebla"
            width={985}
            height={198}
            className="h-auto w-[72px] shrink-0"
          />
        </a>
      </div>
    </div>
  );
}
