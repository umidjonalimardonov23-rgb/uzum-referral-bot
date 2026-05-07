'use strict';
process.stdout.write('=== SERVER STARTING ===\n');

// Prevent unhandled rejections from crashing the process
process.on('unhandledRejection', function(reason) {
  var msg = reason && reason.message ? reason.message : String(reason);
  process.stderr.write('[unhandledRejection] ' + msg + '\n');
  // Don't exit - let the server keep running
});

process.on('uncaughtException', function(err) {
  process.stderr.write('[uncaughtException] ' + err.message + '\n');
  // Don't exit - server stays up
});

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
  setTimeout(startBot, 1000);
});

var botRetry = 0;

function startBot() {
  var botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) { process.stdout.write('No bot token\n'); return; }
  var grammy;
  try { grammy = require('grammy'); } catch(e) { process.stderr.write('grammy: ' + e.message + '\n'); return; }

  // Clear webhook and any existing sessions
  var clearUrl = 'https://api.telegram.org/bot' + botToken + '/deleteWebhook?drop_pending_updates=true';
  fetch(clearUrl).then(function() {
    process.stdout.write('Cleared webhook, launching bot in 5s...\n');
    setTimeout(function() { launchBot(grammy, botToken); }, 5000);
  }).catch(function() {
    setTimeout(function() { launchBot(grammy, botToken); }, 5000);
  });
}

function launchBot(grammy, botToken) {
  process.stdout.write('Launching bot (attempt ' + (botRetry + 1) + ')...\n');
  var APP_LINK = 'https://b.2u.uz/ref?c=50&a=L6DaizF7cl';
  var BOT_LINK = 'https://t.me/UzumBankRbot?start=L6DaizF7cl';
  var ADMIN_ID = 8787603995;
  var MINI_APP_URL = process.env.MINI_APP_URL || '';
  var bot;

  try { bot = new grammy.Bot(botToken); } catch(e) {
    process.stderr.write('Bot create error: ' + e.message + '\n');
    return;
  }

  bot.command('start', async function(ctx) {
    try {
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
        '\u26A1\uFE0F Assalomu alaykum, ' + name + '!\n\n' +
        '\u{1F4B0} Uzum Bank Referral Dasturiga xush kelibsiz!\n\n' +
        '\u{1F31F} Nima olasiz:\n' +
        '  \u{1F4B3} Bepul virtual karta - 0 so\'m\n' +
        "  \u{1F911} Har bir do'st uchun 45 000 so'm\n" +
        '  \u267E\uFE0F Cheksiz daromad\n\n' +
        '\u{1F447} Menyudan tanlang:',
        { reply_markup: kb }
      );
      if (userId && userId !== ADMIN_ID) {
        try { await bot.api.sendMessage(ADMIN_ID, '\u{1F195} ' + name + ' (' + username + ') ID:' + userId); } catch(e) {}
      }
    } catch(e) { process.stderr.write('/start error: ' + e.message + '\n'); }
  });

  bot.callbackQuery('open_card', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      await ctx.reply('\u{1F4B3} Bepul Virtual Karta!\n\n\u2705 Karta ochish BEPUL (0 so\'m)\n\u2705 Onlayn xaridlar uchun\n\nRo\'yxatdan o\'ting:',
        { reply_markup: new grammy.InlineKeyboard().url('\u{1F680} Karta Ochish', APP_LINK) });
    } catch(e) {}
  });

  bot.callbackQuery('invite', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      await ctx.reply(
        "\u{1F91D} Do'stlaringizni Taklif Qiling!\n\n" +
        "\u{1F911} Har taklif: 45 000 so'm\n" +
        '\u267E\uFE0F Limit: CHEKSIZ\n\n' +
        'Havola: ' + APP_LINK,
        { reply_markup: new grammy.InlineKeyboard().url('\u2708\uFE0F Ulashish',
          'https://t.me/share/url?url=' + encodeURIComponent(APP_LINK) +
          '&text=' + encodeURIComponent("Uzum Bank orqali 45 000 so'm ishlang!")) }
      );
    } catch(e) {}
  });

  bot.callbackQuery('opportunities', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      await ctx.reply('\u{1F31F} Imkoniyatlar\n\n\u{1F4B3} Bepul karta - 0 so\'m\n' +
        "\u{1F911} 45 000 so'm/do'st\n\u{1F6D2} Uzum Market\n\u267E\uFE0F Cheksiz!");
    } catch(e) {}
  });

  bot.callbackQuery('how_it_works', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      await ctx.reply("Qanday Ishlaydi?\n\n1. Havolani do'stingizga yuboring\n2. Do'st karta ochadi\n3. 45 000 so'm olasiz! \u{1F4B0}");
    } catch(e) {}
  });

  bot.callbackQuery('stats', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      await ctx.reply('\u{1F4CA} Statistika\n\n' +
        "10 do'st = 450 000 so'm\n50 do'st = 2 250 000 so'm\n100 do'st = 4 500 000 so'm");
    } catch(e) {}
  });

  bot.callbackQuery('support', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      await ctx.reply('Yordam: @UzumSupport | uzumbank.uz');
    } catch(e) {}
  });

  bot.on('message', async function(ctx) {
    try {
      if (ctx.message && ctx.message.text && !ctx.message.text.startsWith('/')) {
        await ctx.reply("/start buyrug'ini yuboring.");
      }
    } catch(e) {}
  });

  bot.catch(function(err) {
    process.stderr.write('[bot.catch] ' + (err && err.message ? err.message : String(err)) + '\n');
  });

  // Start with drop_pending_updates to avoid 409
  bot.start({ drop_pending_updates: true })
    .then(function() { process.stdout.write('Bot stopped\n'); })
    .catch(function(err) {
      var msg = err && err.message ? err.message : String(err);
      process.stderr.write('[bot.start catch] ' + msg + '\n');
      botRetry++;
      if (botRetry <= 10) {
        var delay = Math.min(botRetry * 10000, 60000);
        process.stdout.write('Bot retry in ' + (delay/1000) + 's...\n');
        setTimeout(function() { launchBot(grammy, botToken); }, delay);
      }
    });

  process.stdout.write('bot.start() called\n');
}
