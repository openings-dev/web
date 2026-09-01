import * as Sentry from "@sentry/nextjs";
import { sanitizeSentryEvent } from "@/lib/telemetry/sanitize";
import { setTechnicalExceptionHandler } from "@/lib/telemetry";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? "production",
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    beforeSend: (event) => sanitizeSentryEvent(
      event as unknown as Record<string, unknown>,
    ) as typeof event,
  });
  setTechnicalExceptionHandler((error, context) => {
    Sentry.captureException(error, { tags: context });
  });
}
