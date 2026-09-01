"use client";

import { useI18n } from "@/components/providers/i18n-provider/use-i18n";
import { BlueskyIcon } from "@/components/icons/bluesky";
import { GithubIcon } from "@/components/icons/github";
import { InstagramIcon } from "@/components/icons/instagram";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { MastodonIcon } from "@/components/icons/mastodon";
import { ThreadsIcon } from "@/components/icons/threads";
import { EXTERNAL_ROUTES, PUBLIC_ROUTES } from "@/lib/navigation/routes";
import { cn } from "@/lib/utils/tailwind";
import { FooterBottom } from "./footer-bottom";
import { FooterBrand } from "./footer-brand";
import { FooterLinks } from "./footer-links";
import type { FooterLinkGroup, FooterProps, FooterSocialLink } from "./types";

export function Footer({
  className,
  brandHref = "/",
  brandName = "openings.dev",
  brandTagline,
  description,
  supportEmail = "support@openings.dev",
  supportEmailButtonLabel,
  supportEmailCopiedMessage,
  supportEmailCopyErrorMessage,
  supportText,
  copyrightText,
  signature,
  linkGroups,
  socialLinks,
}: FooterProps): React.ReactNode {
  const { messages } = useI18n();
  const footerMessages = messages.footer;
  const year = new Date().getFullYear().toString();

  const defaultLinkGroups: FooterLinkGroup[] = [
    {
      id: "project",
      title: footerMessages.groups.project,
      ariaLabel: footerMessages.groupAriaLabels.project,
      links: [
        { label: messages.header.nav.docs, href: PUBLIC_ROUTES.docs },
        { label: messages.header.nav.status, href: PUBLIC_ROUTES.status },
        { label: footerMessages.links.updates, href: PUBLIC_ROUTES.updates },
        { label: footerMessages.links.methodology, href: PUBLIC_ROUTES.methodology },
        { label: footerMessages.links.overview, href: PUBLIC_ROUTES.overview },
        {
          label: footerMessages.links.designSystem,
          href: PUBLIC_ROUTES.design,
        },
        {
          label: footerMessages.links.communities,
          href: PUBLIC_ROUTES.communities,
        },
        {
          label: footerMessages.links.maintainers,
          href: PUBLIC_ROUTES.communityGuide,
        },
        { label: footerMessages.links.users, href: PUBLIC_ROUTES.authors },
        {
          label: footerMessages.links.apiReference,
          href: PUBLIC_ROUTES.apiReference,
        },
      ],
    },
    {
      id: "open-source",
      title: footerMessages.groups.openSource,
      ariaLabel: footerMessages.groupAriaLabels.openSource,
      links: [
        {
          label: footerMessages.links.github,
          href: EXTERNAL_ROUTES.githubRepository,
          external: true,
        },
        {
          label: footerMessages.links.contributing,
          href: PUBLIC_ROUTES.contributing,
        },
        {
          label: footerMessages.links.reportIssue,
          href: EXTERNAL_ROUTES.reportIssue,
          external: true,
        },
      ],
    },
    {
      id: "legal",
      title: footerMessages.groups.legal,
      ariaLabel: footerMessages.groupAriaLabels.legal,
      links: [
        {
          label: footerMessages.links.privacyPolicy,
          href: PUBLIC_ROUTES.privacy,
        },
        {
          label: footerMessages.links.termsOfService,
          href: PUBLIC_ROUTES.terms,
        },
      ],
    },
  ];

  const defaultSocialLinks: FooterSocialLink[] = [
    {
      label: footerMessages.links.github,
      href: EXTERNAL_ROUTES.githubRepository,
      icon: GithubIcon,
      external: true,
      ariaLabel: footerMessages.social.githubAriaLabel,
    },
    {
      label: footerMessages.links.linkedin,
      href: EXTERNAL_ROUTES.linkedin,
      icon: LinkedinIcon,
      external: true,
      ariaLabel: footerMessages.social.linkedinAriaLabel,
    },
    {
      label: footerMessages.links.bluesky,
      href: EXTERNAL_ROUTES.bluesky,
      icon: BlueskyIcon,
      external: true,
      ariaLabel: footerMessages.social.blueskyAriaLabel,
    },
    {
      label: footerMessages.links.mastodon,
      href: EXTERNAL_ROUTES.mastodon,
      icon: MastodonIcon,
      external: true,
      ariaLabel: footerMessages.social.mastodonAriaLabel,
    },
    {
      label: footerMessages.links.threads,
      href: EXTERNAL_ROUTES.threads,
      icon: ThreadsIcon,
      external: true,
      ariaLabel: footerMessages.social.threadsAriaLabel,
    },
    {
      label: footerMessages.links.instagram,
      href: EXTERNAL_ROUTES.instagram,
      icon: InstagramIcon,
      external: true,
      ariaLabel: footerMessages.social.instagramAriaLabel,
    },
  ];

  const resolvedLinkGroups = linkGroups?.length
    ? linkGroups
    : defaultLinkGroups;
  const resolvedSocialLinks = socialLinks?.length
    ? socialLinks
    : defaultSocialLinks;
  const resolvedBrandTagline = brandTagline ?? footerMessages.brandTagline;
  const resolvedDescription = description ?? footerMessages.description;
  const resolvedSupportText = supportText ?? footerMessages.supportText;
  const resolvedSignature = signature ?? footerMessages.signature;
  const resolvedSupportEmailButtonLabel =
    supportEmailButtonLabel ?? footerMessages.supportEmailButtonLabel;
  const resolvedSupportEmailCopiedMessage =
    supportEmailCopiedMessage ?? footerMessages.supportEmailCopied;
  const resolvedSupportEmailCopyErrorMessage =
    supportEmailCopyErrorMessage ?? footerMessages.supportEmailCopyError;
  const resolvedCopyright =
    copyrightText ??
    footerMessages.copyrightTemplate
      .replace("{year}", year)
      .replace("{brand}", brandName);

  return (
    <footer
      className={cn(
        "focus-context-inverse relative mt-20 bg-night text-night-foreground",
        className,
      )}
    >
      <div className="relative mx-auto flex w-full max-w-[90rem] flex-col gap-12 px-4 pb-8 pt-14 sm:px-6 sm:pb-10 sm:pt-16 lg:px-8 lg:pt-20 xl:px-10">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <FooterBrand
            className="lg:col-span-5"
            href={brandHref}
            brandName={brandName}
            brandTagline={resolvedBrandTagline}
            description={resolvedDescription}
            socialLinks={resolvedSocialLinks}
            socialLinksAriaLabel={footerMessages.social.linksAriaLabel}
          />
          <FooterLinks className="lg:col-span-7" groups={resolvedLinkGroups} />
        </div>

        <FooterBottom
          supportEmail={supportEmail}
          supportEmailButtonLabel={resolvedSupportEmailButtonLabel}
          supportEmailCopiedMessage={resolvedSupportEmailCopiedMessage}
          supportEmailCopyErrorMessage={resolvedSupportEmailCopyErrorMessage}
          supportText={resolvedSupportText}
          copyrightText={resolvedCopyright}
          signature={resolvedSignature}
        />
      </div>
    </footer>
  );
}
