const http = require('http');
  const express = require('express');
  const path = require('path');
  const fs = require('fs');

  // Load bot only if token exists
  let Bot, grammy;
  try {
    grammy = require('grammy');
    Bot = grammy.Bot;
  } catch(e) {
    console.error('grammy not loaded:', e.message);
  }

  const app = express();
  const PORT = process.env.PORT || 8080;

  app.use(express.json());
  app.use(require('cors')());

  // Health check
  app.get('/api/healthz', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Static files (mini app)
  const staticDir = path.join(__dirname, 'dist/public');
  if (fs.existsSync(staticDir)) {
    console.log('Serving static files from:', staticDir);
    app.use(express.static(staticDir));
    app.get('*', (req, res) => {
      res.sendFile(path.join(staticDir, 'index.html'));
    });
  } else {
    console.log('No static dir found at:', staticDir);
    app.get('/', (req, res) => {
      res.json({ status: 'ok', message: 'UzumRef Bot running!' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log('=== SERVER STARTED ===');
    console.log('Port:', PORT);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    startBot();
  });

  function startBot() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      console.log('TELEGRAM_BOT_TOKEN not set, bot not started');
      return;
    }
    if (!Bot) {
      console.log('grammy not available');
      return;
    }
    
    const APP_LINK = 'https://b.2u.uz/ref?c=50&a=L6DaizF7cl';
    const BOT_LINK = 'https://t.me/UzumBankRbot?start=L6DaizF7cl';
    const ADMIN_ID = 8787603995;
    const MINI_APP_URL = process.env.MINI_APP_URL || '';
    
    const bot = new Bot(token);
    
    bot.command('start', async (ctx) => {
      const name = ctx.from?.first_name || "Do'stim";
      const userId = ctx.from?.id;
      const username = ctx.from?.username ? '@' + ctx.from.username : 'username yoq';
      
      const kb = new grammy.InlineKeyboard()
        .text("💳 Karta Ochish", "open_card")
        .text("🤑 Do'st Taklif", "invite").row()
        .text("📊 Imkoniyatlar", "opportunities")
        .text("❓ Qanday Ishlaydi?", "how_it_works").row()
        .text("📈 Statistika", "stats")
        .text("📞 Yordam", "support");
      
      if (MINI_APP_URL) {
        kb.row().webApp("🚀 Mini App'ni Ochish ⚡️", MINI_APP_URL);
      }
      
      await ctx.reply(`⚡️ *Assalomu alaykum, ${name}!* ⚡️

  💰 *Uzum Bank Referral Dasturiga xush kelibsiz!*

  🌟 *Nima olasiz:*
  • 💳 Bepul virtual karta — 0 so'mga
  • 🤑 Har bir do'st uchun *45 000 so'm*
  • 🛒 Uzum Marketda maxsus narxlar
  • ♾️ Cheksiz daromad imkoniyati

  👇 Menyudan tanlang:`, {
        parse_mode: "Markdown",
        reply_markup: kb,
      });
      
      if (userId !== ADMIN_ID) {
        try {
          await bot.api.sendMessage(ADMIN_ID, `🆕 *Yangi foydalanuvchi!*\n\n👤 Ism: *${name}*\n🔗 Username: ${username}\n🆔 ID: \`${userId}\``, { parse_mode: "Markdown" });
        } catch(e) {}
      }
    });
    
    bot.callbackQuery('open_card', async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.reply(`💳 *Bepul Virtual Kartangizni Oching!*

  ✅ Karta ochish — *TO'LIQ BEPUL* (0 so'm)
  ✅ Onlayn xaridlar uchun ideal

  🔗 Ro'yxatdan o'ting:`, {
        parse_mode: "Markdown",
        reply_markup: new grammy.InlineKeyboard().url("🚀 Karta Ochish →", APP_LINK),
      });
    });
    
    bot.callbackQuery('invite', async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.reply(`🤝 *Do'stlaringizni Taklif Qiling!*

  🤑 Har bir taklif uchun: *45 000 so'm*
  ♾️ Taklif limiti: *CHEKSIZ*

  📱 *Ilova havolasi:*
  \`${APP_LINK}\`

  🤖 *Bot havolasi:*
  \`${BOT_LINK}\``, {
        parse_mode: "Markdown",
        reply_markup: new grammy.InlineKeyboard()
          .url("✈️ Telegramda Ulashish", `https://t.me/share/url?url=${encodeURIComponent(APP_LINK)}&text=${encodeURIComponent('⚡️ Uzum Bank orqali 45 000 so'm ishlang!')}`),
      });
    });
    
    bot.callbackQuery('opportunities', async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.reply(`🌟 *Imkoniyatlar*

  💳 Bepul Virtual Karta — 0 so'm
  🤑 45 000 so'm bonus har bir do'st uchun
  🛒 Uzum Market imtiyozlari
  ⚡️ Tezkor to'lovlar 24/7
  📊 Cashback dasturi
  🔒 O'zbekiston litsenziyali bank
  ♾️ Cheksiz daromad!`, { parse_mode: "Markdown" });
    });
    
    bot.callbackQuery('how_it_works', async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.reply(`📖 *Qanday Ishlaydi?*

  1️⃣ Havolani do'stingizga yuboring
  2️⃣ Do'stingiz ilovani yuklab, karta ochadi
  3️⃣ Sizga 45 000 so'm tushadi! 💰

  Shunday oddiy!`, { parse_mode: "Markdown" });
    });
    
    bot.callbackQuery('stats', async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.reply(`📊 *Statistika*

  🤑 10 do'st = 450 000 so'm
  🤑 50 do'st = 2 250 000 so'm
  🤑 100 do'st = 4 500 000 so'm

  📱 Havola: \`${APP_LINK}\``, { parse_mode: "Markdown" });
    });
    
    bot.callbackQuery('support', async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.reply('📞 Yordam: @UzumSupport\nRasmiy sayt: uzumbank.uz', { parse_mode: "Markdown" });
    });
    
    bot.callbackQuery('back_main', async (ctx) => {
      await ctx.answerCallbackQuery();
      await ctx.reply('🏠 Asosiy menyu:', {
        reply_markup: new grammy.InlineKeyboard()
          .text("💳 Karta Ochish", "open_card")
          .text("🤑 Do'st Taklif", "invite")
      });
    });
    
    bot.on('message', async (ctx) => {
      if (!ctx.message.text?.startsWith('/')) {
        await ctx.reply("👋 Salom! /start buyrug'ini yuboring.");
      }
    });
    
    bot.start({ onStart: () => console.log('Bot started successfully!') });
    console.log('Bot polling started');
  }
  