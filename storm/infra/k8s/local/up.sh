#!/usr/bin/env bash
# Build all images into minikube and bring the whole Storm stack up, in order.
# Re-runnable (idempotent): safe to run again after a code change.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../../.." && pwd)"   # monorepo root: storm/
KEYS="$HERE/.keys"
NS=storm-local

SERVICES="identity catalog search inventory cart order payment wishlist recommendation notification media web-bff admin-bff"

# Retry a command up to 3 times. Image builds fetch pnpm/npm packages over the
# network, which is occasionally flaky on minikube's build daemon; a retry reuses
# cached layers and resumes at the failed step.
retry() {
  local desc="$1"; shift
  local n=0
  until "$@"; do
    n=$((n + 1))
    if [ "$n" -ge 3 ]; then echo "!! FAILED after $n attempts: $desc"; exit 1; fi
    echo "  ... '$desc' failed (likely transient network), retry $n/3 in 5s"; sleep 5
  done
}

echo "==> [1/8] Pointing docker at minikube's daemon"
eval "$(minikube docker-env)"

echo "==> [2/8] Building images (this takes a while the first time)"
for s in $SERVICES; do
  echo "  - storm/$s:local"
  retry "build $s" docker build -f "$ROOT/services/$s/Dockerfile" -t "storm/$s:local" "$ROOT"
done
echo "  - storm/init:local"
retry "build init" docker build -f "$ROOT/infra/local/init/Dockerfile" -t storm/init:local "$ROOT"
echo "  - storm/web:local"
retry "build web" docker build -f "$ROOT/apps/web/Dockerfile" -t storm/web:local "$ROOT"
echo "  - storm/admin:local"
retry "build admin" docker build -f "$ROOT/apps/admin/Dockerfile" \
  --build-arg VITE_ADMIN_BFF_BASE_URL=http://localhost:3100 \
  --build-arg VITE_IDENTITY_BASE_URL=http://localhost:3001 \
  --build-arg VITE_KONG_BASE_URL=http://localhost:8000 \
  -t storm/admin:local "$ROOT"
echo "  - storm/seed:local"
retry "build seed" docker build -t storm/seed:local "$ROOT/scripts/seed"

echo "==> [3/8] Namespace"
kubectl apply -f "$HERE/00-namespace.yaml"

echo "==> [4/8] JWT keypair + Secret (generated once, reused on re-runs)"
mkdir -p "$KEYS"
if [ ! -f "$KEYS/jwt.key" ]; then
  openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out "$KEYS/jwt.key"
  openssl rsa -in "$KEYS/jwt.key" -pubout -out "$KEYS/jwt.pub"
  echo "local-dev-1" > "$KEYS/jwt.kid"
fi
kubectl -n "$NS" create secret generic jwt-keys \
  --from-file=jwt.key="$KEYS/jwt.key" \
  --from-file=jwt.pub="$KEYS/jwt.pub" \
  --from-file=jwt.kid="$KEYS/jwt.kid" \
  --dry-run=client -o yaml | kubectl apply -f -

# Render Kong's config with the SAME public key, so Kong can verify the tokens
# identity signs. The public key is indented to match the YAML block scalar.
sed 's/^/                  /' "$KEYS/jwt.pub" > "$KEYS/jwt.pub.indent"
sed -e "/__JWT_PUBLIC_KEY__/{
r $KEYS/jwt.pub.indent
d
}" "$HERE/kong.k8s.yml" > "$KEYS/kong.rendered.yml"
kubectl -n "$NS" create configmap kong-config \
  --from-file=kong.yml="$KEYS/kong.rendered.yml" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "==> [5/8] Config + data stores"
kubectl apply -f "$HERE/01-config.yaml"
for f in 10-postgres 11-redis 12-redpanda 13-opensearch 14-mongodb 15-minio 16-mailhog; do
  kubectl apply -f "$HERE/$f.yaml"
done
echo "    waiting for data stores (up to 5 min)..."
kubectl -n "$NS" wait --for=condition=available --timeout=300s \
  deploy/postgres deploy/redis deploy/redpanda deploy/opensearch deploy/mongodb deploy/minio deploy/mailhog

echo "==> [6/8] DB migrations + admin bootstrap (init Job)"
kubectl -n "$NS" delete job init --ignore-not-found
kubectl apply -f "$HERE/20-init-job.yaml"
kubectl -n "$NS" wait --for=condition=complete --timeout=300s job/init

echo "==> [7/8] Services + apps + Kong"
for f in 30-identity 31-catalog 32-search 33-inventory 34-cart 35-order 36-payment \
         37-wishlist 38-recommendation 39-notification 40-media 41-web-bff 42-admin-bff \
         50-web 51-admin 60-kong; do
  kubectl apply -f "$HERE/$f.yaml"
done
echo "    waiting for services (up to 5 min)..."
kubectl -n "$NS" wait --for=condition=available --timeout=300s deploy --all || true

echo "==> [8/8] Seeding demo data (optional, runs in background)"
kubectl -n "$NS" delete job seed --ignore-not-found
kubectl apply -f "$HERE/70-seed-job.yaml"

cat <<'EOF'

================================================================
 Storm is up on minikube (namespace: storm-local)
================================================================
 Open the apps by starting port-forwards:   ./pf.sh

   Storefront : http://localhost:3200
   Admin      : http://localhost:3300   (admin@gmail.com / 1234)
   API (Kong) : http://localhost:8000
   Mailhog    : http://localhost:8025

 Check status:   kubectl -n storm-local get pods
 Tear it down:   ./down.sh
================================================================
EOF
