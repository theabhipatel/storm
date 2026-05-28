#!/usr/bin/env bash
# Port-forward the browser-facing services to the same localhost ports the
# frontend images expect. Keep this running; Ctrl-C stops all forwards.
set -euo pipefail
NS=storm-local

FORWARDS=(
  "svc/web       3200:3200"
  "svc/admin     3300:80"
  "svc/kong      8000:8000"
  "svc/web-bff   3000:3000"
  "svc/admin-bff 3100:3100"
  "svc/identity  3001:3001"
  "svc/minio     9000:9000"
  "svc/mailhog   8025:8025"
)

pids=()
for f in "${FORWARDS[@]}"; do
  kubectl -n "$NS" port-forward $f >/dev/null 2>&1 &
  pids+=($!)
done
trap 'kill "${pids[@]}" 2>/dev/null || true' EXIT

cat <<'EOF'
Port-forwards running (Ctrl-C to stop):
  Storefront : http://localhost:3200
  Admin      : http://localhost:3300   (admin@gmail.com / 1234)
  API (Kong) : http://localhost:8000
  Mailhog    : http://localhost:8025
EOF
wait
