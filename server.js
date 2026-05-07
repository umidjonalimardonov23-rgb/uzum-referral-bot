'use strict';
process.stdout.write('=== SERVER STARTING ===\n');

var express = require('express');
var cors = require('cors');

var app = express();
var PORT = parseInt(process.env.PORT || '8080', 10);

app.use(express.json());
app.use(cors());

app.get('/api/healthz', function(req, res) {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/', function(req, res) {
  res.json({ status: 'ok', service: 'UzumRef Bot' });
});

app.listen(PORT, '0.0.0.0', function() {
  process.stdout.write('HTTP server running on port ' + PORT + '\n');
  // Start bot after brief delay
  setTimeout(startBot, 1000);
});

var botRetryCount = 0;
var MAX_RETRIES = 10;

function startBot() {
  var botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    process.stdout.write('TELEGRAM_BOT_TOKEN not set, bot disabled\n');
    return;
  }
  var grammy;
  try { grammy = require('grammy'); } catch(e) {
    process.stderr.write('grammy load error: ' + e.message + '\n');
    return;
  }

  // Reset any existing Telegram sessions
  fetch('https://api.telegram.org/bot' + botToken + '/deleteWebhook?drop_pending_updates=true')
    .then(function(r) { return r.json(); })
    .then(function(d) {
      process.stdout.write('deleteWebhook: ' + JSON.stringify(d) + '\n');
      // Wait 3s for sessions to clear
      setTimeout(function() { launchBot(grammy, botToken); }, 3000);
    })
    .catch(function(e) {
      process.stderr.write('deleteWebhook error: ' + e.message + '\n');
      setTimeout(function() { launchBot(grammy, botToken); }, 3000);
    });
}

function launchBot(grammy, botToken) {
  var APP_LINK = 'https://b.2u.uz/ref?c=50&a=L6DaizF7cl';
  var BOT_LINK = 'https://t.me/UzumBankRbot?start=L6DaizF7cl';
  var ADMIN_ID = 8787603995;
  var MINI_APP_URL = process.env.MINI_APP_URL || '';

  var bot = new grammy.Bot(botToken);

  bot.command('start', async function(ctx) {
    var name = (ctx.from && ctx.from.first_name) || "Do'stim";
    var userId = ctx.from && ctx.from.id;
    var username = (ctx.from && ctx.from.username) ? '@' + ctx.from.username : 'username yoq';
    var kb = new grammy.InlineKeyboard()
      .text('\u{1F4B3} Karta Ochish', 'open_card')
      .text("\u{1F911} Do'st Taklif", 'invite').row()
      .text('\u{1F4CA} Imkoniyatlar', 'opportunities')
      .text('\u2753 Qanday Ishlaydi?', 'how_it_works').row()
      .text('\u{1F4C8} Statistika', 'stats')
      .text('\u{1F4DE} Yordam', 'support');
    if (MINI_APP_URL) kb.row().webApp('\u{1F680} Mini App', MINI_APP_URL);
    await ctx.reply(
      '\u26A1\uFE0F Assalomu alaykum, ' + name + '! \u26A1\uFE0F\n\n' +
      '\u{1F4B0} Uzum Bank Referral Dasturiga xush kelibsiz!\n\n' +
      '\u{1F31F} Nima olasiz:\n' +
      '  \u{1F4B3} Bepul virtual karta - 0 so\'m\n' +
      "  \u{1F911} Har bir do'st uchun 45 000 so'm\n" +
      '  \u267E\uFE0F Cheksiz daromad\n\n' +
      '\u{1F447} Menyudan tanlang:',
      { reply_markup: kb }
    );
    if (userId && userId !== ADMIN_ID) {
      try {
        await bot.api.sendMessage(ADMIN_ID,
          '\u{1F195} Yangi: ' + name + ' (' + username + ') ID:' + userId);
      } catch(e) { /* ignore */ }
    }
  });

  bot.callbackQuery('open_card', async function(ctx) {
    await ctx.answerCallbackQuery();
    await ctx.reply(
      '\u{1F4B3} Bepul Virtual Karta!\n\n' +
      '\u2705 Karta ochish - TO\'LIQ BEPUL\n' +
      '\u2705 Onlayn xaridlar uchun ideal\n\n' +
      'Ro\'yxatdan o\'ting:',
      { reply_markup: new grammy.InlineKeyboard().url('\u{1F680} Karta Ochish', APP_LINK) }
    );
  });

  bot.callbackQuery('invite', async function(ctx) {
    await ctx.answerCallbackQuery();
    await ctx.reply(
      "\u{1F91D} Do'stlaringizni Taklif Qiling!\n\n" +
      "\u{1F911} Har taklif uchun: 45 000 so'm\n" +
      '\u267E\uFE0F Limit: CHEKSIZ\n\n' +
      'Havola: ' + APP_LINK,
      {
        reply_markup: new grammy.InlineKeyboard().url('\u2708\uFE0F Ulashish',
          'https://t.me/share/url?url=' + encodeURIComponent(APP_LINK) +
          '&text=' + encodeURIComponent("Uzum Bank orqali 45 000 so'm ishlang!"))
      }
    );
  });

  bot.callbackQuery('opportunities', async function(ctx) {
    await ctx.answerCallbackQuery();
    await ctx.reply(
      '\u{1F31F} Imkoniyatlar\n\n' +
      '\u{1F4B3} Bepul karta - 0 so\'m\n' +
      "\u{1F911} 45 000 so'm/do'st\n" +
      '\u{1F6D2} Uzum Market imtiyozlari\n' +
      '\u267E\uFE0F Cheksiz daromad!'
    );
  });

  bot.callbackQuery('how_it_works', async function(ctx) {
    await ctx.answerCallbackQuery();
    await ctx.reply(
      'Qanday Ishlaydi?\n\n' +
      "1. Havolani do'stingizga yuboring\n" +
      "2. Do'stingiz karta ochadi\n" +
      '3. Sizga 45 000 so\'m tushadi! \u{1F4B0}'
    );
  });

  bot.callbackQuery('stats', async function(ctx) {
    await ctx.answerCallbackQuery();
    await ctx.reply(
      '\u{1F4CA} Statistika\n\n' +
      "10 do'st = 450 000 so'm\n" +
      "50 do'st = 2 250 000 so'm\n" +
      "100 do'st = 4 500 000 so'm"
    );
  });

  bot.callbackQuery('support', async function(ctx) {
    await ctx.answerCallbackQuery();
    await ctx.reply('Yordam: @UzumSupport | uzumbank.uz');
  });

  bot.on('message', async function(ctx) {
    if (ctx.message && ctx.message.text && !ctx.message.text.startsWith('/')) {
      await ctx.reply("/start buyrug'ini yuboring.");
    }
  });

  // Handle errors without crashing
  bot.catch(function(err) {
    var msg = (err && err.message) ? err.message : String(err);
    process.stderr.write('[bot.catch] ' + msg + '\n');
  });

  // Start with retry on 409
  bot.start({ drop_pending_updates: true })
    .then(function() { process.stdout.write('Bot stopped normally\n'); })
    .catch(function(err) {
      var msg = (err && err.message) ? err.message : String(err);
      process.stderr.write('[bot.start error] ' + msg + '\n');
      if (botRetryCount < MAX_RETRIES) {
        botRetryCount++;
        var delay = botRetryCount * 5000;
        process.stdout.write('Retrying bot in ' + (delay/1000) + 's (attempt ' + botRetryCount + ')...\n');
        setTimeout(function() { launchBot(grammy, botToken); }, delay);
      } else {
        process.stderr.write('Max bot retries reached, giving up\n');
      }
    });

  process.stdout.write('Telegram bot started!\n');
}
