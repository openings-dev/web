import type { TelemetryEventMap, TelemetryEventName } from "./contracts";
import { readAnalyticsConsent } from "./consent";
import { sanitizeProductEvent } from "./sanitize";

type ProductEventHandler = (name: string, properties: Record<string, unknown>) => void;
type PendingProductEvent = {
  name: string;
  properties: Record<string, unknown>;
};
type TechnicalExceptionHandler = (
  error: unknown,
  context: { category: string },
) => void;

let productEventHandler: ProductEventHandler | null = null;
let technicalExceptionHandler: TechnicalExceptionHandler | null = null;
let pendingProductEvents: PendingProductEvent[] = [];

export function setProductEventHandler(handler: ProductEventHandler | null) {
  productEventHandler = handler;
  if (!handler) return;

  const events = pendingProductEvents;
  pendingProductEvents = [];
  for (const event of events) handler(event.name, event.properties);
}

export function clearPendingProductEvents() {
  pendingProductEvents = [];
}

export function setTechnicalExceptionHandler(
  handler: TechnicalExceptionHandler | null,
) {
  technicalExceptionHandler = handler;
}

export function trackProductEvent<Name extends TelemetryEventName>(
  name: Name,
  properties: TelemetryEventMap[Name],
) {
  const event = sanitizeProductEvent(name, properties);
  if (!event || readAnalyticsConsent() !== "granted") return;

  const pendingEvent = {
    name: event.name,
    properties: event.properties as Record<string, unknown>,
  };
  if (productEventHandler) productEventHandler(pendingEvent.name, pendingEvent.properties);
  else pendingProductEvents.push(pendingEvent);
}

export function captureTechnicalException(
  error: unknown,
  context: { category: string },
) {
  technicalExceptionHandler?.(error, context);
}

export type { TelemetryEventMap, TelemetryEventName } from "./contracts";
