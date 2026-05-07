'use strict';
  process.stdout.write('=== SERVER.JS STARTING ===\n');
  process.stderr.write('=== SERVER.JS STARTING (stderr) ===\n');

  const express = require('express');
  const path = require('path');
  const fs = require('fs');

  let grammy;
  try {
    grammy = require('grammy');
    process.stdout.write('grammy loaded ok\n');
  } catch(e) {
    process.stderr.write('grammy load error: ' + e.message + '\n');
  }

  const app = express();
  const PORT = parseInt(process.env.PORT || '8080', 10);

  app.use(express.json());

  try {
    const cors = require('cors');
    app.use(cors());
  } catch(e) {
    process.stderr.write('cors error: ' + e.message + '\n');
  }

  app.get('/api/healthz', function(req, res) {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.get('/', function(req, res) {
    res.json({ status: 'ok', service: 'UzumRef Bot', time: new Date().toISOString() });
  });

  const server = app.listen(PORT, '0.0.0.0', function() {
    process.stdout.write('=== HTTP SERVER LISTENING ON PORT ' + PORT + ' ===\n');
    startBot();
  });

  server.on('error', function(err) {
    process.stderr.write('SERVER ERROR: ' + err.message + '\n');
    process.exit(1);
  });

  function startBot() {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      process.stdout.write('TELEGRAM_BOT_TOKEN not set, bot disabled\n');
      return;
    }
    if (!grammy || !grammy.Bot) {
      process.stdout.write('grammy not available, bot disabled\n');
      return;
    }

    const APP_LINK = 'https://b.2u.uz/ref?c=50&a=L6DaizF7cl';
    const BOT_LINK = 'https://t.me/UzumBankRbot?start=L6DaizF7cl';
    const ADMIN_ID = 8787603995;
    const MINI_APP_URL = process.env.MINI_APP_URL || '';

    const bot = new grammy.Bot(botToken);

    bot.command('start', async function(ctx) {
      const name = (ctx.from && ctx.from.first_name) || "Do'stim";
      const userId = ctx.from && ctx.from.id;
      const username = (ctx.from && ctx.from.username) ? '@' + ctx.from.username : 'username yoq';

      const kb = new grammy.InlineKeyboard()
        .text("💳 Karta Ochish", "open_card")
        .text("🤑 Do'st Taklif", "invite").row()
        .text("📊 Imkoniyatlar", "opportunities")
        .text("❓ Qanday Ishlaydi?", "how_it_works").row()
        .text("📈 Statistika", "stats")
        .text("📞 Yordam", "support");

      if (MINI_APP_URL) {
        kb.row().webApp("🚀 Mini App'ni Ochish", MINI_APP_URL);
      }

      await ctx.reply([
        "⚡️ *Assalomu alaykum, " + name + "!* ⚡️",
        "",
        "💰 *Uzum Bank Referral Dasturiga xush kelibsiz!*",
        "",
        "🌟 *Nima olasiz:*",
        "• 💳 Bepul virtual karta — 0 so'mga",
        "• 🤑 Har bir do'st uchun *45 000 so'm*",
        "• 🛒 Uzum Marketda maxsus narxlar",
        "• ♾️ Cheksiz daromad imkoniyati",
        "",
        "👇 Menyudan tanlang:"
      ].join("\n"), { parse_mode: "Markdown", reply_markup: kb });

      if (userId && userId !== ADMIN_ID) {
        try {
          await bot.api.sendMessage(ADMIN_ID,
            "🆕 *Yangi foydalanuvchi!*\n\n👤 Ism: *" + name + "*\n🔗 Username: " + username + "\n🆔 ID: `" + userId + "`",
            { parse_mode: "Markdown" }
          );
        } catch(e) {}
      }
    });

    bot.callbackQuery('open_card', async function(ctx) {
      await ctx.answerCallbackQuery();
      await ctx.reply("💳 *Bepul Virtual Kartangizni Oching!*\n\n✅ Karta ochish — *TO'LIQ BEPUL* (0 so'm)\n✅ Onlayn xaridlar uchun ideal\n\n🔗 Ro'yxatdan o'ting:", {
        parse_mode: "Markdown",
        reply_markup: new grammy.InlineKeyboard().url("🚀 Karta Ochish →", APP_LINK)
      });
    });

    bot.callbackQuery('invite', async function(ctx) {
      await ctx.answerCallbackQuery();
      await ctx.reply([
        "🤝 *Do'stlaringizni Taklif Qiling!*",
        "",
        "🤑 Har bir taklif uchun: *45 000 so'm*",
        "♾️ Taklif limiti: *CHEKSIZ*",
        "",
        "📱 *Ilova havolasi:*",
        "`" + APP_LINK + "`",
        "",
        "🤖 *Bot havolasi:*",
        "`" + BOT_LINK + "`"
      ].join("\n"), {
        parse_mode: "Markdown",
        reply_markup: new grammy.InlineKeyboard().url("✈️ Telegramda Ulashish",
          "https://t.me/share/url?url=" + encodeURIComponent(APP_LINK) + "&text=" + encodeURIComponent("⚡️ Uzum Bank orqali 45 000 so'm ishlang!"))
      });
    });

    bot.callbackQuery('opportunities', async function(ctx) {
      await ctx.answerCallbackQuery();
      await ctx.reply([
        "🌟 *Imkoniyatlar*",
        "",
        "💳 Bepul Virtual Karta — 0 so'm",
        "🤑 45 000 so'm bonus har bir do'st uchun",
        "🛒 Uzum Market imtiyozlari",
        "⚡️ Tezkor to'lovlar 24/7",
        "📊 Cashback dasturi",
        "🔒 O'zbekiston litsenziyali bank",
        "♾️ Cheksiz daromad!"
      ].join("\n"), { parse_mode: "Markdown" });
    });

    bot.callbackQuery('how_it_works', async function(ctx) {
      await ctx.answerCallbackQuery();
      await ctx.reply([
        "📖 *Qanday Ishlaydi?*",
        "",
        "1️⃣ Havolani do'stingizga yuboring",
        "2️⃣ Do'stingiz ilovani yuklab, karta ochadi",
        "3️⃣ Sizga 45 000 so'm tushadi! 💰",
        "",
        "Shunday oddiy!"
      ].join("\n"), { parse_mode: "Markdown" });
    });

    bot.callbackQuery('stats', async function(ctx) {
      await ctx.answerCallbackQuery();
      await ctx.reply([
        "📊 *Statistika*",
        "",
        "🤑 10 do'st = 450 000 so'm",
        "🤑 50 do'st = 2 250 000 so'm",
        "🤑 100 do'st = 4 500 000 so'm",
        "",
        "📱 Havola: `" + APP_LINK + "`"
      ].join("\n"), { parse_mode: "Markdown" });
    });

    bot.callbackQuery('support', async function(ctx) {
      await ctx.answerCallbackQuery();
      await ctx.reply("📞 Yordam: @UzumSupport\nRasmiy sayt: uzumbank.uz");
    });

    bot.on('message', async function(ctx) {
      if (ctx.message && ctx.message.text && !ctx.message.text.startsWith('/')) {
        await ctx.reply("👋 Salom! /start buyrug'ini yuboring.");
      }
    });

    bot.catch(function(err) {
      process.stderr.write('Bot error: ' + String(err) + '\n');
    });

    bot.start({ onStart: function() { process.stdout.write('Telegram bot polling started!\n'); } });
    process.stdout.write('Bot.start() called\n');
  }
  