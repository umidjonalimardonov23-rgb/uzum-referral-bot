FROM node:24-alpine AS builder
RUN npm install -g pnpm@10.26.1
WORKDIR /app

# Copy workspace config files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json tsconfig.json ./

# Copy all packages
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/
COPY artifacts/tg-miniapp/ ./artifacts/tg-miniapp/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Build libs (api-spec, api-zod, api-client-react)
RUN pnpm run typecheck:libs

# Build Mini App (React frontend → static files)
RUN BASE_PATH="/" PORT="3000" pnpm --filter @workspace/tg-miniapp run build

# Build API server
RUN pnpm --filter @workspace/api-server run build

# ---- Runtime stage (smaller image) ----
FROM node:24-alpine AS runtime
RUN npm install -g pnpm@10.26.1
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY lib/ ./lib/
COPY artifacts/api-server/package.json ./artifacts/api-server/package.json

# Install only production dependencies
RUN pnpm install --frozen-lockfile --filter @workspace/api-server --prod

# Copy built artifacts from builder
COPY --from=builder /app/artifacts/api-server/dist/ ./artifacts/api-server/dist/
COPY --from=builder /app/artifacts/tg-miniapp/dist/ ./artifacts/tg-miniapp/dist/

EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
