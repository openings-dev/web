import type { CommunitySummary } from "@/lib/opportunities/communities";
import {
  OpportunitySalaryPeriod,
  OpportunitySourceType,
  type OpportunityItem,
  type OpportunitySalary,
} from "@/lib/opportunities/types";
import type { UserSummary } from "@/lib/opportunities/users";
import type {
  SocialCardFact,
  SocialCardPresentation,
} from "./social-card-types";

const numberFormatter = new Intl.NumberFormat("en-US");

const salaryPeriods: Record<OpportunitySalaryPeriod, string> = {
  [OpportunitySalaryPeriod.Hour]: "hour",
  [OpportunitySalaryPeriod.Month]: "month",
  [OpportunitySalaryPeriod.Year]: "year",
};

const sourceLabels: Record<OpportunitySourceType, string> = {
  [OpportunitySourceType.CommunityBoard]: "Community board",
  [OpportunitySourceType.GithubDiscussion]: "GitHub discussion",
  [OpportunitySourceType.GithubIssue]: "GitHub issue",
};

function appendFact(
  facts: SocialCardFact[],
  label: string,
  value: string,
): void {
  if (value.trim()) facts.push({ label, value });
}

function formatLocation(country: string, region: string): string {
  const values = [country, region]
    .map((value) => value.trim())
    .filter(Boolean)
    .filter(
      (value, index, entries) =>
        entries.findIndex(
          (entry) =>
            entry.toLocaleLowerCase("en-US") ===
            value.toLocaleLowerCase("en-US"),
        ) === index,
    );

  return values.join(" · ");
}

function formatMoney(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency} ${numberFormatter.format(value)}`;
  }
}

function isSalaryValue(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function formatSalary(salary: OpportunitySalary | undefined): string {
  if (!salary) return "";

  const minimum = isSalaryValue(salary.min) ? salary.min : null;
  const maximum = isSalaryValue(salary.max) ? salary.max : null;
  if (
    (minimum === null && maximum === null) ||
    (minimum !== null && maximum !== null && minimum > maximum)
  ) {
    return "";
  }

  const period = salaryPeriods[salary.period];
  if (minimum !== null && maximum !== null) {
    const formattedMinimum = formatMoney(minimum, salary.currency);
    const formattedMaximum = formatMoney(maximum, salary.currency);
    return minimum === maximum
      ? `${formattedMinimum}/${period}`
      : `${formattedMinimum}–${formattedMaximum}/${period}`;
  }
  if (minimum !== null) {
    return `From ${formatMoney(minimum, salary.currency)}/${period}`;
  }
  return maximum !== null
    ? `Up to ${formatMoney(maximum, salary.currency)}/${period}`
    : "";
}

function formatOpenJobs(count: number): string {
  return `${numberFormatter.format(count)} open ${count === 1 ? "job" : "jobs"}`;
}

function distinctTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const values: string[] = [];

  for (const rawTag of tags) {
    const tag = rawTag.trim();
    const key = tag.toLocaleLowerCase("en-US");
    if (!tag || seen.has(key)) continue;
    seen.add(key);
    values.push(tag);
    if (values.length === 3) break;
  }

  return values;
}

export function createOpportunitySocialCard(
  item: OpportunityItem,
): SocialCardPresentation {
  const communityName = item.community.name.trim() || item.repository;
  const facts: SocialCardFact[] = [];
  appendFact(facts, "Salary", formatSalary(item.salary));
  appendFact(facts, "Job location", formatLocation(item.country, item.region));
  appendFact(facts, "Original source", sourceLabels[item.sourceType]);

  return {
    eyebrow: `${communityName} · Open job`,
    title: item.title,
    description: item.companyName?.trim()
      ? `At ${item.companyName.trim()}. Shared through ${communityName}.`
      : `Shared through ${communityName}.`,
    facts,
    tags: distinctTags(item.tags),
    actionLabel: "View job",
  };
}

export function createCommunitySocialCard(
  profile: CommunitySummary,
): SocialCardPresentation {
  const facts: SocialCardFact[] = [];
  appendFact(facts, "Repository", profile.repository);
  appendFact(
    facts,
    "Open jobs",
    numberFormatter.format(profile.opportunitiesCount),
  );
  appendFact(
    facts,
    "Job locations",
    formatLocation(profile.country, profile.region),
  );

  return {
    eyebrow: "Community profile",
    title: profile.name,
    description: `${formatOpenJobs(profile.opportunitiesCount)} shared through ${profile.repository}.`,
    facts,
    actionLabel: "View community jobs",
  };
}

export function createAuthorSocialCard(
  profile: UserSummary,
): SocialCardPresentation {
  const facts: SocialCardFact[] = [];
  appendFact(facts, "GitHub author", `@${profile.handle}`);
  appendFact(
    facts,
    "Open jobs",
    numberFormatter.format(profile.opportunitiesCount),
  );
  appendFact(
    facts,
    "Common job location",
    formatLocation(profile.country, profile.region),
  );

  return {
    eyebrow: "GitHub author profile",
    title: profile.name.trim() || `@${profile.handle}`,
    description: `${formatOpenJobs(profile.opportunitiesCount)} authored by @${profile.handle} across public community repositories.`,
    facts,
    actionLabel: "View author profile",
  };
}

export function createUnknownAuthorSocialCard(
  handle: string,
): SocialCardPresentation {
  return {
    eyebrow: "GitHub author profile",
    title: `@${handle}`,
    description:
      "Explore the current public job listings shared across community repositories.",
    facts: [{ label: "GitHub author", value: `@${handle}` }],
    actionLabel: "Explore current jobs",
  };
}
