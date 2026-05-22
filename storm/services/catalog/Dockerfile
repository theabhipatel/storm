# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /repo

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* .npmrc ./
COPY tsconfig.base.json ./
COPY packages ./packages
COPY services/catalog ./services/catalog

RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @storm/catalog exec prisma generate
RUN pnpm --filter @storm/catalog... build
RUN cp -r services/catalog/src/generated services/catalog/dist/generated

FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /repo /repo
WORKDIR /repo/services/catalog

EXPOSE 3002
USER node
CMD ["node", "dist/index.js"]
