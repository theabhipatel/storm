# syntax=docker/dockerfile:1.7
# One-shot init container: generates JWT keys, runs Prisma migrations for every
# service, seeds reference data, and bootstraps a default admin user.
FROM node:20-alpine
RUN apk add --no-cache openssl bash
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /repo

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* .npmrc* ./
COPY tsconfig.base.json ./
COPY packages ./packages
COPY services ./services
COPY scripts ./scripts

RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter './packages/*' build \
 && for s in identity catalog inventory order payment wishlist media; do \
      pnpm --filter @storm/$s exec prisma generate || true; \
    done

COPY infra/local/init/run-init.sh /usr/local/bin/run-init.sh
RUN chmod +x /usr/local/bin/run-init.sh

CMD ["/usr/local/bin/run-init.sh"]
