# base
FROM node:22-alpine AS base

RUN corepack enable && corepack prepare pnpm@latest --activate

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# deps
FROM base AS dependencies

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN pnpm install --frozen-lockfile

RUN pnpm prisma generate

# dev
FROM base AS development

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package.json ./package.json
COPY --from=dependencies /app/pnpm-lock.yaml ./pnpm-lock.yaml

COPY . .

CMD ["pnpm", "start:dev"]

# build
FROM base AS build

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules

COPY . .

RUN pnpm prisma generate

RUN pnpm build

RUN pnpm prune --prod

# prod
FROM node:22-alpine AS production

RUN apk add --no-cache libc6-compat openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

WORKDIR /app

COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=build --chown=nestjs:nodejs /app/prisma ./prisma

ENV NODE_ENV=production

USER nestjs

CMD ["node", "dist/main"]
