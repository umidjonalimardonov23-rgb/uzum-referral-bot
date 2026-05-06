# Uzum Bank Referral Mini App & Telegram Bot

Telegram Mini App va Bot orqali Uzum Bank referral dasturini boshqarish — foydalanuvchilar referral havolalar orqali o'tib, do'stlarini taklif qilishi mumkin.

## Run & Operate

- `pnpm --filter @workspace/tg-miniapp run dev` — Mini App frontend (port 5173)
- `pnpm --filter @workspace/api-server run dev` — API server + Telegram Bot (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- Required env: `TELEGRAM_BOT_TOKEN` — Telegram Bot token from @BotFather

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS (shadcn/ui)
- API: Express 5
- Telegram Bot: grammy v1
- Build: esbuild (CJS bundle) — grammy is externalized

## Where things live

- `artifacts/tg-miniapp/src/` — Telegram Mini App React frontend
  - `pages/` — HomePage, FriendsPage, HowPage, InfoPage
  - `components/` — BottomNav, SplashScreen
- `artifacts/api-server/src/bot.ts` — Telegram Bot (grammy)
- `artifacts/api-server/src/index.ts` — starts bot after server listen
- `artifacts/api-server/build.mjs` — esbuild config (grammy externalized)

## Architecture decisions

- grammy bot is externalized in esbuild (not bundled) due to platform-native module issues
- Bot starts after Express server binds to port to avoid startup race conditions
- Mini App uses port 5173 (Vite default, supported by workflow system)
- Referral links are hardcoded constants in both frontend and bot

## Product

- **Telegram Mini App**: 4-page app (Bosh sahifa, Do'stlar, Qanday?, Ma'lumot) with splash screen and bottom nav
- **Telegram Bot**: /start command with inline keyboard menus, referral link sharing, FAQ
- Referral links: App (https://b.2u.uz/ref?c=50&a=L6DaizF7cl) and Bot (https://t.me/UzumBankRbot?start=L6DaizF7cl)

## User preferences

- Uzbek language interface
- Pro emojis throughout the UI
- Purple/violet color theme (Uzum Bank branding)

## Gotchas

- grammy must be in `external` list in `artifacts/api-server/build.mjs`
- Mini App port must be 5173 (not arbitrary) — workflow system only supports specific ports
- Bot token loaded from TELEGRAM_BOT_TOKEN secret env var

## Pointers

- See the `pnpm-workspace` skill for workspace structure
- grammy docs: https://grammy.dev
