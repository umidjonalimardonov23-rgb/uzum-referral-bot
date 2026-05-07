FROM node:24-slim
  WORKDIR /app

  # Install dependencies for standalone server
  COPY railway-package.json ./package.json
  RUN npm install

  # Copy standalone server
  COPY server.js ./

  # Copy frontend build files (optional - will serve if exists)
  # First install pnpm to build frontend
  RUN npm install -g pnpm@10.26.1

  COPY package.json ./monorepo-package.json
  COPY pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json tsconfig.json ./
  COPY lib/ ./lib/
  COPY artifacts/tg-miniapp/ ./artifacts/tg-miniapp/

  RUN pnpm install --frozen-lockfile

  RUN BASE_PATH="/" PORT="3000" pnpm --filter @workspace/tg-miniapp run build

  RUN ls -la /app/artifacts/tg-miniapp/dist/public/ && cp -r /app/artifacts/tg-miniapp/dist/public ./dist

  ENV NODE_ENV=production
  EXPOSE 8080

  CMD ["node", "server.js"]
  