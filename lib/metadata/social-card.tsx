import { ImageResponse } from "next/og";
import {
  BRAND_ARTWORK_PATH,
  BRAND_ARTWORK_TRANSFORM,
  WORDMARK_VIEW_BOX,
} from "@/components/brand/geometry";
import type { SocialCardPresentation } from "./social-card-types";
import { sanitizeSocialText } from "./sanitize-social-text";

export const SOCIAL_CARD_SIZE = { width: 1200, height: 630 } as const;
export const SOCIAL_CARD_CONTENT_TYPE = "image/png";

const colors = {
  canvas: "#f5f3ef",
  paper: "#fffefa",
  ink: "#21302e",
  mutedInk: "#5e6663",
  line: "#d8d8d1",
  surfaceMuted: "#eeefeb",
  mint: "#b0ec9c",
  mintDeep: "#315d35",
};

function titleFontSize(title: string): number {
  if (title.length > 110) return 42;
  if (title.length > 82) return 48;
  if (title.length > 58) return 54;
  return 62;
}

function SocialWordmark(): React.ReactNode {
  return (
    <svg
      width="238"
      height="44"
      viewBox={WORDMARK_VIEW_BOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMinYMid meet"
    >
      <g transform={BRAND_ARTWORK_TRANSFORM}>
        <path
          fill={colors.ink}
          fillRule="evenodd"
          clipRule="evenodd"
          d={BRAND_ARTWORK_PATH}
        />
      </g>
    </svg>
  );
}

function SocialCard({
  eyebrow,
  title,
  description,
  facts = [],
  tags = [],
  actionLabel,
}: SocialCardPresentation): React.ReactNode {
  const visibleFacts = facts.filter(({ value }) => value.trim()).slice(0, 3);
  const visibleTags = tags.filter(Boolean).slice(0, 3);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: colors.canvas,
        color: colors.ink,
        padding: 42,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          display: "flex",
          width: 260,
          height: 260,
          right: -86,
          top: -118,
          borderRadius: 999,
          background: colors.mint,
        }}
      />
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: `1px solid ${colors.line}`,
          borderRadius: 26,
          background: colors.paper,
          boxShadow: "0 18px 44px rgba(33,48,46,0.10)",
        }}
      >
        <div
          style={{
            height: 82,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 34px",
            borderBottom: `1px solid ${colors.line}`,
          }}
        >
          <SocialWordmark />
          <span
            style={{
              color: colors.mutedInk,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: 0.2,
            }}
          >
            Tech jobs from public communities
          </span>
        </div>

        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          <div
            style={{
              display: "flex",
              flex: 1,
              minWidth: 0,
              flexDirection: "column",
              justifyContent: "center",
              padding: "34px 42px 30px",
            }}
          >
            <span
              style={{
                color: colors.mintDeep,
                fontSize: 14,
                fontWeight: 800,
                letterSpacing: 1.4,
                textTransform: "uppercase",
              }}
            >
              {eyebrow}
            </span>
            <span
              style={{
                maxWidth: 710,
                maxHeight: 190,
                marginTop: 16,
                overflow: "hidden",
                color: colors.ink,
                fontSize: titleFontSize(title),
                fontWeight: 800,
                lineHeight: 1.02,
                letterSpacing: -2.2,
              }}
            >
              {title}
            </span>
            {description ? (
              <span
                style={{
                  maxWidth: 700,
                  maxHeight: 58,
                  marginTop: 18,
                  overflow: "hidden",
                  color: colors.mutedInk,
                  fontSize: 19,
                  lineHeight: 1.42,
                }}
              >
                {description}
              </span>
            ) : null}
            {visibleTags.length > 0 ? (
              <div style={{ display: "flex", gap: 9, marginTop: 22 }}>
                {visibleTags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      minHeight: 31,
                      padding: "0 12px",
                      borderRadius: 999,
                      background: colors.surfaceMuted,
                      color: colors.ink,
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div
            style={{
              width: 310,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "32px 30px",
              borderLeft: `1px solid ${colors.line}`,
              background: "#fbfaf6",
            }}
          >
            {visibleFacts.map(({ label, value }, index) => (
              <div
                key={`${label}-${value}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  paddingTop: index === 0 ? 0 : 18,
                  paddingBottom: 18,
                  borderTop: index === 0 ? "none" : `1px solid ${colors.line}`,
                }}
              >
                <span
                  style={{
                    color: colors.mutedInk,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 1,
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    marginTop: 7,
                    color: colors.ink,
                    fontSize: 19,
                    fontWeight: 700,
                    lineHeight: 1.24,
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                minHeight: 50,
                marginTop: visibleFacts.length ? 8 : 0,
                padding: "0 17px",
                borderRadius: 999,
                background: colors.mint,
                color: colors.ink,
                fontSize: 15,
                fontWeight: 800,
              }}
            >
              <span>{actionLabel}</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function createSocialCardImage(
  presentation: SocialCardPresentation,
): ImageResponse {
  const sanitized: SocialCardPresentation = {
    eyebrow: sanitizeSocialText(presentation.eyebrow),
    title: sanitizeSocialText(presentation.title),
    description: presentation.description
      ? sanitizeSocialText(presentation.description)
      : undefined,
    facts: presentation.facts?.map(({ label, value }) => ({
      label: sanitizeSocialText(label),
      value: sanitizeSocialText(value),
    })),
    tags: presentation.tags?.map(sanitizeSocialText).filter(Boolean),
    actionLabel: sanitizeSocialText(presentation.actionLabel),
  };
  return new ImageResponse(<SocialCard {...sanitized} />, SOCIAL_CARD_SIZE);
}
