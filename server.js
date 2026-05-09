'use strict';
  // v4.0 - webhook mode only, no polling

  process.stdout.write('=== UZUM BOT v4.0 STARTING (WEBHOOK) ===\n');

  var express = require('express');
  var cors = require('cors');
  var fs = require('fs');
  var path = require('path');

  var app = express();
  var PORT = parseInt(process.env.PORT || '8080', 10);
  var BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8609314242:AAGUIEmXzuIfvFxXEUIu_Y_bx7ijLh2MjK8';
  var WEBHOOK_DOMAIN = process.env.WEBHOOK_DOMAIN || 'uzum-bot-v2-production.up.railway.app';
  var DATA_DIR = process.env.DATA_DIR || '/data';
  var USERS_FILE = path.join(DATA_DIR, 'users.json');
  var MINI_APP_URL = process.env.MINI_APP_URL || 'https://uzum-bot-v2-production.up.railway.app/';

  app.use(express.json({ limit: '10mb' }));
  app.use(cors());
  app.get('/api/healthz', function(req, res) { res.json({ status: 'ok', mode: 'webhook', version: '4.0' }); });
  app.get('/', function(req, res) { res.json({ status: 'ok', service: 'UzumRef Bot v4.0', mode: 'webhook' }); });

  function loadDB() {
    try {
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      if (!fs.existsSync(USERS_FILE)) return { users: {} };
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch(e) { return { users: {} }; }
  }
  function saveDB(db) {
    try {
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(USERS_FILE, JSON.stringify(db, null, 2));
    } catch(e) {}
  }
  function saveUser(user, refFrom) {
    var db = loadDB();
    var isNew = !db.users[user.id];
    if (isNew) {
      db.users[user.id] = { id: user.id, name: user.first_name || '', username: user.username || '', joinedAt: new Date().toISOString(), ref: refFrom || null, referrals: 0, blocked: false };
      if (refFrom && db.users[refFrom]) db.users[refFrom].referrals = (db.users[refFrom].referrals || 0) + 1;
      saveDB(db);
    } else {
      db.users[user.id].name = user.first_name || db.users[user.id].name;
      db.users[user.id].username = user.username || db.users[user.id].username;
      db.users[user.id].blocked = false;
      saveDB(db);
    }
    return isNew;
  }
  function getStats() {
    var db = loadDB();
    var users = Object.values(db.users);
    var today = new Date().toDateString();
    return { total: users.length, today: users.filter(function(u) { return new Date(u.joinedAt).toDateString() === today; }).length };
  }

  var rateLimitMap = {};
  function isRateLimited(userId) {
    var now = Date.now();
    if (!rateLimitMap[userId]) rateLimitMap[userId] = [];
    rateLimitMap[userId] = rateLimitMap[userId].filter(function(t) { return now - t < 60000; });
    if (rateLimitMap[userId].length >= 10) return true;
    rateLimitMap[userId].push(now);
    return false;
  }

  var grammy;
  var bot;

  try { grammy = require('grammy'); } catch(e) { process.stderr.write('grammy load error: ' + e.message + '\n'); }

  if (grammy && BOT_TOKEN) {
    bot = buildBot(grammy);
    
    // Webhook route - receives updates from Telegram
    app.post('/webhook/' + BOT_TOKEN, async function(req, res) {
      try {
        await bot.handleUpdate(req.body);
        res.json({ ok: true });
      } catch(e) {
        process.stderr.write('handleUpdate error: ' + e.message + '\n');
        res.json({ ok: false });
      }
    });
  }

  app.listen(PORT, '0.0.0.0', async function() {
    process.stdout.write('HTTP server on port ' + PORT + '\n');
    
    if (!BOT_TOKEN || !grammy || !bot) {
      process.stderr.write('Bot not initialized - missing token or grammy\n');
      return;
    }

    var webhookUrl = 'https://' + WEBHOOK_DOMAIN + '/webhook/' + BOT_TOKEN;
    
    try {
      var setRes = await fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/setWebhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl, drop_pending_updates: true, max_connections: 10 })
      });
      var setData = await setRes.json();
      process.stdout.write('setWebhook: ' + JSON.stringify(setData) + '\n');
      process.stdout.write('Webhook URL: ' + webhookUrl + '\n');
    } catch(e) {
      process.stderr.write('setWebhook error: ' + e.message + '\n');
    }

    var db = loadDB();
    process.stdout.write('Users loaded: ' + Object.keys(db.users).length + '\n');
    process.stdout.write('Bot ready in WEBHOOK mode!\n');

    function sendDailyReport() {
      var s = getStats();
      bot.api.sendMessage(8787603995,
        '\u{1F4CA} Kunlik Hisobot\n\n\u{1F465} Jami: ' + s.total + '\n\u{1F195} Bugun: ' + s.today + '\n\u{1F4C5} ' + new Date().toLocaleDateString('uz-UZ')
      ).catch(function() {});
    }
    var now = new Date();
    var msUntil9 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0) - now;
    setTimeout(function() { sendDailyReport(); setInterval(sendDailyReport, 86400000); }, msUntil9);
  });

  function buildBot(grammy) {
    var APP_LINK = 'https://b.2u.uz/ref?c=50&a=L6DaizF7cl';
    var SUPPORT_USERNAME = '@uzum_bonus_admin';
    var CHANNEL_LINK = 'https://t.me/uuzum_bonus_45k';
    var CHANNEL_ID = '@uuzum_bonus_45k';
    var ADMIN_ID = 8787603995;

    var b = new grammy.Bot(BOT_TOKEN, { botInfo: undefined });

    async function isSubscribed(userId) {
      try {
        var res = await fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/getChatMember?chat_id=' + CHANNEL_ID + '&user_id=' + userId);
        var data = await res.json();
        if (!data.ok) return true;
        var s = data.result && data.result.status;
        return s === 'member' || s === 'administrator' || s === 'creator';
      } catch(e) { return true; }
    }

    function mainKb() {
      return new grammy.InlineKeyboard()
        .text('\u{1F4B3} Karta Ochish', 'open_card').text("\u{1F911} Do'st Taklif", 'invite').row()
        .text('\u{1F4CA} Imkoniyatlar', 'opportunities').text('\u{2753} Qanday Ishlaydi?', 'how_it_works').row()
        .text('\u{1F4C8} Statistika', 'stats').text('\u{1F4DE} Yordam', 'support').row()
        .text('\u{1F517} Referral', 'my_ref').row()
        .webApp("\u{1F680} Mini App'ni Ochish \u26A1\uFE0F", MINI_APP_URL).row()
        .url('\u{1F4E3} Kanalimiz', CHANNEL_LINK).row()
        .text('\u{1F310} \u0420\u0443\u0441\u0441\u043A\u0438\u0439', 'lang_ru');
    }

    function mainKbRu() {
      return new grammy.InlineKeyboard()
        .text('\u{1F4B3} \u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043A\u0430\u0440\u0442\u0443', 'open_card').text('\u{1F911} \u041F\u0440\u0438\u0433\u043B\u0430\u0441\u0438\u0442\u044C \u0434\u0440\u0443\u0433\u0430', 'invite').row()
        .text('\u{1F4CA} \u0412\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u0438', 'opportunities').text('\u2753 \u041A\u0430\u043A \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442?', 'how_it_works').row()
        .text('\u{1F4C8} \u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430', 'stats').text('\u{1F4DE} \u041F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0430', 'support').row()
        .text('\u{1F517} \u0420\u0435\u0444\u0435\u0440\u0430\u043B', 'my_ref').row()
        .webApp("\u{1F680} \u041E\u0442\u043A\u0440\u044B\u0442\u044C Mini App \u26A1\uFE0F", MINI_APP_URL).row()
        .url('\u{1F4E3} \u041D\u0430\u0448 \u043A\u0430\u043D\u0430\u043B', CHANNEL_LINK).row()
        .text("\u{1F310} O'zbek tili", 'lang_uz');
    }

    async function notifyAdmin(text) {
      try { await b.api.sendMessage(ADMIN_ID, text); } catch(e) {}
    }

    function startText(name) {
      return '\u{1F44B} Assalomu alaykum, ' + name + '!\n\n' +
        '\u{1F3E6} Uzum Bank rasmiy referral botiga xush kelibsiz!\n\n' +
        '\u2705 Bu orqali siz:\n' +
        '\u2022 Bepul virtual karta ochasiz\n' +
        "\u2022 Do'stlarni taklif qilib bonus olasiz\n" +
        "\u2022 Uzum Market'da maxsus imkoniyatlardan foydalanasiz\n\n" +
        '\u{1F4E3} Yangiliklardan xabardor bo\'lish uchun kanalimizga obuna bo\'ling!\n\n' +
        '\u{1F447} Quyidagi menyudan boshlang:';
    }

    b.command('start', async function(ctx) {
      try {
        var userId = ctx.from && ctx.from.id;
        var name = (ctx.from && ctx.from.first_name) || "Do'stim";
        var username = ctx.from && ctx.from.username ? '@' + ctx.from.username : 'username yoq';
        if (isRateLimited(userId)) return;

        var startParam = String(ctx.match || '');
        var refFrom = (startParam && startParam !== '' && startParam !== String(userId)) ? startParam : null;
        var isNew = saveUser(ctx.from, refFrom);

        var subscribed = userId === ADMIN_ID ? true : await isSubscribed(userId);

        await ctx.reply(startText(name), { reply_markup: mainKb() });

        if (!subscribed) {
          await ctx.reply(
            "\u{1F4E3} Iltimos, kanalimizga obuna bo'ling — yangiliklar va bonuslardan birinchi xabardor bo'ling!",
            { reply_markup: new grammy.InlineKeyboard().url("\u{1F4E3} Kanalga obuna bo'lish", CHANNEL_LINK) }
          );
        }

        if (isNew && userId !== ADMIN_ID) {
          await notifyAdmin('\u{1F195} Yangi foydalanuvchi!\n\u{1F464} ' + name + '\n\u{1F517} ' + username + '\n\u{1F194} ' + userId + (refFrom ? '\n\u{1F4CE} Ref: ' + refFrom : ''));
        }
      } catch(e) { process.stderr.write('/start error: ' + e.message + '\n'); }
    });

    b.command('admin', async function(ctx) {
      try {
        if (!ctx.from || ctx.from.id !== ADMIN_ID) return;
        var s = getStats();
        var db = loadDB();
        var users = Object.values(db.users);
        await ctx.reply(
          '\u{1F510} Admin Panel\n\n\u{1F465} Jami: ' + s.total + '\n\u{1F195} Bugun: ' + s.today + '\n\u{1F517} Referral qilganlar: ' + users.filter(function(u){return(u.referrals||0)>0;}).length + '\n\n/broadcast [matn] — Hammaga xabar'
        );
      } catch(e) {}
    });

    b.command('broadcast', async function(ctx) {
      try {
        if (!ctx.from || ctx.from.id !== ADMIN_ID) { await ctx.reply('\u26D4\uFE0F Faqat admin!'); return; }
        var text = ctx.match;
        if (!text || !text.trim()) { await ctx.reply('\u274C Matn kiriting: /broadcast [matn]'); return; }
        var db = loadDB();
        var users = Object.values(db.users).filter(function(u){ return !u.blocked; });
        await ctx.reply('\u{1F4E4} ' + users.length + ' ta foydalanuvchiga yuborilmoqda...');
        var sent = 0, failed = 0;
        for (var i = 0; i < users.length; i++) {
          try {
            await b.api.sendMessage(users[i].id, '\u{1F4E2} ' + text);
            sent++;
            await new Promise(function(r){ setTimeout(r, 50); });
          } catch(e) {
            failed++;
            var dbu = loadDB();
            if (dbu.users[users[i].id]) { dbu.users[users[i].id].blocked = true; saveDB(dbu); }
          }
        }
        await ctx.reply('\u2705 Yuborildi: ' + sent + '\n\u274C Xato: ' + failed);
      } catch(e) {}
    });

    b.command('stats', async function(ctx) {
      try {
        var userId = ctx.from && ctx.from.id;
        var db = loadDB();
        var user = db.users[userId];
        var myRefs = user ? (user.referrals || 0) : 0;
        await ctx.reply(
          '\u{1F4CA} Sizning Natijalaringiz\n\n\u{1F517} Taklif qilganlar: ' + myRefs + ' nafar\n\n\u{1F4A1} Qancha ko\'p taklif — shuncha ko\'p bonus!',
          { reply_markup: new grammy.InlineKeyboard().text("\u{1F911} Do'stni Taklif Qil", 'invite').row().text('\u{1F519} Orqaga', 'back_main') }
        );
      } catch(e) {}
    });

    b.command('help', async function(ctx) {
      try {
        await ctx.reply('\u{1F198} Yordam\n\n/start — Boshlanish\n/stats — Statistika\n/havola — Referral havola\n\n\u{1F468}\u200D\u{1F4BB} ' + SUPPORT_USERNAME + '\n\u{1F4E3} ' + CHANNEL_LINK);
      } catch(e) {}
    });

    b.command('havola', async function(ctx) {
      try {
        var userId = ctx.from && ctx.from.id;
        var myRefLink = 'https://t.me/' + ctx.me.username + '?start=' + userId;
        await ctx.reply(
          '\u{1F517} Sizning referral havolangiz:\n\n' + myRefLink + '\n\nDo\'stlaringizga yuboring va bonus oling!',
          { reply_markup: new grammy.InlineKeyboard().url('\u2708\uFE0F Ulashish', 'https://t.me/share/url?url=' + encodeURIComponent(myRefLink)).row().text('\u{1F519} Orqaga', 'back_main') }
        );
      } catch(e) {}
    });

    b.callbackQuery('my_ref', async function(ctx) {
      try {
        await ctx.answerCallbackQuery();
        var userId = ctx.from && ctx.from.id;
        var db = loadDB();
        var user = db.users[userId];
        var myRefs = user ? (user.referrals || 0) : 0;
        var myRefLink = 'https://t.me/' + ctx.me.username + '?start=' + userId;
        await ctx.editMessageText(
          '\u{1F517} Referral Tizimi\n\n\u{1F465} Siz taklif qilgan: ' + myRefs + ' nafar\n\n\u{1F4CE} Sizning havolangiz:\n' + myRefLink + '\n\n\u{1F4A1} Havolangizni do\'stlaringizga yuboring!',
          { reply_markup: new grammy.InlineKeyboard().url('\u2708\uFE0F Telegram orqali ulashish', 'https://t.me/share/url?url=' + encodeURIComponent(myRefLink)).row().text('\u{1F519} Orqaga', 'back_main') }
        );
      } catch(e) {}
    });

    b.callbackQuery('open_card', async function(ctx) {
      try {
        await ctx.answerCallbackQuery();
        await ctx.editMessageText(
          '\u{1F4B3} Virtual Karta Ochish\n\n\u2705 Mutlaqo bepul\n\u2705 Onlayn xaridlar uchun\n\u2705 Uzum Market imkoniyatlari\n\u2705 Cashback va bonuslar\n\n\u{1F517} Ro\'yxatdan o\'tish:',
          { reply_markup: new grammy.InlineKeyboard().url('\u{1F680} Karta Ochish \u2192', APP_LINK).row().text('\u{1F519} Orqaga', 'back_main') }
        );
      } catch(e) {}
    });

    b.callbackQuery('invite', async function(ctx) {
      try {
        await ctx.answerCallbackQuery();
        var userId = ctx.from && ctx.from.id;
        var myRefLink = 'https://t.me/' + ctx.me.username + '?start=' + userId;
        await ctx.editMessageText(
          "\u{1F91D} Do'stlarni Taklif Qiling!\n\n\u{1F4CE} Sizning havolangiz:\n" + myRefLink + "\n\n\u{1F4A1} Har bir taklif uchun bonus olasiz!",
          { reply_markup: new grammy.InlineKeyboard().url('\u2708\uFE0F Telegram orqali ulashish', 'https://t.me/share/url?url=' + encodeURIComponent(myRefLink)).row().url('\u{1F4F1} Ilovani ochish', APP_LINK).row().text('\u{1F519} Orqaga', 'back_main') }
        );
      } catch(e) {}
    });

    b.callbackQuery('opportunities', async function(ctx) {
      try {
        await ctx.answerCallbackQuery();
        await ctx.editMessageText(
          '\u{1F31F} Uzum Bank Imkoniyatlari\n\n\u{1F4B3} Bepul Virtual Karta\n\u{1F6D2} Uzum Market — maxsus chegirmalar\n\u26A1\uFE0F Tezkor to\'lovlar — 24/7\n\u{1F512} O\'zbekiston litsenziyali bank\n\u{1F91D} Referral bonus tizimi\n\u267E\uFE0F Cheksiz imkoniyatlar',
          { reply_markup: new grammy.InlineKeyboard().url('\u{1F680} Boshlash \u2192', APP_LINK).row().text('\u{1F519} Orqaga', 'back_main') }
        );
      } catch(e) {}
    });

    b.callbackQuery('how_it_works', async function(ctx) {
      try {
        await ctx.answerCallbackQuery();
        await ctx.editMessageText(
          '\u{1F4D6} Qanday Ishlaydi?\n\n' +
          '1\uFE0F\u20E3 Havolangizni oling — /start yoki \u{1F517} Referral\n\n' +
          "2\uFE0F\u20E3 Do'stingizga yuboring\n\n" +
          "3\uFE0F\u20E3 Do'stingiz ro'yxatdan o'tadi\n\n" +
          '4\uFE0F\u20E3 Bonus hisobingizga tushadi!\n\n\u2705 Juda oddiy!',
          { reply_markup: new grammy.InlineKeyboard().url('\u{1F680} Boshlash \u2192', APP_LINK).row().text('\u{1F519} Orqaga', 'back_main') }
        );
      } catch(e) {}
    });

    b.callbackQuery('stats', async function(ctx) {
      try {
        await ctx.answerCallbackQuery();
        var userId = ctx.from && ctx.from.id;
        var db = loadDB();
        var user = db.users[userId];
        var myRefs = user ? (user.referrals || 0) : 0;
        await ctx.editMessageText(
          '\u{1F4CA} Sizning Natijalaringiz\n\n\u{1F517} Taklif qilganlar: ' + myRefs + " nafar\n\n\u{1F4A1} Qancha ko'p taklif — shuncha ko'p bonus!",
          { reply_markup: new grammy.InlineKeyboard().text("\u{1F911} Do'stni Taklif Qil", 'invite').row().text('\u{1F519} Orqaga', 'back_main') }
        );
      } catch(e) {}
    });

    b.callbackQuery('support', async function(ctx) {
      try {
        await ctx.answerCallbackQuery();
        var name = (ctx.from && ctx.from.first_name) || "Do'stim";
        var userId = ctx.from && ctx.from.id;
        await ctx.editMessageText(
          '\u{1F4DE} Yordam Markazi\n\nSalom, ' + name + '!\n\n\u{1F468}\u200D\u{1F4BB} Admin: ' + SUPPORT_USERNAME + '\n\u{1F4E3} Kanal: ' + CHANNEL_LINK,
          { reply_markup: new grammy.InlineKeyboard().url('\u{1F4E9} Adminга yozish', 'https://t.me/uzum_bonus_admin').row().url('\u{1F4E3} Kanalga o\'tish', CHANNEL_LINK).row().text('\u{1F519} Orqaga', 'back_main') }
        );
      } catch(e) {}
    });

    b.callbackQuery('back_main', async function(ctx) {
      try {
        await ctx.answerCallbackQuery();
        var name = (ctx.from && ctx.from.first_name) || "Do'stim";
        await ctx.editMessageText(startText(name), { reply_markup: mainKb() });
      } catch(e) {
        try {
          await ctx.reply(startText(name), { reply_markup: mainKb() });
        } catch(e2) {}
      }
    });

    b.callbackQuery('lang_ru', async function(ctx) {
      try {
        await ctx.answerCallbackQuery();
        var name = (ctx.from && ctx.from.first_name) || '\u0414\u0440\u0443\u0433';
        await ctx.editMessageText(
          '\u{1F44B} \u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C, ' + name + '!\n\n\u{1F3E6} \u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C \u0432 \u043E\u0444\u0438\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0435\u0444\u0435\u0440\u0430\u043B\u044C\u043D\u044B\u0439 \u0431\u043E\u0442 Uzum Bank!',
          { reply_markup: mainKbRu() }
        );
      } catch(e) {}
    });

    b.callbackQuery('lang_uz', async function(ctx) {
      try {
        await ctx.answerCallbackQuery();
        var name = (ctx.from && ctx.from.first_name) || "Do'stim";
        await ctx.editMessageText(startText(name), { reply_markup: mainKb() });
      } catch(e) {}
    });

    b.on('message', async function(ctx) {
      try {
        if (!ctx.from) return;
        if (isRateLimited(ctx.from.id)) return;
        var userId = ctx.from.id;
        var name = ctx.from.first_name || "Do'stim";
        var db = loadDB();
        if (!db.users[userId]) {
          saveUser(ctx.from, null);
        }
        await ctx.reply(startText(name), { reply_markup: mainKb() });
      } catch(e) {}
    });

    return b;
  }
  