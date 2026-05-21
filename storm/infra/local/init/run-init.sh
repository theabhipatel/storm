#!/usr/bin/env bash
set -euo pipefail

KEYS_DIR=/keys
mkdir -p "$KEYS_DIR"

# 1) JWT keys (idempotent — only generated once, persisted on a named volume)
if [ ! -f "$KEYS_DIR/jwt.key" ]; then
  echo "==> Generating JWT keys"
  openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out "$KEYS_DIR/jwt.key"
  openssl rsa     -in "$KEYS_DIR/jwt.key" -pubout -out "$KEYS_DIR/jwt.pub"
  echo "local-dev-1" > "$KEYS_DIR/jwt.kid"
fi

export JWT_PRIVATE_KEY="$(cat "$KEYS_DIR/jwt.key")"
export JWT_PUBLIC_KEY="$(cat "$KEYS_DIR/jwt.pub")"
export JWT_KID="$(cat "$KEYS_DIR/jwt.kid")"

# 2) Prisma migrations per Postgres-backed service
PG_SERVICES=(identity catalog inventory order payment wishlist media)
for s in "${PG_SERVICES[@]}"; do
  echo "==> Migrating $s"
  url_var="DB_URL_${s^^}"
  export DATABASE_URL="${!url_var}"
  pnpm --filter "@storm/$s" exec prisma migrate deploy
done

# 3) Optional seed
if [ -f scripts/seed/index.ts ]; then
  echo "==> Seeding"
  pnpm seed:all || echo "(seed failed — non-fatal)"
fi

# 4) Bootstrap admin user (idempotent)
export DATABASE_URL="$DB_URL_IDENTITY"
echo "==> Bootstrapping admin user"
pnpm --filter @storm/identity bootstrap-admin || echo "(admin bootstrap skipped — likely already exists)"

echo "==> Init complete."
