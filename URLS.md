# Storm — Local URLs & Credentials

## Apps

| App | URL |
|---|---|
| Web (customer) | http://localhost:3200 |
| Admin | http://localhost:3300 |
| Kong gateway | http://localhost:8000 |

## BFFs & Services

| Service | URL |
|---|---|
| web-bff | http://localhost:3000 |
| admin-bff | http://localhost:3100 |
| identity | http://localhost:3001 |
| catalog | http://localhost:3002 |
| search | http://localhost:3003 |
| inventory | http://localhost:3004 |
| cart | http://localhost:3005 |
| order | http://localhost:3006 |
| payment | http://localhost:3007 |
| wishlist | http://localhost:3008 |
| recommendation | http://localhost:3009 |
| notification | http://localhost:3010 |
| media | http://localhost:3011 |

## Dev Tools (UI)

| Tool | URL | User | Password |
|---|---|---|---|
| pgAdmin | http://localhost:5050 | dev@storm.dev | pgadmin |
| RedisInsight | http://localhost:5540 | — | — |
| Redpanda Console | http://localhost:18080 | — | — |
| MinIO Console | http://localhost:9001 | minio | minio12345 |
| MailHog | http://localhost:8025 | — | — |
| Kong Admin | http://localhost:8001 | — | — |

## Infra (connection)

| Service | Host:Port | User | Password |
|---|---|---|---|
| Postgres | localhost:5432 | postgres | postgres |
| Redis | localhost:6379 | — | — |
| Redpanda (Kafka) | localhost:19092 | — | — |
| OpenSearch | http://localhost:9200 | — | — |
| MongoDB | localhost:27018 | root | root |
| MinIO (S3) | http://localhost:9000 | minio | minio12345 |
| MailHog (SMTP) | localhost:1025 | — | — |

## Postgres per-service DBs

| DB | User | Password |
|---|---|---|
| identity | identity | identity_pw |
| catalog | catalog | catalog_pw |
| inventory | inventory | inventory_pw |
| order | order | order_pw |
| payment | payment | payment_pw |
| wishlist | wishlist | wishlist_pw |
| media | media | media_pw |

## App Logins

| Role | Email | Password |
|---|---|---|
| Admin | admin@gmail.com | 1234 |
| Seed user | abhi@gmail.com | 1234 |
