FROM node:24-slim
  RUN npm install -g pnpm@10.26.1
  WORKDIR /app

  COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json tsconfig.json ./
  COPY lib/ ./lib/
  COPY artifacts/api-server/ ./artifacts/api-server/
  COPY artifacts/tg-miniapp/ ./artifacts/tg-miniapp/

  RUN pnpm install --frozen-lockfile

  # Build the mini app frontend
  RUN BASE_PATH="/" PORT="3000" pnpm --filter @workspace/tg-miniapp run build

  # Verify frontend build
  RUN ls -la /app/artifacts/tg-miniapp/dist/public/

  ENV NODE_ENV=production
  EXPOSE 8080

  CMD ["node", "--import", "tsx/esm", "/app/artifacts/api-server/src/index.ts"]
  