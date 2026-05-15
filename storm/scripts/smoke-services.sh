#!/usr/bin/env bash
# Boots each service one at a time, hits /health and /ready, then kills it.
# Run from inside `storm/` after `pnpm turbo build` and `docker compose up -d`.
set -uo pipefail

# name|port|database_url-or-empty
SERVICES=(
  "identity|3001|postgresql://identity:identity_pw@localhost:5432/identity?schema=public"
  "catalog|3002|postgresql://catalog:catalog_pw@localhost:5432/catalog?schema=public"
  "search|3003|"
  "inventory|3004|postgresql://inventory:inventory_pw@localhost:5432/inventory?schema=public"
  "cart|3005|"
  "order|3006|postgresql://order:order_pw@localhost:5432/order?schema=public"
  "payment|3007|postgresql://payment:payment_pw@localhost:5432/payment?schema=public"
  "wishlist|3008|postgresql://wishlist:wishlist_pw@localhost:5432/wishlist?schema=public"
  "recommendation|3009|"
  "notification|3010|"
  "media|3011|postgresql://media:media_pw@localhost:5432/media?schema=public"
  "web-bff|3000|"
  "admin-bff|3100|"
)

PASS=0
FAIL=0
FAILED_NAMES=()

for entry in "${SERVICES[@]}"; do
  IFS='|' read -r NAME PORT DB_URL <<<"$entry"
  printf "  → %-16s port %s  " "$NAME" "$PORT"

  pushd "services/$NAME" >/dev/null
  PORT="$PORT" \
  NODE_ENV=development \
  LOG_LEVEL=error \
  DATABASE_URL="$DB_URL" \
  REDIS_URL="redis://localhost:6379/0" \
    node dist/index.js >"/tmp/smoke-$NAME.log" 2>&1 &
  PID=$!
  popd >/dev/null

  # wait until listening or 5s timeout
  ok=0
  for _ in $(seq 1 50); do
    if curl -fsS "http://localhost:$PORT/health" -o /tmp/h.json 2>/dev/null && \
       curl -fsS "http://localhost:$PORT/ready"  -o /tmp/r.json 2>/dev/null; then
      ok=1
      break
    fi
    sleep 0.1
  done

  kill "$PID" 2>/dev/null
  wait "$PID" 2>/dev/null

  if [[ $ok -eq 1 ]]; then
    echo "OK"
    PASS=$((PASS+1))
  else
    echo "FAIL — see /tmp/smoke-$NAME.log"
    FAIL=$((FAIL+1))
    FAILED_NAMES+=("$NAME")
  fi
done

echo
echo "Passed: $PASS / $((PASS+FAIL))"
if [[ $FAIL -gt 0 ]]; then
  echo "Failed: ${FAILED_NAMES[*]}"
  exit 1
fi
