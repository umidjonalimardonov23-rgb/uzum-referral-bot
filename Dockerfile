FROM node:24-slim
  WORKDIR /app

  COPY railway-package.json ./package.json
  RUN npm install --production

  COPY server.js ./

  ENV NODE_ENV=production
  ENV PORT=8080
  EXPOSE 8080

  CMD ["node", "server.js"]
  