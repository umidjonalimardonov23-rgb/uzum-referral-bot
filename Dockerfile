FROM node:24-slim
  WORKDIR /app

  # Install deps - ONLY for standalone server, no pnpm workspace
  COPY railway-package.json package.json
  COPY railway-package-lock.json package-lock.json
  RUN npm ci --production

  # Copy standalone server
  COPY server.js .

  ENV NODE_ENV=production
  ENV PORT=8080
  EXPOSE 8080

  CMD ["node", "server.js"]
  