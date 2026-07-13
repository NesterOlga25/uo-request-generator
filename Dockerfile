ARG NODE_VERSION=26.3.0
ARG PNPM_VERSION=11.12.0

FROM node:${NODE_VERSION}-alpine AS base
ARG PNPM_VERSION
RUN npm install --global "pnpm@${PNPM_VERSION}"
WORKDIR /app

FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/core/package.json packages/core/package.json
COPY packages/llm/package.json packages/llm/package.json
RUN pnpm install --frozen-lockfile

FROM dependencies AS builder
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

FROM node:${NODE_VERSION}-alpine AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
WORKDIR /app/apps/web

COPY --from=builder --chown=node:node /app/apps/web/.next/standalone /app
COPY --from=builder --chown=node:node /app/apps/web/.next/static ./.next/static

USER node
EXPOSE 3000

CMD ["node", "server.js"]
