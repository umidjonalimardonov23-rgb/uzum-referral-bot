FROM node:24
RUN npm install -g pnpm@10.26.1
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json tsconfig.json ./
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/
COPY artifacts/tg-miniapp/ ./artifacts/tg-miniapp/

RUN pnpm install --frozen-lockfile

RUN BASE_PATH="/" PORT="3000" pnpm --filter @workspace/tg-miniapp run build

RUN pnpm --filter @workspace/api-server run build

EXPOSE 8080
ENV NODE_ENV=production
CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
