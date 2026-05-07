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
    // WEBHOOK MODE - no 409 conflicts
    var webhookPath = '/webhook/' + BOT_TOKEN;
    var webhookUrl = 'https://' + WEBHOOK_DOMAIN + webhookPath;

    // Register webhook handler
    app.use(webhookPath, grammy.webhookCallback(bot, { secretToken: undefined }));

    // Set webhook with Telegram
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
    // POLLING MODE (fallback)
    process.stdout.write('WEBHOOK_DOMAIN not set, using polling...\n');
    // Delete any existing webhook first
    try {
      await fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/deleteWebhook?drop_pending_updates=true');
    } catch(e) {}
    // Wait then start polling
    setTimeout(function() {
      bot.start({ drop_pending_updates: true })
        .catch(function(e) { process.stderr.write('polling error: ' + e.message + '\n'); });
    }, 3000);
  }
});

function buildBot() {
  var APP_LINK = 'https://b.2u.uz/ref?c=50&a=L6DaizF7cl';
  var BOT_LINK = 'https://t.me/UzumBankRbot?start=L6DaizF7cl';
  var ADMIN_ID = 8787603995;
  var MINI_APP_URL = process.env.MINI_APP_URL || '';

  var b = new grammy.Bot(BOT_TOKEN);

  b.command('start', async function(ctx) {
    try {
      var name = (ctx.from && ctx.from.first_name) || "Do'stim";
      var userId = ctx.from && ctx.from.id;
      var username = (ctx.from && ctx.from.username) ? '@' + ctx.from.username : 'yoq';
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
        '  \u{1F4B3} Bepul virtual karta\n' +
        "  \u{1F911} Har do'st uchun 45 000 so'm\n" +
        '  \u267E\uFE0F Cheksiz daromad\n\n' +
        '\u{1F447} Menyudan tanlang:',
        { reply_markup: kb }
      );
      if (userId && userId !== ADMIN_ID) {
        try { await b.api.sendMessage(ADMIN_ID, '\u{1F195} ' + name + ' ' + username + ' ID:' + userId); } catch(e) {}
      }
    } catch(e) { process.stderr.write('/start: ' + e.message + '\n'); }
  });

  b.callbackQuery('open_card', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      await ctx.reply('\u{1F4B3} Bepul Virtual Karta!\n\n\u2705 Karta ochish BEPUL (0 so\'m)\n\u2705 Onlayn xaridlar uchun\n\nRo\'yxatdan o\'ting:',
        { reply_markup: new grammy.InlineKeyboard().url('\u{1F680} Karta Ochish', APP_LINK) });
    } catch(e) {}
  });

  b.callbackQuery('invite', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      await ctx.reply(
        "\u{1F91D} Do'stlaringizni Taklif Qiling!\n\n" +
        "\u{1F911} Har taklif: 45 000 so'm\n" +
        '\u267E\uFE0F CHEKSIZ\n\nHavola: ' + APP_LINK,
        { reply_markup: new grammy.InlineKeyboard().url('\u2708\uFE0F Ulashish',
          'https://t.me/share/url?url=' + encodeURIComponent(APP_LINK) +
          '&text=' + encodeURIComponent("Uzum Bank orqali 45 000 so'm ishlang!")) }
      );
    } catch(e) {}
  });

  b.callbackQuery('opportunities', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      await ctx.reply('\u{1F31F} Imkoniyatlar\n\n\u{1F4B3} Bepul karta - 0 so\'m\n' +
        "\u{1F911} 45 000 so'm/do'st\n\u{1F6D2} Uzum Market\n\u267E\uFE0F Cheksiz!");
    } catch(e) {}
  });

  b.callbackQuery('how_it_works', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      await ctx.reply("Qanday Ishlaydi?\n\n1. Havolani do'stingizga yuboring\n2. Do'st karta ochadi\n3. 45 000 so'm olasiz! \u{1F4B0}");
    } catch(e) {}
  });

  b.callbackQuery('stats', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      await ctx.reply('\u{1F4CA} Statistika\n\n' +
        "10 do'st = 450 000 so'm\n50 do'st = 2 250 000 so'm\n100 do'st = 4 500 000 so'm");
    } catch(e) {}
  });

  b.callbackQuery('support', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      await ctx.reply('\u{1F4DE} Yordam: @UzumSupport | uzumbank.uz');
    } catch(e) {}
  });

  b.on('message', async function(ctx) {
    try {
      if (ctx.message && ctx.message.text && !ctx.message.text.startsWith('/')) {
        await ctx.reply("/start buyrug'ini yuboring.");
      }
    } catch(e) {}
  });

  b.catch(function(err) {
    process.stderr.write('[bot.catch] ' + (err && err.message ? err.message : String(err)) + '\n');
  });

  return b;
}
