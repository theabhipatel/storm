export { initObservability, shutdownObservability } from "./otel.js";
export { trace, context, propagation, SpanStatusCode } from "@opentelemetry/api";
export type { Span, Tracer } from "@opentelemetry/api";
export {
  metricsHandler,
  recordOrderPlaced,
  recordPaymentResult,
  observeSearchLatency,
  setLowStockCount,
  httpDurationHistogram,
  httpRequestsTotal,
  getRegistry,
} from "./metrics.js";
