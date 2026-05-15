# syntax=docker/dockerfile:1.7

# ---- builder ----
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /repo

# Copy workspace manifests for cached install
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* .npmrc ./
COPY tsconfig.base.json ./
COPY packages ./packages
COPY services/identity ./services/identity

RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @storm/identity... build

# ---- runner ----
FROM node:20-alpine AS runner
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /repo /repo
WORKDIR /repo/services/identity

EXPOSE 3001
USER node
CMD ["node", "dist/index.js"]
