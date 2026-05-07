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
  startBot();
});

function startBot() {
  var botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    process.stdout.write('TELEGRAM_BOT_TOKEN not set, bot disabled\n');
    return;
  }
  var grammy;
  try { grammy = require('grammy'); } catch(e) {
    process.stderr.write('grammy error: ' + e.message + '\n');
    return;
  }
  var APP_LINK = 'https://b.2u.uz/ref?c=50&a=L6DaizF7cl';
  var BOT_LINK = 'https://t.me/UzumBankRbot?start=L6DaizF7cl';
  var ADMIN_ID = 8787603995;
  var MINI_APP_URL = process.env.MINI_APP_URL || '';
  var bot = new grammy.Bot(botToken);

  bot.command('start', async function(ctx) {
    var name = (ctx.from && ctx.from.first_name) || "Do'stim";
    var userId = ctx.from && ctx.from.id;
    var username = (ctx.from && ctx.from.username) ? '@' + ctx.from.username : 'yoq';
    var kb = new grammy.InlineKeyboard()
      .text('Karta Ochish', 'open_card')
      .text("Do'st Taklif", 'invite').row()
      .text('Imkoniyatlar', 'opportunities')
      .text('Qanday Ishlaydi?', 'how_it_works').row()
      .text('Statistika', 'stats')
      .text('Yordam', 'support');
    if (MINI_APP_URL) kb.row().webApp('Mini App', MINI_APP_URL);
    await ctx.reply(
      'Assalomu alaykum, ' + name + '!\n\n' +
      'Uzum Bank Referral Dasturi\n\n' +
      'Har bir do\'st uchun 45 000 so\'m!\n\n' +
      'Menyudan tanlang:',
      { reply_markup: kb }
    );
    if (userId && userId !== ADMIN_ID) {
      try {
        await bot.api.sendMessage(ADMIN_ID, 'Yangi: ' + name + ' ' + username + ' ID:' + userId);
      } catch(e) {}
    }
  });

  bot.callbackQuery('open_card', async function(ctx) {
    await ctx.answerCallbackQuery();
    await ctx.reply(
      'Bepul Virtual Karta! Karta ochish BEPUL (0 so\'m)\n\nHavola:',
      { reply_markup: new grammy.InlineKeyboard().url('Karta Ochish', APP_LINK) }
    );
  });

  bot.callbackQuery('invite', async function(ctx) {
    await ctx.answerCallbackQuery();
    await ctx.reply(
      "Do'stlaringizni Taklif Qiling!\n\nHar taklif: 45 000 so'm\n\nHavola: " + APP_LINK,
      { reply_markup: new grammy.InlineKeyboard().url('Ulashish', 'https://t.me/share/url?url=' + encodeURIComponent(APP_LINK)) }
    );
  });

  bot.callbackQuery('opportunities', async function(ctx) {
    await ctx.answerCallbackQuery();
    await ctx.reply('Imkoniyatlar:\n- Bepul karta\n- 45 000 so\'m/do\'st\n- Cashback\n- Cheksiz!');
  });

  bot.callbackQuery('how_it_works', async function(ctx) {
    await ctx.answerCallbackQuery();
    await ctx.reply('1. Havolani yuboring\n2. Do\'st karta ochadi\n3. 45 000 so\'m olasiz!');
  });

  bot.callbackQuery('stats', async function(ctx) {
    await ctx.answerCallbackQuery();
    await ctx.reply('10 ta = 450 000\n50 ta = 2 250 000\n100 ta = 4 500 000 so\'m');
  });

  bot.callbackQuery('support', async function(ctx) {
    await ctx.answerCallbackQuery();
    await ctx.reply('Yordam: @UzumSupport | uzumbank.uz');
  });

  bot.on('message', async function(ctx) {
    if (ctx.message && ctx.message.text && !ctx.message.text.startsWith('/')) {
      await ctx.reply('/start yuboring');
    }
  });

  bot.catch(function(err) {
    process.stderr.write('Bot error: ' + String(err) + '\n');
  });

  bot.start({ onStart: function() { process.stdout.write('Telegram bot started!\n'); } });
  process.stdout.write('Bot.start() called\n');
}
