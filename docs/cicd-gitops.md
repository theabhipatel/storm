# CI/CD & GitOps Architecture

**Applies to:** Any system deploying to Kubernetes or similar orchestrator, where reproducibility, auditability, and rollback speed matter.

---

## 1. Goals

- Every change reaches production through the same pipeline
- Deployments are auditable — Git is the source of truth for what's running
- Rollback is fast and safe
- No long-lived credentials in CI

---

## 2. Core Principles

| Principle | Detail |
|---|---|
| Immutable artifacts | One built container image is promoted unchanged from dev to prod |
| Configuration is data | Application config and infrastructure are versioned in Git, not baked into images |
| Declarative state | Git holds the desired state; an operator reconciles cluster state to match |
| Separation of concerns | CI builds and tests; CD deploys |

---

## 3. Branching Strategy — Trunk-Based

| Rule | Detail |
|---|---|
| Single long-lived branch (`main`) | Always deployable |
| Short-lived feature branches | Merged within hours to days, not weeks |
| Pull requests required | At least one reviewer + green CI |
| Release branches | Only for hotfixes against a deployed version, not normal development |
| Feature flags | Hide incomplete work in `main` behind flags, not in long-lived branches |

---

## 4. Environments

| Environment | Purpose | Promotion |
|---|---|---|
| Development | Continuous integration target; ephemeral preview environments per PR | Automatic on merge to `main` |
| Staging | Production-like; integration testing, load testing, manual QA | Automatic from `main` |
| Production | End-user-facing | Manual approval (or auto with strong tests) |

The same artifact is promoted between environments. Configuration differs; code does not.

---

## 5. CI Pipeline (per service)

| Stage | Action |
|---|---|
| Lint & format check | Reject style violations early |
| Unit tests | Fast, isolated |
| Build container image | Tagged with commit SHA |
| Vulnerability scan | Block on critical CVEs |
| Integration tests | Run against real dependencies (testcontainers) |
| Contract tests | Verify API/event contracts |
| Push image to registry | Signed |
| Update GitOps repo | Bump image tag in the environment manifest |

Path-filtered: only rebuild services whose code changed.

---

## 6. CD via GitOps

| Step | Action |
|---|---|
| 1 | CI commits an image tag bump to the GitOps repo (separate from source repo) |
| 2 | GitOps operator (ArgoCD, Flux) detects the change |
| 3 | Operator reconciles cluster state to match the manifest |
| 4 | Health checks pass → deployment marked successful |
| 5 | Health checks fail → automatic rollback or alert |

The cluster is always in the state Git says it should be. Drift is detected and corrected automatically.

---

## 7. Deployment Strategies

| Strategy | Use when |
|---|---|
| Rolling update | Default for most services. Pods replaced incrementally. |
| Blue-green | Zero-downtime migrations; need instant rollback. Two parallel environments, switch traffic at once. |
| Canary | High-risk changes. Send a percentage of traffic to the new version; expand on success. |

Start with rolling. Adopt canary for critical services as you mature.

---

## 8. Rollback

| Rule | Detail |
|---|---|
| One-step rollback | Revert the GitOps commit; operator redeploys the previous image |
| Rollback faster than fix-forward | When in doubt, roll back first, investigate after |
| Database migrations | Always backward-compatible; rollback never requires a schema change |
| Feature flags for risky changes | Disable instantly without redeploy |

---

## 9. Secrets in Pipelines

| Rule | Detail |
|---|---|
| OIDC token exchange | CI assumes cloud IAM roles via short-lived tokens; no long-lived keys in CI |
| Secrets manager fetch at deploy time | Runtime secrets injected via External Secrets Operator or sidecar |
| Build-time secrets | Avoided entirely — if a secret is needed at build, refactor |

---

## 10. Conventions

| Concern | Convention |
|---|---|
| Branching | Trunk-based, short-lived feature branches |
| Environments | dev → staging → prod, same artifact promoted |
| Image tagging | Commit SHA; signed |
| Image immutability | Never overwrite tags; never reuse |
| GitOps tool | ArgoCD or Flux |
| Deployment default | Rolling update; canary for high-risk |
| Rollback | Git revert; one-step |
| Migrations | Backward-compatible always |
| Pipeline credentials | OIDC, no static keys |
| Feature flags | Required for risky or partial work |

---

## 11. Anti-Patterns

| Anti-pattern | Why it's wrong |
|---|---|
| Long-lived feature branches | Painful merges, divergence, integration risk |
| Mutable image tags (`:latest`, `:prod`) | Cannot reproduce a past deployment |
| Rebuilding images per environment | Defeats artifact promotion; introduces drift |
| `kubectl apply` from a developer's laptop | No audit trail; cluster drifts from Git |
| Long-lived cloud keys in CI | One leak = total compromise |
| Schema migrations that break the previous app version | Rollback becomes impossible |
| Manual production deploys | Inconsistent, unauditable |
| Bypassing CI to ship faster | One incident wipes out the time saved many times over |
| No rollback rehearsal | Discovering rollback is broken during an incident |
