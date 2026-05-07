FROM node:24-slim
  RUN npm install -g pnpm@10.26.1
  WORKDIR /app

  COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json tsconfig.json ./
  COPY lib/ ./lib/
  COPY artifacts/api-server/ ./artifacts/api-server/
  COPY artifacts/tg-miniapp/ ./artifacts/tg-miniapp/

  RUN pnpm install --frozen-lockfile

  # Build frontend
  RUN BASE_PATH="/" PORT="3000" pnpm --filter @workspace/tg-miniapp run build

  # Build backend (esbuild bundle)
  RUN pnpm --filter @workspace/api-server run build

  RUN ls -la /app/artifacts/api-server/dist/
  RUN ls -la /app/artifacts/tg-miniapp/dist/public/

  ENV NODE_ENV=production
  ENV PORT=8080
  EXPOSE 8080

  CMD ["node", "--enable-source-maps", "/app/artifacts/api-server/dist/index.mjs"]
  