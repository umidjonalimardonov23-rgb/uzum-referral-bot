FROM node:24-slim
  WORKDIR /app

  # Step 1: Install standalone server deps (pure npm, no pnpm)
  COPY railway-package.json package.json
  RUN npm install --production

  # Step 2: Copy standalone server
  COPY server.js .

  # Step 3: Build frontend (separate pnpm step)
  RUN npm install -g pnpm@10.26.1
  COPY package.json monorepo-root.json
  COPY pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json tsconfig.json ./
  COPY lib/ ./lib/
  COPY artifacts/tg-miniapp/ ./artifacts/tg-miniapp/
  RUN pnpm install --frozen-lockfile --filter @workspace/tg-miniapp...
  RUN BASE_PATH="/" PORT="3000" pnpm --filter @workspace/tg-miniapp run build
  RUN mkdir -p dist/public && cp -r artifacts/tg-miniapp/dist/public/* dist/public/

  ENV NODE_ENV=production
  ENV PORT=8080
  EXPOSE 8080

  CMD ["node", "server.js"]
  