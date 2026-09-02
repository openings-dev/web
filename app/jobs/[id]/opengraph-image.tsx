import { cache } from "react";
import {
  createSocialCardImage,
  SOCIAL_CARD_CONTENT_TYPE,
  SOCIAL_CARD_SIZE,
} from "@/lib/metadata/social-card";
import {
  createOpportunitySocialCard,
  createUnavailableSocialCard,
} from "@/lib/metadata/social-card-presentations";
import { listJobSocialCardParams } from "@/lib/metadata/social-card-static-params";
import { fetchOpportunityById } from "@/lib/opportunities/api";

interface JobSocialImageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-static";
export const alt = "Open job on openings.dev";
export const size = SOCIAL_CARD_SIZE;
export const contentType = SOCIAL_CARD_CONTENT_TYPE;

const getOpportunity = cache(fetchOpportunityById);

export async function generateStaticParams(): Promise<Array<{ id: string }>> {
  return listJobSocialCardParams();
}

async function resolveOpportunity(params: JobSocialImageProps["params"]) {
  const { id: encodedId } = await params;
  const id = decodeURIComponent(encodedId);
  const opportunity = await getOpportunity(id);

  return { id, opportunity };
}

export default async function JobSocialImage({
  params,
}: JobSocialImageProps): Promise<ReturnType<typeof createSocialCardImage>> {
  const { id, opportunity } = await resolveOpportunity(params);
  const presentation = opportunity
    ? createOpportunitySocialCard(opportunity)
    : createUnavailableSocialCard("Open job", `Job ${id}`);

  return createSocialCardImage(presentation);
}
