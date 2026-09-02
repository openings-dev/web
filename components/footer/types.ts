import type { ComponentType, SVGProps } from "react";
import type { AppDownloadMessages } from "@/components/app-download-links";

type FooterIcon = ComponentType<SVGProps<SVGSVGElement>>;

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterLinkGroup {
  id: string;
  title: string;
  ariaLabel?: string;
  links: FooterLink[];
}

export interface FooterSocialLink {
  label: string;
  href: string;
  icon: FooterIcon;
  external?: boolean;
  ariaLabel?: string;
}

export interface FooterProps {
  className?: string;
  brandHref?: string;
  brandName?: string;
  brandTagline?: string;
  description?: string;
  supportEmail?: string;
  supportEmailButtonLabel?: string;
  supportEmailCopiedMessage?: string;
  supportEmailCopyErrorMessage?: string;
  supportText?: string;
  copyrightText?: string;
  signature?: string;
  /** @deprecated Footer now renders the canonical wordmark. */
  lightLogoSrc?: string;
  /** @deprecated Footer now renders the canonical wordmark. */
  darkLogoSrc?: string;
  linkGroups?: FooterLinkGroup[];
  socialLinks?: FooterSocialLink[];
}

export interface FooterBrandProps {
  className?: string;
  href: string;
  brandName: string;
  brandTagline: string;
  description: string;
  appDownloads: AppDownloadMessages;
  /** @deprecated FooterBrand now renders the canonical wordmark. */
  lightLogoSrc?: string;
  /** @deprecated FooterBrand now renders the canonical wordmark. */
  darkLogoSrc?: string;
  socialLinks: FooterSocialLink[];
  socialLinksAriaLabel: string;
}

export interface FooterLinksProps {
  className?: string;
  groups: FooterLinkGroup[];
}

export interface FooterBottomProps {
  className?: string;
  supportEmail?: string;
  supportEmailButtonLabel: string;
  supportEmailCopiedMessage: string;
  supportEmailCopyErrorMessage: string;
  supportText: string;
  copyrightText: string;
  signature: string;
}
