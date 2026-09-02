"use client";

import * as React from "react";
import { ExternalLink, Star } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import { Button } from "@/components/ui/button";
import { AVAILABLE_LOCALES } from "@/lib/constants/locales";
import { EXTERNAL_ROUTES, PUBLIC_ROUTES } from "@/lib/navigation/routes";
import { cn } from "@/lib/utils/tailwind";
import { BrandLogo } from "./brand-logo";
import { HeaderNav } from "./header-nav";
import { LanguageSwitcher } from "./language-switcher";
import {
  headerStyles,
} from "./styles";
import { ThemeToggle } from "./theme-toggle";
import { MobileNavigation } from "./mobile-navigation";
import type { MobileNavigationGroup } from "./mobile-navigation/types";
import type { HeaderProps, LocaleCode } from "./types";

export function Header({
  className,
  logoHref = "/",
  locale,
  locales,
  position = "sticky",
  onLocaleChange,
}: HeaderProps): React.ReactNode {
  const { locale: currentLocale, messages, setLocale } = useI18n();
  const activeLocale = locale ?? currentLocale;
  const availableLocales = locales?.length ? locales : AVAILABLE_LOCALES;
  const primaryNavItems = [
    { label: messages.header.nav.discover, href: PUBLIC_ROUTES.home },
    { label: messages.header.nav.communities, href: PUBLIC_ROUTES.communities },
    { label: messages.header.nav.authors, href: PUBLIC_ROUTES.authors },
    { label: messages.header.nav.docs, href: PUBLIC_ROUTES.docs },
    { label: messages.header.nav.status, href: PUBLIC_ROUTES.status },
  ];
  const mobileNavigation = messages.header.mobileNavigation;
  const mobileGroups: MobileNavigationGroup[] = [
    {
      id: "primary",
      label: mobileNavigation.groups.primary,
      items: primaryNavItems,
    },
    {
      id: "resources",
      label: mobileNavigation.groups.resources,
      items: [
        { label: messages.footer.links.overview, href: PUBLIC_ROUTES.overview },
        {
          label: messages.footer.links.apiReference,
          href: PUBLIC_ROUTES.apiReference,
        },
        {
          label: messages.footer.links.maintainers,
          href: PUBLIC_ROUTES.communityGuide,
        },
        {
          label: messages.footer.links.contributing,
          href: PUBLIC_ROUTES.contributing,
        },
        {
          label: messages.footer.links.designSystem,
          href: PUBLIC_ROUTES.design,
        },
      ],
    },
    {
      id: "help",
      label: mobileNavigation.groups.help,
      items: [
        {
          label: messages.footer.links.reportIssue,
          href: EXTERNAL_ROUTES.reportIssue,
          external: true,
        },
        {
          label: messages.footer.links.privacyPolicy,
          href: PUBLIC_ROUTES.privacy,
        },
        {
          label: messages.footer.links.termsOfService,
          href: PUBLIC_ROUTES.terms,
        },
      ],
    },
  ];

  const handleLocaleChange = React.useCallback(
    (nextLocale: LocaleCode) => {
      if (onLocaleChange) {
        onLocaleChange(nextLocale);
        return;
      }

      if (locale === undefined) {
        setLocale(nextLocale);
      }
    },
    [locale, onLocaleChange, setLocale],
  );

  return (
    <header className={cn(headerStyles({ position }), className)}>
      <div className="mx-auto grid h-18 w-full max-w-[90rem] grid-cols-[auto_1fr_auto] items-center gap-3 px-4 sm:px-6 lg:px-8 xl:px-10">
        <BrandLogo href={logoHref} brandName={messages.header.brandName} />
        <HeaderNav
          items={primaryNavItems}
          ariaLabel={messages.header.primaryNavigationAriaLabel}
        />
        <div className="flex min-w-0 items-center justify-end gap-1 sm:gap-2">
          <ThemeToggle className="hidden md:flex" />
          <LanguageSwitcher
            className="hidden xl:block"
            locale={activeLocale}
            locales={availableLocales}
            placeholder={messages.header.languagePlaceholder}
            ariaLabel={messages.header.languageAriaLabel}
            changedTemplate={messages.header.languageChanged}
            onLocaleChange={handleLocaleChange}
          />
          <Button
            asChild
            variant="default"
            size="sm"
            className="hidden xl:inline-flex"
          >
            <a
              href={EXTERNAL_ROUTES.githubRepository}
              target="_blank"
              rel="noreferrer"
              aria-label={mobileNavigation.githubStar.ariaLabel}
            >
              <Star className="size-4" aria-hidden="true" />
              <span>{mobileNavigation.githubStar.action}</span>
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          </Button>
          <MobileNavigation
            groups={mobileGroups}
            appDownloads={messages.appDownloads}
            githubStar={{
              ...mobileNavigation.githubStar,
              href: EXTERNAL_ROUTES.githubRepository,
            }}
            ariaLabel={messages.header.primaryNavigationAriaLabel}
            openMenuAriaLabel={messages.header.openNavigationMenuAriaLabel}
            closeMenuAriaLabel={messages.header.closeNavigationMenuAriaLabel}
          >
            {(portalContainer) => (
              <>
                <ThemeToggle className="md:hidden" />
                <LanguageSwitcher
                  className="min-w-0 flex-1"
                  portalContainer={portalContainer}
                  locale={activeLocale}
                  locales={availableLocales}
                  placeholder={messages.header.languagePlaceholder}
                  ariaLabel={messages.header.languageAriaLabel}
                  changedTemplate={messages.header.languageChanged}
                  feedbackMode="inline"
                  onLocaleChange={handleLocaleChange}
                />
              </>
            )}
          </MobileNavigation>
        </div>
      </div>
    </header>
  );
}
