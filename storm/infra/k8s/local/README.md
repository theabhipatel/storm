# Storm on minikube (local)

Run the **entire** Storm stack on a local Kubernetes cluster (minikube) instead
of docker-compose. These manifests are self-contained and **do not touch** the
production GitOps manifests under `infra/argocd/`.

## What gets deployed

| Group | Components |
|---|---|
| Data stores | postgres, redis, redpanda (Kafka), opensearch, mongodb, minio, mailhog |
| Jobs | `init` (DB migrations + admin user), `minio-init` (bucket), `seed` (demo data) |
| Services | identity, catalog, search, inventory, cart, order, payment, wishlist, recommendation, notification, media, web-bff, admin-bff |
| Apps | web (storefront), admin |
| Gateway | kong |

Everything lives in the `storm-local` namespace.

## Prerequisites

- minikube already started with enough resources, e.g.:
  ```bash
  minikube start --cpus=6 --memory=12288 --disk-size=40g --driver=docker
  ```
- `kubectl`, `docker`, and `openssl` on your PATH.

## Bring it up (one command)

```bash
cd infra/k8s/local
./up.sh          # builds all images into minikube, then deploys in order
./pf.sh          # in a second terminal: port-forward the apps to localhost
```

Then open:

| URL | What |
|---|---|
| http://localhost:3200 | Customer storefront |
| http://localhost:3300 | Admin panel (`admin@gmail.com` / `1234`) |
| http://localhost:8000 | Kong API gateway |
| http://localhost:8025 | Mailhog (captured emails) |

First run is slow — it builds ~16 images. Later runs reuse the Docker cache.

## How it works (the 3 things that differ from compose)

1. **Images** — Kubernetes only *runs* images, it doesn't build them. `up.sh`
   runs `eval $(minikube docker-env)` and builds everything as `storm/<name>:local`
   straight into minikube's Docker, so no registry is needed.
2. **Service discovery** — each component is a k8s *Service* whose name matches
   the old compose name (`catalog`, `redis`, ...), so all the
   `http://catalog:3002`-style URLs keep working unchanged.
3. **Browser access** — the web/admin images bake `localhost:<port>` API URLs at
   build time, so `pf.sh` forwards those exact ports (3000/3100/3001/8000/9000).

## JWT keys

`up.sh` generates one RSA keypair into `.keys/` (gitignored), stores it in the
`jwt-keys` Secret (mounted into identity), and injects the **matching public key**
into Kong's config. This guarantees Kong can verify the tokens identity signs —
unlike compose, nothing is hard-coded.

## Common commands

```bash
kubectl -n storm-local get pods            # status
kubectl -n storm-local logs deploy/order   # logs for a service
kubectl -n storm-local rollout restart deploy/catalog

# After changing a service's code, rebuild just it and restart:
eval $(minikube docker-env)
docker build -f services/catalog/Dockerfile -t storm/catalog:local ../../..
kubectl -n storm-local rollout restart deploy/catalog

# Re-run a Job:
kubectl -n storm-local delete job seed --ignore-not-found && kubectl apply -f 70-seed-job.yaml
```

## Tear down

```bash
./down.sh        # deletes the namespace + all persisted data
```

The minikube cluster keeps running. To stop/destroy the cluster itself use
`minikube stop` / `minikube delete`.

## Troubleshooting

- **A service pod is `CrashLoopBackOff` early on** — usually it started before its
  DB/Kafka was ready. k8s retries automatically; give it a minute.
- **opensearch won't start** — bump the map count:
  `minikube ssh -- 'sudo sysctl -w vm.max_map_count=262144'`.
- **Out of memory / pods `Pending`** — give minikube more RAM (`minikube delete`
  then start with a higher `--memory`).
- **Checkout fails** — `payment` ships with placeholder Razorpay keys; set real
  test keys in `36-payment.yaml` and `kubectl apply` it.
