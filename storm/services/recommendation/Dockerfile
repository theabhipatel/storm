# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /repo

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* .npmrc ./
COPY tsconfig.base.json ./
COPY packages ./packages
COPY services/recommendation ./services/recommendation

RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @storm/recommendation... build

FROM node:20-alpine AS runner
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /repo /repo
WORKDIR /repo/services/recommendation

EXPOSE 3009
USER node
CMD ["node", "dist/index.js"]
