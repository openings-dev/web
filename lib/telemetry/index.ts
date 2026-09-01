import type { TelemetryEventMap, TelemetryEventName } from "./contracts";
import { sanitizeProductEvent } from "./sanitize";

type ProductEventHandler = (name: string, properties: Record<string, unknown>) => void;
type TechnicalExceptionHandler = (
  error: unknown,
  context: { category: string },
) => void;

let productEventHandler: ProductEventHandler | null = null;
let technicalExceptionHandler: TechnicalExceptionHandler | null = null;

export function setProductEventHandler(handler: ProductEventHandler | null) {
  productEventHandler = handler;
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
  if (event && productEventHandler) {
    productEventHandler(event.name, event.properties as Record<string, unknown>);
  }
}

export function captureTechnicalException(
  error: unknown,
  context: { category: string },
) {
  technicalExceptionHandler?.(error, context);
}

export type { TelemetryEventMap, TelemetryEventName } from "./contracts";
