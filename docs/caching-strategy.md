# Caching Strategy

**Applies to:** Any system where read latency, throughput, or cost requires caching layers.

---

## 1. Goals

- Reduce read latency for hot data
- Shield databases from read-heavy workloads
- Reduce egress and compute cost
- Tolerate brief origin outages on read paths

---

## 2. Cache Tiers

Use cache **as close to the consumer as the staleness budget allows**.

| Tier | Holds | Typical TTL |
|---|---|---|
| CDN edge | Public, static, or near-static responses | Hours to days |
| API gateway | Authenticated GETs with short freshness needs | Seconds to minutes |
| Service-local (Redis or equivalent) | Hot domain data, derived results | Seconds to hours |
| In-process (LRU) | Per-instance ultra-hot data (config, JWKS) | Seconds |

A request falling through hits the origin (database).

---

## 3. Cache-Aside (Default)

| Step | Action |
|---|---|
| Read | Check cache; on miss, read from origin and populate cache |
| Write | Update origin; **invalidate** the cache entry (do not write through) |

Origin is the source of truth. Cache is a derived view. This is the safe default for almost all cases.

---

## 4. Write-Through (Special Cases)

Use only when reads must reflect writes immediately **and** the cache and origin can be kept atomically in sync. Typically appropriate for session stores where the cache is the primary store anyway.

---

## 5. Invalidation

Two strategies, combined:

| Strategy | When |
|---|---|
| TTL-based expiry | Default — bounded staleness, no coordination required |
| Event-driven invalidation | When freshness matters within seconds — consumer of a domain event invalidates relevant cache keys |

**Rule:** TTL is the safety net. Event-driven invalidation is the optimization. Never rely on event-driven alone — events can be lost.

---

## 6. Stampede Protection

When many concurrent requests miss the same hot key, they all hit the origin at once. Prevent with:

| Technique | Detail |
|---|---|
| Single-flight | First miss locks the key; concurrent misses wait for the first to populate |
| Probabilistic early refresh | Refresh slightly before TTL expiry, randomized per request |
| Stale-while-revalidate | Serve stale value; refresh in background |

---

## 7. Negative Caching

Cache "not found" results — otherwise a malicious or buggy client can hammer the origin with lookups for non-existent keys.

| Rule | Detail |
|---|---|
| Cache negatives with short TTL | Long enough to break the attack; short enough to recover when the item is created |
| Separate negative TTL from positive TTL | E.g., positive 5 min, negative 30 sec |

---

## 8. Hot Key Handling

When one key receives a disproportionate share of traffic:

| Technique | Detail |
|---|---|
| In-process cache fronting Redis | Spreads load across application instances |
| Key sharding | Append a small random suffix (`product:123:shard:0..N`) and aggregate on read |
| Pre-warm | Populate cache proactively before known traffic surges |

---

## 9. Conventions

| Concern | Convention |
|---|---|
| Default pattern | Cache-aside |
| Invalidation | TTL primary; event-driven optimization on top |
| Stampede protection | Single-flight on the hottest endpoints |
| Negative caching | Always for lookup endpoints |
| TTL hygiene | Every cached key has a TTL — no infinite caches |
| Key naming | `<service>:<entity>:<id>:<version>` — versioned to enable bulk invalidation by version bump |
| Cache misses | Treat as normal — graceful degradation, never throw |

---

## 10. Anti-Patterns

| Anti-pattern | Why it's wrong |
|---|---|
| Infinite TTLs | Stale data forever; no recovery from invalidation bugs |
| Write-through to a remote cache | Distributed transaction across two systems |
| Caching personalized data at a shared tier | Privacy leak |
| Caching errors as successful responses | Propagates failures widely |
| Cache as the only source of truth (non-session) | Cache eviction = data loss |
| Cache lookup blocking the request thread for full origin latency on miss | Single-flight, then return — never block all callers |
| Keys without version | Cannot bulk-invalidate when schema changes |
| Treating cache misses as errors | Defeats graceful degradation |
