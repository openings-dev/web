import { cache } from "react";
import {
  createSocialCardImage,
  SOCIAL_CARD_CONTENT_TYPE,
  SOCIAL_CARD_SIZE,
} from "@/lib/metadata/social-card";
import {
  createAuthorSocialCard,
  createUnavailableSocialCard,
} from "@/lib/metadata/social-card-presentations";
import { listAuthorSocialCardParams } from "@/lib/metadata/social-card-static-params";
import { authorHandleFromRoute } from "@/lib/opportunities/routing";
import { getSnapshotUserByHandle } from "@/lib/opportunities/users";

interface AuthorSocialImageProps {
  params: Promise<{ handle: string }>;
}

export const dynamic = "force-static";
export const alt = "GitHub author job profile on openings.dev";
export const size = SOCIAL_CARD_SIZE;
export const contentType = SOCIAL_CARD_CONTENT_TYPE;

const getAuthor = cache(getSnapshotUserByHandle);

export async function generateStaticParams(): Promise<Array<{ handle: string }>> {
  return listAuthorSocialCardParams();
}

async function resolveAuthor(params: AuthorSocialImageProps["params"]) {
  const { handle: routeHandle } = await params;
  const handle = authorHandleFromRoute(routeHandle);
  const author = await getAuthor(handle);

  return { author, handle };
}

export default async function AuthorSocialImage({
  params,
}: AuthorSocialImageProps): Promise<ReturnType<typeof createSocialCardImage>> {
  const { author, handle } = await resolveAuthor(params);
  const presentation = author
    ? createAuthorSocialCard(author)
    : createUnavailableSocialCard(
        "GitHub author profile",
        `@${handle}`,
      );

  return createSocialCardImage(presentation);
}
