# Observability Standards

**Applies to:** Any service or frontend in a distributed system. Observability is mandatory, not optional.

---

## 1. Goals

- Time-to-diagnose measured in minutes, not hours
- Every request traceable end-to-end across services
- Production behavior visible without code changes or new deploys
- Alerts signal real problems and nothing else

---

## 2. Three Pillars

| Pillar | Question it answers |
|---|---|
| Logs | What happened in this specific request? |
| Metrics | How is the system behaving in aggregate? |
| Traces | How did this request flow through the system? |

All three instrumented via **OpenTelemetry** for vendor portability.

---

## 3. Structured Logging

| Rule | Detail |
|---|---|
| Format | JSON, one object per line |
| Required fields | `timestamp`, `level`, `service`, `traceId`, `spanId`, `userId` (when known), `message` |
| Levels | `DEBUG`, `INFO`, `WARN`, `ERROR` — no custom levels |
| Default production level | `INFO` |
| Context propagation | Async-local storage / context object — never threaded through function arguments |
| Sampling | Sample `DEBUG` and `INFO` in high-volume paths; never sample `ERROR` |

---

## 4. Metrics — RED for Services, USE for Resources

| Pattern | Applies to | Three metrics |
|---|---|---|
| RED | Every service / endpoint | Rate (req/sec), Errors (% failing), Duration (latency percentiles) |
| USE | Every resource (CPU, memory, disk, connection pool) | Utilization, Saturation, Errors |

| Metric type | Use for |
|---|---|
| Counter | Cumulative counts (requests, errors) |
| Gauge | Point-in-time values (connections, queue depth) |
| Histogram | Distributions (latency) — always prefer histograms over averages |

**Rule:** never alert on averages. p99 latency, error rate percentage, queue saturation — these signal problems. Averages hide everything.

---

## 5. Distributed Tracing

| Rule | Detail |
|---|---|
| Standard | OpenTelemetry (W3C `traceparent` header) |
| Propagation | Trace context flows across every service hop, including async events |
| Sampling | Tail-based preferred — keep 100% of error and slow traces, sample healthy ones |
| Span naming | `<service>.<operation>` (e.g., `order.placeOrder`) |
| Required attributes | `service.name`, `service.version`, `user.id`, `http.status_code`, business identifiers (orderId, etc.) |

---

## 6. Correlation

Every request gets a **request ID** at the edge (gateway generates if absent). This ID:

- Appears in every log line for the request
- Equals or contains the trace ID
- Is returned to the client as `X-Request-Id`
- Is the primary key for support tickets

---

## 7. Alerting

| Rule | Detail |
|---|---|
| Alerts derive from SLOs | Define service-level objectives; alert when error budget burns too fast |
| Page only on user-facing impact | Anything else is a dashboard, not a page |
| Every alert is actionable | If there's no immediate fix, it's noise — make it a metric, not an alert |
| Runbook required | Every alert links to a runbook documenting investigation steps |

---

## 8. What Never to Log

| Never log | Why |
|---|---|
| Passwords, tokens, secrets, API keys | Log files become credential dumps |
| Full credit card numbers, CVVs | PCI violation |
| OTPs | Compromises auth |
| Full request/response bodies on PII paths | Privacy regulation |
| Personally identifiable information without need | Minimum-necessary principle |

Log identifiers (user ID, transaction ID) — not the sensitive data itself.

---

## 9. Conventions

| Concern | Convention |
|---|---|
| Format | Structured JSON, OpenTelemetry-instrumented |
| Required log fields | `timestamp`, `level`, `service`, `traceId`, `spanId`, `userId`, `message` |
| Metric pattern | RED for services, USE for resources |
| Alert basis | SLO error budgets, p99 percentiles, never averages |
| Correlation | `X-Request-Id` end-to-end, equals or contains trace ID |
| Trace propagation | W3C `traceparent` on every hop, including events |
| Log retention | Hot 7–14 days, cold archive for compliance window |
| Sensitive data | Never logged; redacted at source |

---

## 10. Anti-Patterns

| Anti-pattern | Why it's wrong |
|---|---|
| Unstructured text logs | Cannot be queried, aggregated, or correlated |
| Logging at `DEBUG` in production | Cost explosion; signal-to-noise plummets |
| Alerting on averages | Hides p99 disasters |
| Alerting on every `WARN` | Pager fatigue; real alerts ignored |
| One alert per metric, no SLOs | Reacting to noise, not user impact |
| Trace context dropped at event boundaries | Cannot follow async flows end-to-end |
| Logging full payloads "just in case" | PII leak waiting to happen |
| No request ID in error responses | Support cannot find your logs from a customer complaint |
