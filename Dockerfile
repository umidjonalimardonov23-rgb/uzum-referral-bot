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

RUN ls -la /app/artifacts/api-server/dist/index.mjs

RUN printf '#!/bin/sh\necho "=== UZUM BOT STARTING ==="\necho "PORT=$PORT"\necho "NODE_ENV=$NODE_ENV"\nexec node --enable-source-maps /app/artifacts/api-server/dist/index.mjs\n' > /app/start.sh && chmod +x /app/start.sh

EXPOSE 8080
ENV NODE_ENV=production
ENV PORT=8080
CMD ["/app/start.sh"]
