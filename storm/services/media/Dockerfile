# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /repo

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* .npmrc ./
COPY tsconfig.base.json ./
COPY packages ./packages
COPY services/media ./services/media

RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @storm/media exec prisma generate
RUN pnpm --filter @storm/media... build
RUN cp -r services/media/src/generated services/media/dist/generated

FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /repo /repo
WORKDIR /repo/services/media

EXPOSE 3011
USER node
CMD ["node", "dist/index.js"]
