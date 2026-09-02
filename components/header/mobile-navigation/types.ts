import type React from "react";
import type { AppDownloadMessages } from "@/components/app-download-links";
import type { HeaderNavItem } from "../header-nav/types";

export interface MobileNavigationItem extends HeaderNavItem {
  external?: boolean;
}

export interface MobileNavigationGroup {
  id: string;
  label: string;
  items: MobileNavigationItem[];
}

export interface GitHubStarCallToAction {
  title: string;
  description: string;
  action: string;
  ariaLabel: string;
  href: string;
}

export interface MobileNavigationProps {
  groups: MobileNavigationGroup[];
  appDownloads: AppDownloadMessages;
  githubStar: GitHubStarCallToAction;
  ariaLabel: string;
  openMenuAriaLabel: string;
  closeMenuAriaLabel: string;
  children:
    | React.ReactNode
    | ((portalContainer: HTMLElement | null) => React.ReactNode);
}
