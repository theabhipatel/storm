import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  SEMRESATTRS_SERVICE_NAME,
  SEMRESATTRS_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";

export interface InitObservabilityOptions {
  serviceName: string;
  serviceVersion?: string;
  environment?: string;
  otlpEndpoint?: string;
  diagLevel?: "error" | "warn" | "info" | "debug" | "none";
}

let sdk: NodeSDK | null = null;

export function initObservability(opts: InitObservabilityOptions): NodeSDK {
  if (sdk) return sdk;
  const level = opts.diagLevel ?? "warn";
  if (level !== "none") {
    diag.setLogger(new DiagConsoleLogger(), levelToDiag(level));
  }

  const endpoint =
    opts.otlpEndpoint ??
    process.env["OTEL_EXPORTER_OTLP_ENDPOINT"] ??
    "http://otel-collector.observability.svc.cluster.local:4318";

  const exporter = new OTLPTraceExporter({
    url: endpoint.endsWith("/v1/traces") ? endpoint : `${endpoint}/v1/traces`,
  });

  sdk = new NodeSDK({
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: opts.serviceName,
      [SEMRESATTRS_SERVICE_VERSION]:
        opts.serviceVersion ?? process.env["SERVICE_VERSION"] ?? "0.0.0",
      "deployment.environment":
        opts.environment ??
        process.env["DEPLOYMENT_ENVIRONMENT"] ??
        process.env["NODE_ENV"] ??
        "development",
    }),
    traceExporter: exporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": { enabled: false },
        "@opentelemetry/instrumentation-express": { enabled: true },
        "@opentelemetry/instrumentation-http": {
          enabled: true,
          ignoreIncomingRequestHook: (req) => {
            const url = req.url ?? "";
            return url === "/health" || url === "/ready" || url === "/metrics";
          },
        },
      }),
    ],
  });

  sdk.start();
  return sdk;
}

export async function shutdownObservability(): Promise<void> {
  if (!sdk) return;
  try {
    await sdk.shutdown();
  } finally {
    sdk = null;
  }
}

function levelToDiag(level: "error" | "warn" | "info" | "debug"): DiagLogLevel {
  switch (level) {
    case "error":
      return DiagLogLevel.ERROR;
    case "warn":
      return DiagLogLevel.WARN;
    case "info":
      return DiagLogLevel.INFO;
    case "debug":
      return DiagLogLevel.DEBUG;
  }
}
