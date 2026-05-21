// Side-effect import: initialises OpenTelemetry before any instrumented
// library is loaded by the rest of the service.
import { initObservability } from "@storm/observability";

import { SERVICE_NAME } from "./config.js";

initObservability({
  serviceName: SERVICE_NAME,
  serviceVersion: process.env["SERVICE_VERSION"] ?? "dev",
});
