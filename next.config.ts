import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  turbopack: {
    root: process.cwd(),
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "github.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

const canUploadSourceMaps = Boolean(
  process.env.SENTRY_AUTH_TOKEN &&
  process.env.SENTRY_ORG &&
  process.env.SENTRY_PROJECT,
);

export default withSentryConfig(nextConfig, {
  authToken: canUploadSourceMaps ? process.env.SENTRY_AUTH_TOKEN : undefined,
  org: canUploadSourceMaps ? process.env.SENTRY_ORG : undefined,
  project: canUploadSourceMaps ? process.env.SENTRY_PROJECT : undefined,
  silent: true,
  webpack: {
    treeshake: { removeDebugLogging: true },
  },
  telemetry: false,
  sourcemaps: {
    disable: !canUploadSourceMaps,
    deleteSourcemapsAfterUpload: true,
  },
});
