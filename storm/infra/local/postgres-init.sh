#!/bin/sh
# Postgres init: creates one database + least-privilege role per Postgres-backed service.
# Mounted into the postgres container under /docker-entrypoint-initdb.d/.
set -eu

SERVICES="identity|identity|identity_pw catalog|catalog|catalog_pw inventory|inventory|inventory_pw order|order|order_pw payment|payment|payment_pw wishlist|wishlist|wishlist_pw media|media|media_pw"

for entry in $SERVICES; do
  DB=$(echo "$entry" | cut -d'|' -f1)
  USER=$(echo "$entry" | cut -d'|' -f2)
  PASS=$(echo "$entry" | cut -d'|' -f3)

  echo "==> Creating database '$DB' with user '$USER'"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
    CREATE USER "$USER" WITH PASSWORD '$PASS' CREATEDB;
    CREATE DATABASE "$DB" OWNER "$USER";
    REVOKE ALL ON DATABASE "$DB" FROM PUBLIC;
    GRANT CONNECT, TEMPORARY ON DATABASE "$DB" TO "$USER";
EOSQL

  # Grants on the public schema must be issued inside the target DB
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$DB" <<-EOSQL
    GRANT USAGE, CREATE ON SCHEMA public TO "$USER";
    ALTER DEFAULT PRIVILEGES IN SCHEMA public
      GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "$USER";
    ALTER DEFAULT PRIVILEGES IN SCHEMA public
      GRANT USAGE, SELECT ON SEQUENCES TO "$USER";
EOSQL
done

echo "==> Postgres init complete."
