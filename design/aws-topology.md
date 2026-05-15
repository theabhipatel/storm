# AWS Infrastructure Topology

**Scope:** Storm Stage 1 AWS layout. Single region (`ap-south-1`, Mumbai). Multi-AZ. Provisioned via Terraform.

---

## 1. Region & AZs

| Concern | Choice |
|---|---|
| Region | `ap-south-1` (Mumbai) — India-only userbase |
| AZs | Three AZs (`ap-south-1a/b/c`) — all stateful services span all three |
| Multi-region | Deferred to Stage 3 |

---

## 2. VPC Layout

| Subnet tier | Purpose | CIDR per AZ |
|---|---|---|
| Public | ALB, NAT gateways | `/24` |
| Private app | EKS worker nodes, services | `/22` |
| Private data | RDS, ElastiCache, MSK, OpenSearch | `/24` |

| Component | Setup |
|---|---|
| Internet Gateway | One; attached to VPC |
| NAT Gateways | One per AZ (HA); private subnets route through |
| VPC Endpoints | S3, ECR, Secrets Manager, CloudWatch — keep traffic on AWS backbone |

---

## 3. Compute — EKS

| Node group | Purpose | Initial size | Instance type |
|---|---|---|---|
| `system` | CoreDNS, kube-proxy, cluster-autoscaler, Kong, ArgoCD, observability stack | 2 × on-demand | `t3.medium` |
| `general` | All application services | 3 × on-demand (HA across AZs) | `m6i.large` |
| `spot` | Best-effort batch workloads (thumbnail workers, reconciliation jobs) | 0–10 spot | `m6i.large` mixed |

Cluster autoscaler scales nodes based on pending pods. HPAs scale pods on CPU + custom metrics.

---

## 4. Data Stores

### 4.1 RDS (Postgres)

One Postgres cluster per critical service to maintain isolation:

| Cluster | Service | Class (initial) | Multi-AZ |
|---|---|---|---|
| `storm-identity` | identity | `db.r6g.large` | Yes |
| `storm-catalog` | catalog | `db.r6g.large` | Yes |
| `storm-inventory` | inventory | `db.r6g.xlarge` | Yes |
| `storm-order` | order, payment, wishlist (small DBs co-located) | `db.r6g.large` | Yes |
| `storm-media` | media | `db.r6g.medium` | Yes |

| Concern | Setting |
|---|---|
| Engine | Postgres 16 |
| Backup | Automated, 7-day retention |
| PITR | Enabled |
| Read replicas | Added per cluster when read load demands |

### 4.2 MongoDB (Atlas on AWS or DocumentDB)

| Cluster | Service | Notes |
|---|---|---|
| `storm-notif` | notification logs | M10 / equivalent — write-heavy log workload |

### 4.3 ElastiCache (Redis)

| Cluster | Use | Setup |
|---|---|---|
| `storm-cache` | Sessions, tokens, cart, recs cache | Cluster mode enabled, 3 shards × 2 replicas, `cache.r6g.large` |

### 4.4 OpenSearch (Managed)

| Cluster | Use | Setup |
|---|---|---|
| `storm-search` | Product search | 3 data nodes (`r6g.large.search`), 3 master nodes, Multi-AZ |

### 4.5 MSK (Kafka)

| Cluster | Use | Setup |
|---|---|---|
| `storm-events` | All Kafka topics | 3 brokers (`kafka.m7g.large`), Multi-AZ, EBS 500GB per broker |

### 4.6 S3

| Bucket | Use | Access |
|---|---|---|
| `storm-media-prod` | Product images, thumbnails | Private; CloudFront via OAC |
| `storm-backups-prod` | DB snapshots, infra state | Private; KMS-encrypted |
| `storm-logs-prod` | Archived logs | Private; Glacier after 30 days |

---

## 5. Edge & Ingress

```
Internet
   │
CloudFront (CDN + DDoS via Shield)
   │
AWS WAF (rules: rate limit, common attacks, geo)
   │
ALB (TLS 1.3 termination, ACM cert)
   │
Kong Gateway (on EKS) — auth, rate limit, routing
   │
Application services (EKS pods)
```

| Component | Notes |
|---|---|
| Route53 | DNS, latency-routing-ready for Stage 3 |
| ACM | TLS certificates for ALB |
| CloudFront | Caches static assets and ISR responses |
| WAF | Managed rule groups + custom rate limits |

---

## 6. Security

| Concern | Setting |
|---|---|
| Security groups | Default deny; least-privilege per service |
| IAM | One role per service; IRSA (IAM Roles for Service Accounts) — no shared keys |
| Secrets | AWS Secrets Manager + External Secrets Operator |
| Encryption at rest | KMS on RDS, EBS, S3, OpenSearch, MSK |
| Encryption in transit | TLS everywhere; mTLS inside mesh |
| VPC Flow Logs | Enabled to S3 |
| GuardDuty | Enabled |
| Config | Enabled with compliance rules |

---

## 7. Observability Plumbing

| Tool | Deployment |
|---|---|
| Prometheus + Grafana | EKS `system` node group |
| Loki | EKS, with S3 chunk storage |
| Tempo | EKS, with S3 traces storage |
| OpenTelemetry Collector | DaemonSet on every node |
| Sentry | Hosted (frontend errors only) |

---

## 8. Disaster Recovery

| Concern | Target | Method |
|---|---|---|
| RPO | ≤ 15 min | Automated RDS backups + PITR |
| RTO | ≤ 1 hour | Documented restore runbooks; rehearsed quarterly |
| S3 cross-region replication | Enabled for `storm-backups-prod` only |
| State recovery | Terraform state in S3 with versioning + DynamoDB lock |

---

## 9. Capacity Model (Stage 1 Launch)

| Layer | Initial | Scales to |
|---|---|---|
| EKS general nodes | 3 | 30+ via HPA + cluster-autoscaler |
| RDS | r6g.large | r6g.4xlarge before sharding |
| Redis | 3 shards × 2 replicas | 6+ shards as cart volume grows |
| MSK | 3 brokers | 9+ brokers; add partitions before adding brokers |
| OpenSearch | 3 data nodes | Scale up node size first, then out |

---

## 10. Stage 3 Triggers

| Trigger | Action |
|---|---|
| Latency outside India users > 500 ms | Add CloudFront PoPs; consider edge compute |
| Single-region cost > expansion ROI | Plan multi-region active-active |
| RDS approaching 4xlarge | Plan sharding strategy for hot services |
| OpenSearch cost > $20k/month | Re-evaluate self-hosted ES on EC2 |
