import type { LocaleCode } from "@/lib/constants/locales";

export type UpdateKind = "changelog" | "release" | "roadmap";
export type RoadmapLane = "now" | "next" | "later";
export type UpdateCategory =
  | "discovery"
  | "data"
  | "trust"
  | "operations"
  | "growth";

export interface LocalizedUpdateCopy {
  title: string;
  summary: string;
}

interface UpdateBase {
  id: string;
  category: UpdateCategory;
  href?: string;
  copy: Record<LocaleCode, LocalizedUpdateCopy>;
}

export interface ChangelogEntry extends UpdateBase {
  kind: "changelog";
  date: string;
  version?: never;
  lane?: never;
}

export interface ReleaseEntry extends UpdateBase {
  kind: "release";
  date: string;
  version: string;
  lane?: never;
}

export interface RoadmapEntry extends UpdateBase {
  kind: "roadmap";
  lane: RoadmapLane;
  date?: never;
  version?: never;
}

export type UpdateEntry = ChangelogEntry | ReleaseEntry | RoadmapEntry;
