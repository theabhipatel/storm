# Testing Strategy for Microservices

**Applies to:** Any service or frontend in a distributed system. Testing is mandatory; coverage targets are per-team.

---

## 1. Goals

- Fast feedback for developers
- High confidence in deployments
- Catch contract drift between services before production
- Failure modes verified, not just happy paths

---

## 2. The Test Pyramid

| Layer | Volume | Speed | Confidence per test |
|---|---|---|---|
| Unit | High (thousands) | Milliseconds | Low |
| Integration | Medium (hundreds) | Seconds | Medium |
| Contract | Medium (per API/event) | Seconds | Medium |
| E2E | Low (dozens) | Minutes | High |
| Load / Chaos | Few, scheduled | Long | Different question entirely |

Most tests live in the bottom three layers. E2E tests are valuable but expensive — use sparingly.

---

## 3. Unit Tests

| Rule | Detail |
|---|---|
| Scope | One function, class, or module in isolation |
| External dependencies | Mocked or stubbed |
| Speed | Milliseconds per test |
| Determinism | No real time, no network, no filesystem |
| What to test | Branches, edge cases, error paths — not happy-path-only |

---

## 4. Integration Tests

| Rule | Detail |
|---|---|
| Scope | Service with its real dependencies (database, cache, broker) |
| External dependencies | Real, via Testcontainers or local ephemeral services |
| Don't | Mock the database. Mocked databases pass while real ones fail (migrations, transactions, locks) |
| What to test | Persistence, queries, message production/consumption, transactional outbox behavior |

---

## 5. Contract Tests

For systems with multiple services, contract tests prevent breakage at integration boundaries without requiring full E2E runs.

| Style | How it works |
|---|---|
| Consumer-driven contracts (e.g., Pact) | Consumer defines what it expects from provider; both run tests against the shared contract; CI fails if the contract is broken on either side |
| Schema-as-contract | OpenAPI / Proto / event schema is the contract; spec-conformance tests on both sides |

**Rule:** every service consumed by others has contract tests. Without them, microservices break in production.

---

## 6. End-to-End Tests

| Rule | Detail |
|---|---|
| Scope | Full system, real services, real infrastructure (or staging) |
| Volume | Smoke tests of critical journeys only — signup, checkout, payment, key admin flows |
| Browser | Playwright preferred (modern, fast, cross-browser) |
| Don't | Cover edge cases here; that belongs in lower layers |
| Flakiness budget | Zero — flaky E2E tests get fixed or deleted, not retried |

---

## 7. Load & Performance Tests

| Rule | Detail |
|---|---|
| Target | Validate SLOs (e.g., p99 < 200ms at 10× projected peak load) |
| Tooling | k6, Locust, Gatling |
| Environment | Production-like, not the production cluster |
| Cadence | Before major launches; after significant changes |
| Output | Capacity model — how much traffic until which component breaks |

---

## 8. Chaos Testing (Advanced)

| Rule | Detail |
|---|---|
| When to start | After the system is production-stable; not before |
| Mechanism | Inject failures (latency, errors, partitions) into staging or controlled production |
| Tools | Chaos Mesh, AWS Fault Injection Simulator, Toxiproxy |
| Output | Validated resilience patterns — circuit breakers, timeouts, fallbacks actually fire |

---

## 9. Frontend Testing

| Layer | What to test |
|---|---|
| Unit | Pure logic, reducers, selectors |
| Integration | Components with mocked network (MSW) |
| E2E | Critical user journeys (Playwright) |

Don't mock framework primitives or state libraries — mock the network instead.

---

## 10. Test Data

| Rule | Detail |
|---|---|
| Per-test isolation | Each test creates its own data, cleans up after |
| Avoid shared fixtures | Inter-test coupling causes intermittent failures |
| Factories over fixtures | Generate domain objects in code, not from static files |
| Production data | Never used directly in tests; anonymize or synthesize |

---

## 11. Conventions

| Concern | Convention |
|---|---|
| Test pyramid | Most tests at unit & integration; E2E sparingly |
| Integration tests | Real dependencies via Testcontainers |
| Contract tests | Required for every published API and event |
| E2E tests | Critical journeys only; zero flakiness budget |
| Load tests | SLO-driven; scheduled cadence |
| Mocking | Mock at the network boundary, not the data layer |
| Test data | Per-test, factory-generated, never production |
| Coverage | Branch coverage on critical paths; total coverage is a directional signal only |

---

## 12. Anti-Patterns

| Anti-pattern | Why it's wrong |
|---|---|
| Mocking the database in integration tests | Mocks pass; real DBs fail differently (migrations, locks, transactions) |
| Mocking state-library hooks | Tests pass against fake plumbing; bugs live in the real plumbing |
| E2E as the primary test layer | Slow, flaky, expensive, brittle |
| Skipping contract tests | Services break in production at integration time |
| Retrying flaky tests instead of fixing them | Hides real bugs; erodes trust in the suite |
| Tests that depend on order | One reorder breaks everything; debugging is awful |
| Tests that depend on real time / current date | Flaky overnight; use injected clocks |
| Using production data in tests | Privacy violation, leaks, reproducibility nightmares |
| Coverage targets without test-quality review | 100% coverage of trivial getters; 0% coverage of business logic |
| No load testing before launch | Discovering capacity limits via the first real traffic spike |
