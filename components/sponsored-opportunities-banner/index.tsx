"use client";

import { ExternalLink, Megaphone } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import { Button } from "@/components/ui/button";
import { EXTERNAL_ROUTES } from "@/lib/navigation/routes";

export function SponsoredOpportunitiesBanner(): React.ReactNode {
  const { messages } = useI18n();
  const copy = messages.sponsorship.banner;

  return (
    <aside className="border-b border-primary/20 bg-primary-soft/75">
      <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 xl:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
            aria-hidden="true"
          >
            <Megaphone className="size-4" />
          </span>
          <p className="min-w-0 text-sm leading-5 text-foreground">
            <strong className="font-semibold">{copy.message}</strong>{" "}
            <span className="text-muted-foreground">{copy.detail}</span>
          </p>
        </div>
        <Button
          asChild
          size="sm"
          className="w-full shrink-0 border-foreground bg-foreground text-background hover:border-foreground/90 hover:bg-foreground/90 sm:w-auto"
        >
          <a
            href={EXTERNAL_ROUTES.sponsoredJobRequest}
            target="_blank"
            rel="noreferrer"
          >
            {copy.action}
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </Button>
      </div>
    </aside>
  );
}
