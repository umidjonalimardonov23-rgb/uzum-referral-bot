FROM node:24-alpine
  WORKDIR /app
  COPY package.json .
  RUN npm install --omit=dev
  # Cache bust: 1778409861839
  RUN apk add --no-cache wget && \
      wget -q -O server.js https://raw.githubusercontent.com/umidjonalimardonov23-rgb/uzum-referral-bot/main/server.js
  ENV NODE_ENV=production
  ENV PORT=8080
  EXPOSE 8080
  CMD ["node", "server.js"]
  