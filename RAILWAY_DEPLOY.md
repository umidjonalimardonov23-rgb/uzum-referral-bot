# Railway'ga Deploy Qilish

## Muhim Environment Variables (Railway'da qo'shish kerak)

| Variable | Qiymat | Izoh |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | `8609314242:AAG...` | BotFather tokeningiz |
| `PORT` | `8080` | Railway avtomatik o'rnatadi |
| `NODE_ENV` | `production` | Ishlab chiqarish rejimi |

## Qadamlar

### 1. GitHub'ga push qiling
Replit'dan GitHub'ga kod yuklang:
- Replit'dagi "Version Control" panelini oching
- GitHub repoga ulaning va push qiling

### 2. Railway loyiha yarating
1. https://railway.app ga kiring
2. "New Project" → "Deploy from GitHub repo"
3. Repongizni tanlang

### 3. Environment variables qo'shing
Railway dashboard → Variables:
```
TELEGRAM_BOT_TOKEN = <sizning_tokeningiz>
NODE_ENV = production
```

### 4. Deploy!
Railway avtomatik Dockerfile'dan build qiladi va deploy qiladi.

## Deploy muvaffaqiyatli bo'lgandan keyin

Bot tokenida Mini App URL'ni yangilang:
- Railway'da loyiha URL'ingizni oling (masalan: `https://myapp.railway.app`)
- Bu URL Telegram'da bot settings'da "Menu Button URL" qilib qo'yiladi

## Tekshirish
- `https://your-app.railway.app/api/healthz` — API ishlayaptimi?
- `https://your-app.railway.app/` — Mini App ochilayaptimi?
- Telegram botingizga `/start` yuboring — bot javob beraptimi?
