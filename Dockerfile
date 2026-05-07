FROM node:24-slim
  WORKDIR /app

  # Copy only what we need
  COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json tsconfig.json ./
  COPY lib/ ./lib/
  COPY artifacts/api-server/ ./artifacts/api-server/
  COPY artifacts/tg-miniapp/ ./artifacts/tg-miniapp/

  RUN npm install -g pnpm@10.26.1
  RUN pnpm install --frozen-lockfile

  # Build frontend (static files)
  RUN BASE_PATH="/" PORT="3000" pnpm --filter @workspace/tg-miniapp run build

  # Build backend
  RUN pnpm --filter @workspace/api-server run build

  # Verify builds
  RUN ls -la /app/artifacts/api-server/dist/ && ls -la /app/artifacts/tg-miniapp/dist/public/

  ENV NODE_ENV=production
  ENV PORT=8080
  EXPOSE 8080
  WORKDIR /app

  CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
  