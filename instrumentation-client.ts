import * as Sentry from "@sentry/nextjs";
import {
  sanitizeSentryBreadcrumb,
  sanitizeSentryEvent,
} from "@/lib/telemetry/sanitize";
import { setTechnicalExceptionHandler } from "@/lib/telemetry";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? "production",
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    sendDefaultPii: false,
    tracesSampleRate: 0.05,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    beforeSend: (event) => sanitizeSentryEvent(
      event as unknown as Record<string, unknown>,
    ) as typeof event,
    beforeBreadcrumb: (breadcrumb) => sanitizeSentryBreadcrumb(
      breadcrumb as unknown as Record<string, unknown>,
    ) as typeof breadcrumb,
  });
  setTechnicalExceptionHandler((error, context) => {
    Sentry.captureException(error, { tags: context });
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
