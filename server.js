'use strict';
process.stdout.write('=== SERVER STARTING (webhook mode) ===\n');

var express = require('express');
var cors = require('cors');

var app = express();
var PORT = parseInt(process.env.PORT || '8080', 10);
var BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
var WEBHOOK_DOMAIN = process.env.WEBHOOK_DOMAIN || '';

app.use(express.json({ limit: '10mb' }));
app.use(cors());

app.get('/api/healthz', function(req, res) {
  res.json({ status: 'ok', time: new Date().toISOString(), mode: WEBHOOK_DOMAIN ? 'webhook' : 'polling' });
});

app.get('/', function(req, res) {
  res.json({ status: 'ok', service: 'UzumRef Bot' });
});

var grammy;
var bot;

app.listen(PORT, '0.0.0.0', async function() {
  process.stdout.write('HTTP server running on port ' + PORT + '\n');

  if (!BOT_TOKEN) {
    process.stdout.write('No TELEGRAM_BOT_TOKEN, bot disabled\n');
    return;
  }

  try { grammy = require('grammy'); } catch(e) {
    process.stderr.write('grammy error: ' + e.message + '\n');
    return;
  }

  bot = buildBot();

  if (WEBHOOK_DOMAIN) {
    var webhookPath = '/webhook/' + BOT_TOKEN;
    var webhookUrl = 'https://' + WEBHOOK_DOMAIN + webhookPath;

    app.use(webhookPath, grammy.webhookCallback(bot, { secretToken: undefined }));

    try {
      var setRes = await fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/setWebhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl, drop_pending_updates: true, max_connections: 1 })
      });
      var setData = await setRes.json();
      process.stdout.write('setWebhook: ' + JSON.stringify(setData) + '\n');
      process.stdout.write('Webhook URL: ' + webhookUrl + '\n');
    } catch(e) {
      process.stderr.write('setWebhook error: ' + e.message + '\n');
    }
  } else {
    process.stdout.write('WEBHOOK_DOMAIN not set, using polling...\n');
    try {
      await fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/deleteWebhook?drop_pending_updates=true');
    } catch(e) {}
    setTimeout(function() {
      bot.start({ drop_pending_updates: true })
        .catch(function(e) { process.stderr.write('polling error: ' + e.message + '\n'); });
    }, 3000);
  }
});

function buildBot() {
  var APP_LINK = 'https://b.2u.uz/ref?c=50&a=L6DaizF7cl';
  var BOT_LINK = 'https://t.me/UzumBankRbot?start=L6DaizF7cl';
  var SUPPORT_USERNAME = '@uzum_bonus_admin';
  var CHANNEL_LINK = 'https://t.me/uuzum_bonus_45k';
  var ADMIN_ID = 8787603995;
  var MINI_APP_URL = process.env.MINI_APP_URL || '';

  var b = new grammy.Bot(BOT_TOKEN);

  function mainKb() {
    var kb = new grammy.InlineKeyboard()
      .text('💳 Karta Ochish', 'open_card')
      .text('🤑 Do\'st Taklif', 'invite').row()
      .text('📊 Imkoniyatlar', 'opportunities')
      .text('❓ Qanday Ishlaydi?', 'how_it_works').row()
      .text('📈 Statistika', 'stats')
      .text('📞 Yordam', 'support').row();
    if (MINI_APP_URL) kb.webApp('🚀 Mini App ⚡️', MINI_APP_URL).row();
    kb.url('📣 Kanalimiz', CHANNEL_LINK).row();
    kb.text('🌐 Русский', 'lang_ru');
    return kb;
  }

  function mainKbRu() {
    var kb = new grammy.InlineKeyboard()
      .text('💳 Открыть карту', 'open_card')
      .text('🤑 Пригласить друга', 'invite').row()
      .text('📊 Возможности', 'opportunities')
      .text('❓ Как работает?', 'how_it_works').row()
      .text('📈 Статистика', 'stats')
      .text('📞 Поддержка', 'support').row();
    if (MINI_APP_URL) kb.webApp('🚀 Mini App ⚡️', MINI_APP_URL).row();
    kb.url('📣 Наш канал', CHANNEL_LINK).row();
    kb.text('🌐 O\'zbek tili', 'lang_uz');
    return kb;
  }

  async function notifyAdmin(text) {
    try { await b.api.sendMessage(ADMIN_ID, text); } catch(e) {}
  }

  b.command('start', async function(ctx) {
    try {
      var name = (ctx.from && ctx.from.first_name) || "Do'stim";
      var userId = ctx.from && ctx.from.id;
      var username = (ctx.from && ctx.from.username) ? '@' + ctx.from.username : 'username yoq';
      await ctx.reply(
        '⚡️ Assalomu alaykum, ' + name + '! ⚡️\n\n' +
        '💰 Uzum Bank Referral Dasturiga xush kelibsiz!\n\n' +
        '🌟 Nima olasiz:\n' +
        '• 💳 Bepul virtual karta — 0 soʻmga\n' +
        '• 🤑 Har bir doʻst uchun 45 000 soʻm\n' +
        '• 🛒 Uzum Marketda maxsus narxlar\n' +
        '• ♾️ Cheksiz daromad imkoniyati\n\n' +
        '📣 Kanalimizga obuna boʻling!\n\n' +
        '👇 Menyudan tanlang:',
        { reply_markup: mainKb() }
      );
      if (userId && userId !== ADMIN_ID) {
        await notifyAdmin('🆕 Yangi foydalanuvchi!\n\n👤 ' + name + '\n🔗 ' + username + '\n🆔 ' + userId);
      }
    } catch(e) { process.stderr.write('/start: ' + e.message + '\n'); }
  });

  b.command('help', async function(ctx) {
    try {
      await ctx.reply(
        '🆘 Yordam\n\n' +
        '📌 Buyruqlar:\n' +
        '/start — Botni qayta boshlash\n' +
        '/havola — Referral havola\n' +
        '/stats — Statistika\n' +
        '/help — Yordam\n\n' +
        '👨‍💼 Admin: ' + SUPPORT_USERNAME + '\n' +
        '📣 Kanal: ' + CHANNEL_LINK
      );
    } catch(e) {}
  });

  b.command('havola', async function(ctx) {
    try {
      await ctx.reply(
        '🔗 Referral havolalaringiz:\n\n📱 App:\n' + APP_LINK + '\n\n🤖 Bot:\n' + BOT_LINK + '\n\n💰 Har bir doʻst uchun 45 000 soʻm!',
        { reply_markup: new grammy.InlineKeyboard().url('📱 App', APP_LINK).url('🤖 Bot', BOT_LINK) }
      );
    } catch(e) {}
  });

  b.command('stats', async function(ctx) {
    try {
      await ctx.reply(
        '📊 Statistika\n\n' +
        "🤑 10 do'st = 450 000 so'm\n" +
        "🤑 50 do'st = 2 250 000 so'm\n" +
        "🤑 100 do'st = 4 500 000 so'm\n\n" +
        '💡 Har kuni 2-3 ta do\'stga yuboring!\n\n' +
        '📱 ' + APP_LINK
      );
    } catch(e) {}
  });

  b.callbackQuery('open_card', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      await ctx.reply(
        '💳 Bepul Virtual Kartangizni Oching!\n\n' +
        '✅ Karta ochish — TO\'LIQ BEPUL (0 so\'m)\n' +
        '✅ Onlayn xaridlar uchun ideal\n' +
        '✅ Uzum Marketda maxsus narxlar\n' +
        '✅ Cashback va bonuslar\n\n' +
        '🔗 Quyidagi havoladan ro\'yxatdan o\'ting:',
        { reply_markup: new grammy.InlineKeyboard().url('🚀 Karta Ochish →', APP_LINK).row().text('🔙 Orqaga', 'back_main') }
      );
    } catch(e) {}
  });

  b.callbackQuery('invite', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      var shareText = encodeURIComponent("⚡️ Do'stim, bugun Uzum Bank ilovasini yuklab, bepul virtual karta oching!\n\n💰 45 000 so'm bonus!\n\n📱 " + APP_LINK + "\n🤖 " + BOT_LINK);
      await ctx.reply(
        "🤝 Do'stlaringizni Taklif Qiling!\n\n" +
        "🤑 Har taklif: 45 000 so'm\n" +
        '♾️ Limit: CHEKSIZ\n\n' +
        '📱 Ilova:\n' + APP_LINK + '\n\n' +
        '🤖 Bot:\n' + BOT_LINK,
        {
          reply_markup: new grammy.InlineKeyboard()
            .url('✈️ Telegramda Ulashish', 'https://t.me/share/url?url=' + encodeURIComponent(APP_LINK) + '&text=' + shareText).row()
            .url('📱 App', APP_LINK).url('🤖 Bot', BOT_LINK).row()
            .text('🔙 Orqaga', 'back_main')
        }
      );
    } catch(e) {}
  });

  b.callbackQuery('opportunities', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      await ctx.reply(
        '🌟 Imkoniyatlar va Afzalliklar\n\n' +
        '💳 Bepul Virtual Karta\n└ 0 so\'mga oching\n\n' +
        "🤑 45 000 so'm Bonus\n└ Har bir taklif uchun\n\n" +
        '🛒 Uzum Market\n└ Maxsus chegirmalar\n\n' +
        '⚡️ Tezkor To\'lovlar\n└ 24/7\n\n' +
        '🔒 Xavfsiz Bank\n└ O\'zbekiston litsenziyali\n\n' +
        '♾️ Cheksiz Daromad!',
        { reply_markup: new grammy.InlineKeyboard().url('🚀 Karta Ochish →', APP_LINK).row().text('🔙 Orqaga', 'back_main') }
      );
    } catch(e) {}
  });

  b.callbackQuery('how_it_works', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      await ctx.reply(
        '📖 Qanday Ishlaydi?\n\n' +
        '1️⃣ Havolani do\'stingizga yuboring\n\n' +
        '2️⃣ Do\'st karta ochadi\n\n' +
        "3️⃣ 45 000 so'm hisobingizga tushadi! 💰\n\n" +
        "✅ Shunday oddiy! Qancha ko'p do'st — shuncha ko'p pul!",
        { reply_markup: new grammy.InlineKeyboard().url('🚀 Boshlash →', APP_LINK).row().text('🔙 Orqaga', 'back_main') }
      );
    } catch(e) {}
  });

  b.callbackQuery('stats', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      await ctx.reply(
        '📊 Statistika\n\n' +
        "🤑 10 do'st = 450 000 so'm\n" +
        "🤑 50 do'st = 2 250 000 so'm\n" +
        "🤑 100 do'st = 4 500 000 so'm\n\n" +
        '💡 Har kuni 2-3 ta do\'stga yuboring — oyiga millions ishlang! 🚀\n\n' +
        '📱 ' + APP_LINK,
        { reply_markup: new grammy.InlineKeyboard().text("🤑 Do'stni Taklif Qil", 'invite').row().text('🔙 Orqaga', 'back_main') }
      );
    } catch(e) {}
  });

  b.callbackQuery('support', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      var name = (ctx.from && ctx.from.first_name) || "Do'stim";
      var username = (ctx.from && ctx.from.username) ? '@' + ctx.from.username : 'username yoq';
      var userId = ctx.from && ctx.from.id;

      await ctx.reply(
        '📞 Qo\'llab-Quvvatlash\n\n' +
        '❓ Savollaringiz bormi? Biz yordam beramiz!\n\n' +
        '👨‍💼 Admin: ' + SUPPORT_USERNAME + '\n' +
        '📣 Kanal: ' + CHANNEL_LINK + '\n\n' +
        '🕐 Ish vaqti: 24/7\n' +
        '🔗 Rasmiy sayt: uzumbank.uz',
        {
          reply_markup: new grammy.InlineKeyboard()
            .url('👨‍💼 Admin bilan bog\'lanish', 'https://t.me/' + SUPPORT_USERNAME.replace('@', '')).row()
            .url('📣 Kanalga o\'tish', CHANNEL_LINK).row()
            .text('🔙 Orqaga', 'back_main')
        }
      );

      // Adminga xabar yuborish
      if (userId && userId !== ADMIN_ID) {
        await notifyAdmin('📞 Yordam so\'raldi!\n\n👤 ' + name + '\n🔗 ' + username + '\n🆔 ' + userId);
      }
    } catch(e) {}
  });

  b.callbackQuery('back_main', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      var name = (ctx.from && ctx.from.first_name) || "Do'stim";
      await ctx.reply(
        '⚡️ Assalomu alaykum, ' + name + '! ⚡️\n\n' +
        '💰 Uzum Bank Referral Dasturiga xush kelibsiz!\n\n' +
        '🌟 Nima olasiz:\n' +
        '• 💳 Bepul virtual karta — 0 soʻmga\n' +
        '• 🤑 Har bir doʻst uchun 45 000 soʻm\n' +
        '• 🛒 Uzum Marketda maxsus narxlar\n' +
        '• ♾️ Cheksiz daromad imkoniyati\n\n' +
        '📣 Kanalimizga obuna boʻling!\n\n' +
        '👇 Menyudan tanlang:',
        { reply_markup: mainKb() }
      );
    } catch(e) {}
  });

  b.callbackQuery('lang_ru', async function(ctx) {
    try {
      await ctx.answerCallbackQuery('🇷🇺 Русский язык выбран!');
      var name = (ctx.from && ctx.from.first_name) || 'Друг';
      await ctx.reply(
        '⚡️ Привет, ' + name + '! ⚡️\n\n' +
        '💰 Добро пожаловать в реферальную программу Uzum Bank!\n\n' +
        '🌟 Что вы получаете:\n' +
        '• 💳 Бесплатная виртуальная карта — 0 сум\n' +
        '• 🤑 За каждого друга 45 000 сум\n' +
        '• 🛒 Специальные цены в Uzum Market\n' +
        '• ♾️ Неограниченный заработок\n\n' +
        '📣 Подпишитесь на канал!\n\n' +
        '👇 Выберите из меню:',
        { reply_markup: mainKbRu() }
      );
    } catch(e) {}
  });

  b.callbackQuery('lang_uz', async function(ctx) {
    try {
      await ctx.answerCallbackQuery("🇺🇿 O'zbek tili tanlandi!");
      var name = (ctx.from && ctx.from.first_name) || "Do'stim";
      await ctx.reply(
        '⚡️ Assalomu alaykum, ' + name + '! ⚡️\n\n' +
        '💰 Uzum Bank Referral Dasturiga xush kelibsiz!\n\n' +
        '🌟 Nima olasiz:\n' +
        '• 💳 Bepul virtual karta — 0 soʻmga\n' +
        '• 🤑 Har bir doʻst uchun 45 000 soʻm\n' +
        '• 🛒 Uzum Marketda maxsus narxlar\n' +
        '• ♾️ Cheksiz daromad imkoniyati\n\n' +
        '📣 Kanalimizga obuna boʻling!\n\n' +
        '👇 Menyudan tanlang:',
        { reply_markup: mainKb() }
      );
    } catch(e) {}
  });

  b.on('message', async function(ctx) {
    try {
      if (ctx.message && ctx.message.text && !ctx.message.text.startsWith('/')) {
        await ctx.reply("👋 Salom! /start buyrug'ini yuboring yoki menyudan foydalaning.", { reply_markup: mainKb() });
      }
    } catch(e) {}
  });

  b.catch(function(err) {
    process.stderr.write('[bot.catch] ' + (err && err.message ? err.message : String(err)) + '\n');
  });

  return b;
}
