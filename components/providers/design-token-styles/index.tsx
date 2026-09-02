import {
  darkSemanticColors,
  foundationTokens,
  lightSemanticColors,
  type SemanticColorToken,
} from "@openingshq/design-tokens";

const RADIUS_VARIABLES = {
  "--openings-radius-card": "card",
  "--openings-radius-control": "control",
  "--openings-radius-control-lg": "controlLg",
  "--openings-radius-control-sm": "controlSm",
  "--openings-radius-editorial": "editorial",
  "--openings-radius-floating": "floating",
  "--openings-radius-panel": "panel",
  "--openings-radius-pill": "pill",
} as const satisfies Record<string, keyof typeof foundationTokens.radius>;

function serializeColors(
  colors: Readonly<Record<SemanticColorToken, string>>,
): string {
  return Object.entries(colors)
    .map(([token, value]) => `--openings-color-${token}:${value};`)
    .join("");
}

function serializeRadii(): string {
  return Object.entries(RADIUS_VARIABLES)
    .map(([variable, token]) => {
      const value = foundationTokens.radius[token];
      const cssValue = token === "pill" ? `${value}px` : `${value / 16}rem`;

      return `${variable}:${cssValue};`;
    })
    .join("");
}

const SHARED_THEME_CSS = [
  `:root{${serializeColors(lightSemanticColors)}${serializeRadii()}}`,
  `.dark{${serializeColors(darkSemanticColors)}}`,
].join("");

export function DesignTokenStyles(): React.ReactNode {
  return (
    <style href="openings-design-tokens" precedence="high">
      {SHARED_THEME_CSS}
    </style>
  );
}
