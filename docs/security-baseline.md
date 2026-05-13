# Security Baseline

**Applies to:** Any service, frontend, or piece of infrastructure in the system. These are the minimum defaults; specific subsystems may require more.

---

## 1. Goals

- Defense in depth — multiple layers of protection
- Least privilege — every component has only the access it needs
- Audit-ready — every security-relevant action is recorded
- Vulnerability-aware — known issues detected and patched routinely

---

## 2. Transport

| Rule | Detail |
|---|---|
| TLS everywhere | Including internal service-to-service traffic |
| Minimum TLS version | 1.2; prefer 1.3 |
| HSTS | Enabled on all public endpoints with preload |
| Mutual TLS | Between services in production |
| Certificate management | Automated rotation; never long-lived |

---

## 3. Secrets Management

| Rule | Detail |
|---|---|
| Never in source control | Not in `.env` committed to repo, not in container images |
| Central secrets store | AWS Secrets Manager, HashiCorp Vault, or equivalent |
| Synced to runtime | External Secrets Operator (K8s) or sidecar injection |
| Rotation | Automated where the secret supports it (DB credentials, signing keys) |
| Access | IAM-controlled, audited, least-privilege |
| CI/CD credentials | OIDC token exchange — no long-lived keys in CI |

---

## 4. Authentication & Authorization

See [authentication.md](./authentication.md) for the user-facing auth model. Internal:

| Concern | Rule |
|---|---|
| Service-to-service auth | mTLS or short-lived signed tokens |
| User identity propagation | Verified at gateway, passed downstream as signed headers — services never re-verify |
| Authorization decisions | Centralized policy (gateway plugin, sidecar, or policy service) — not scattered across services |
| Admin access | Separate identity, MFA-enforced, audited |

---

## 5. Network Segmentation

| Rule | Detail |
|---|---|
| Private subnets for services | Services not directly reachable from internet |
| Public ingress only through edge | CDN → WAF → load balancer → API gateway |
| Service-mesh policies | Default-deny; explicit allowlists per service |
| Database access | From owning service only; enforced at network level |
| Egress filtering | Outbound calls to external services go through known IPs/proxies |

---

## 6. Input Validation

| Rule | Detail |
|---|---|
| Validate at every trust boundary | Edge, gateway, service |
| Schema-driven validation | OpenAPI / Proto — reject anything not in the schema |
| Reject, don't sanitize | Sanitization is brittle; rejection is safe |
| Output encoding | Context-aware (HTML, URL, JSON, SQL) at the point of use |
| SQL injection | Parameterized queries only; never string concatenation |
| Command injection | Avoid shelling out; if necessary, argument arrays, never strings |

---

## 7. Frontend Security Headers

| Header | Purpose |
|---|---|
| `Strict-Transport-Security` | Force HTTPS |
| `Content-Security-Policy` | Restrict executable scripts (primary XSS mitigation) |
| `X-Content-Type-Options: nosniff` | Prevent MIME confusion |
| `X-Frame-Options: DENY` | Prevent clickjacking |
| `Referrer-Policy: strict-origin-when-cross-origin` | Limit referrer leakage |
| `Permissions-Policy` | Disable unused browser features |

Detailed in [authentication.md](./authentication.md).

---

## 8. Dependency & Supply Chain Hygiene

| Rule | Detail |
|---|---|
| Lockfile committed | Reproducible builds |
| Automated dependency updates | Dependabot / Renovate with auto-merge for non-breaking updates |
| Vulnerability scanning | Every PR scanned (Snyk, Trivy, GitHub Advanced Security) |
| Container scanning | Base image + layers scanned in CI; rebuild on CVE in base image |
| SBOM | Generated for every release |
| Signed artifacts | Container images signed (Cosign); deployment verifies signature |

---

## 9. Audit Logging

| Rule | Detail |
|---|---|
| Append-only | Audit logs are write-once |
| Required fields | `timestamp`, `actor`, `subject`, `action`, `outcome`, correlation ID |
| Stored separately | Different bucket / retention from operational logs |
| Retention | Per regulatory requirement (typically 1–7 years) |
| Logged actions | Authentication, authorization changes, admin actions, secret access, data exports |

---

## 10. Vulnerability Response

| Severity | Response time |
|---|---|
| Critical (active exploit) | Patch within 24 hours |
| High | Patch within 7 days |
| Medium | Patch within 30 days |
| Low | Next scheduled release |

---

## 11. Conventions

| Concern | Convention |
|---|---|
| Transport | TLS 1.2+ everywhere, mTLS internally |
| Secrets | Central store + runtime sync; never in repo |
| Service-to-service auth | mTLS or short-lived signed tokens |
| Authorization | Centralized policy |
| Network | Private subnets, default-deny mesh policies |
| Input | Schema-validated, rejected on mismatch |
| Dependencies | Scanned in CI; auto-updated; SBOM per release |
| Audit | Append-only, separate retention, regulator-aligned |
| Container images | Signed; signatures verified at deploy |

---

## 12. Anti-Patterns

| Anti-pattern | Why it's wrong |
|---|---|
| Secrets baked into container images | Anyone with image access has the secrets |
| Long-lived cloud keys in CI | One leak = total compromise; OIDC eliminates this |
| Sanitizing input instead of rejecting | Sanitizers have bypasses; schemas don't |
| String-concatenated SQL or shell commands | Injection vector |
| Re-verifying user JWT in every service | Inconsistent enforcement; centralize at gateway |
| Permissive CORS (`*`) on credentialed endpoints | Cross-site data theft |
| Disabling TLS for "internal" traffic | Internal is not safe; mesh boundary can be breached |
| Self-signed certs without trust store management | Outages on rotation; bypassed in code (`InsecureSkipVerify`) |
| Logging tokens, passwords, OTPs | Log files become credential dumps |
| One IAM role with broad permissions used by everything | Lateral movement on compromise |
