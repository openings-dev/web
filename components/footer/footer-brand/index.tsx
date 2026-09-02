import Link from "next/link";
import { AppDownloadLinks } from "@/components/app-download-links";
import { Wordmark } from "@/components/brand/wordmark";
import { WordmarkSize } from "@/components/brand/wordmark/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/tailwind";
import type { FooterBrandProps } from "../types";
import { footerSocialButtonStyles } from "../styles";

export function FooterBrand({
  className,
  href,
  brandName,
  brandTagline,
  description,
  appDownloads,
  socialLinks,
  socialLinksAriaLabel,
}: FooterBrandProps): React.ReactNode {
  return (
    <div className={cn("space-y-6", className)}>
      <Link
        href={href}
        className="inline-flex rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={brandName}
      >
        <Wordmark
          size={WordmarkSize.Display}
          className="h-12 w-auto text-night-foreground sm:h-14 lg:h-16"
        />
      </Link>

      <div className="max-w-md space-y-2">
        <p className="text-base font-semibold text-night-foreground">
          {brandTagline}
        </p>
        <p className="text-sm leading-6 text-night-muted-foreground sm:text-base sm:leading-7">
          {description}
        </p>
      </div>

      <AppDownloadLinks messages={appDownloads} tone="inverse" />

      <ul className="flex items-center gap-2" aria-label={socialLinksAriaLabel}>
        {socialLinks.map((socialLink) => {
          const Icon = socialLink.icon;
          const isExternal = socialLink.external ?? true;

          return (
            <li key={`${socialLink.label}-${socialLink.href}`}>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className={footerSocialButtonStyles()}
              >
                <Link
                  href={socialLink.href}
                  aria-label={socialLink.ariaLabel ?? socialLink.label}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noreferrer" : undefined}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span className="sr-only">{socialLink.label}</span>
                </Link>
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
