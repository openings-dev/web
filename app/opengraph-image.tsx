import {
  createSocialCardImage,
  SOCIAL_CARD_CONTENT_TYPE,
  SOCIAL_CARD_SIZE,
} from "@/lib/metadata/social-card";
import { loadOpportunityManifest } from "@/lib/opportunities/static-artifacts";

export const alt = "openings.dev — Tech jobs shared through public GitHub communities";
export const size = SOCIAL_CARD_SIZE;
export const contentType = SOCIAL_CARD_CONTENT_TYPE;
export const dynamic = "force-static";

export default async function OpenGraphImage(): Promise<
  ReturnType<typeof createSocialCardImage>
> {
  const manifest = await loadOpportunityManifest();

  return createSocialCardImage({
    eyebrow: "Live public index · Open source",
    title: "Tech jobs shared through public GitHub communities.",
    description:
      "Search one focused index, keep the community context, and continue to the original listing.",
    facts: [
      {
        label: "Open jobs",
        value: manifest.totals.openOpportunities.toLocaleString("en-US"),
      },
      {
        label: "Communities",
        value: manifest.totals.communities.toLocaleString("en-US"),
      },
      {
        label: "Countries",
        value: manifest.totals.countries.toLocaleString("en-US"),
      },
    ],
    actionLabel: "Search openings.dev",
  });
}
