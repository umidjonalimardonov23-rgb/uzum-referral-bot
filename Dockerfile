FROM node:24-slim AS builder
  RUN npm install -g pnpm@10.26.1
  WORKDIR /app

  COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json tsconfig.json ./
  COPY lib/ ./lib/
  COPY artifacts/api-server/ ./artifacts/api-server/
  COPY artifacts/tg-miniapp/ ./artifacts/tg-miniapp/

  RUN pnpm install --frozen-lockfile

  RUN BASE_PATH="/" PORT="3000" pnpm --filter @workspace/tg-miniapp run build

  RUN pnpm --filter @workspace/api-server run build

  # Verify build output
  RUN ls -la /app/artifacts/api-server/dist/
  RUN ls -la /app/artifacts/tg-miniapp/dist/public/

  # Production image
  FROM node:24-slim
  WORKDIR /app

  COPY --from=builder /app/artifacts/api-server/dist/ ./artifacts/api-server/dist/
  COPY --from=builder /app/artifacts/tg-miniapp/dist/public/ ./artifacts/tg-miniapp/dist/public/

  ENV NODE_ENV=production
  ENV PORT=8080
  EXPOSE 8080

  CMD ["node", "--enable-source-maps", "/app/artifacts/api-server/dist/index.mjs"]
  