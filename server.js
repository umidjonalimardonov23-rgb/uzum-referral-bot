'use strict';
// v3.0 - full features: user db, channel check, broadcast, referral, daily report, spam protection

process.stdout.write('=== UZUM BOT v3.0 STARTING ===\n');

var express = require('express');
var cors = require('cors');
var fs = require('fs');
var path = require('path');

var app = express();
var PORT = parseInt(process.env.PORT || '8080', 10);
var BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
var DATA_DIR = process.env.DATA_DIR || '/data';
var USERS_FILE = path.join(DATA_DIR, 'users.json');

app.use(express.json({ limit: '10mb' }));
app.use(cors());

app.get('/api/healthz', function(req, res) {
  var db = loadDB();
  res.json({ status: 'ok', time: new Date().toISOString(), users: Object.keys(db.users).length });
});
app.get('/', function(req, res) { res.json({ status: 'ok', service: 'UzumRef Bot v3.0' }); });

// ============ USER DATABASE ============
function loadDB() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(USERS_FILE)) return { users: {}, broadcasts: [] };
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch(e) { return { users: {}, broadcasts: [] }; }
}
function saveDB(db) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify(db, null, 2));
  } catch(e) { process.stderr.write('saveDB error: ' + e.message + '\n'); }
}
function saveUser(user, refFrom) {
  var db = loadDB();
  var isNew = !db.users[user.id];
  if (isNew) {
    db.users[user.id] = {
      id: user.id,
      name: user.first_name || '',
      username: user.username || '',
      joinedAt: new Date().toISOString(),
      ref: refFrom || null,
      blocked: false
    };
    if (refFrom && db.users[refFrom]) {
      db.users[refFrom].referrals = (db.users[refFrom].referrals || 0) + 1;
    }
    saveDB(db);
  } else {
    db.users[user.id].name = user.first_name || db.users[user.id].name;
    db.users[user.id].username = user.username || db.users[user.id].username;
    db.users[user.id].blocked = false;
    saveDB(db);
  }
  return isNew;
}
function getAllUsers() {
  var db = loadDB();
  return Object.values(db.users).filter(function(u) { return !u.blocked; });
}
function getStats() {
  var db = loadDB();
  var users = Object.values(db.users);
  var today = new Date().toDateString();
  var todayCount = users.filter(function(u) { return new Date(u.joinedAt).toDateString() === today; }).length;
  return { total: users.length, today: todayCount };
}

// ============ SPAM PROTECTION ============
var rateLimitMap = {};
function isRateLimited(userId) {
  var now = Date.now();
  if (!rateLimitMap[userId]) rateLimitMap[userId] = [];
  rateLimitMap[userId] = rateLimitMap[userId].filter(function(t) { return now - t < 60000; });
  if (rateLimitMap[userId].length >= 10) return true;
  rateLimitMap[userId].push(now);
  return false;
}

app.listen(PORT, '0.0.0.0', async function() {
  process.stdout.write('HTTP server running on port ' + PORT + '\n');

  if (!BOT_TOKEN) {
    process.stdout.write('No TELEGRAM_BOT_TOKEN, bot disabled\n');
    return;
  }

  var grammy;
  try { grammy = require('grammy'); } catch(e) {
    process.stderr.write('grammy error: ' + e.message + '\n'); return;
  }

  try {
    await fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/deleteWebhook?drop_pending_updates=true');
    process.stdout.write('Webhook cleared\n');
  } catch(e) {}

  var bot = buildBot(grammy);
  var db = loadDB();
  process.stdout.write('DB loaded: ' + Object.keys(db.users).length + ' users\n');

  // ============ DAILY REPORT ============
  function sendDailyReport() {
    var stats = getStats();
    var msg = '📊 Kunlik Hisobot\n\n' +
      '👥 Jami foydalanuvchilar: ' + stats.total + '\n' +
      '🆕 Bugun qo\'shildi: ' + stats.today + '\n' +
      '📅 Sana: ' + new Date().toLocaleDateString('uz-UZ') + '\n' +
      '⏰ Vaqt: ' + new Date().toLocaleTimeString('uz-UZ');
    bot.api.sendMessage(8787603995, msg).catch(function() {});
  }

  // Har 24 soatda hisobot
  var now = new Date();
  var msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0) - now;
  setTimeout(function() {
    sendDailyReport();
    setInterval(sendDailyReport, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);

  setTimeout(function() {
    bot.start({ drop_pending_updates: true })
      .catch(function(e) { process.stderr.write('polling error: ' + e.message + '\n'); });
    process.stdout.write('Bot polling started!\n');
  }, 2000);
});

function buildBot(grammy) {
  var APP_LINK = 'https://b.2u.uz/ref?c=50&a=L6DaizF7cl';
  var BOT_LINK = 'https://t.me/UzumBankRbot?start=L6DaizF7cl';
  var SUPPORT_USERNAME = '@uzum_bonus_admin';
  var CHANNEL_LINK = 'https://t.me/uuzum_bonus_45k';
  var CHANNEL_ID = '@uuzum_bonus_45k';
  var ADMIN_ID = 8787603995;
  var MINI_APP_URL = process.env.MINI_APP_URL || '';

  var b = new grammy.Bot(BOT_TOKEN);

  // ============ CHANNEL CHECK ============
  async function isSubscribed(userId) {
    try {
      var res = await fetch(
        'https://api.telegram.org/bot' + BOT_TOKEN +
        '/getChatMember?chat_id=' + CHANNEL_ID + '&user_id=' + userId
      );
      var data = await res.json();
      var status = data.result && data.result.status;
      return status === 'member' || status === 'administrator' || status === 'creator';
    } catch(e) { return true; }
  }

  async function requireSubscription(ctx) {
    var userId = ctx.from && ctx.from.id;
    if (userId === ADMIN_ID) return true;
    var subscribed = await isSubscribed(userId);
    if (!subscribed) {
      await ctx.reply(
        '📣 Botdan foydalanish uchun kanalimizga obuna bo\'ling!\n\n' +
        'Obuna bo\'lgach, /start bosing.',
        {
          reply_markup: new grammy.InlineKeyboard()
            .url('📣 Kanalga obuna bo\'lish', CHANNEL_LINK).row()
            .text('✅ Obuna bo\'ldim', 'check_sub')
        }
      );
      return false;
    }
    return true;
  }

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

  // ============ /start ============
  b.command('start', async function(ctx) {
    try {
      var userId = ctx.from && ctx.from.id;
      var name = (ctx.from && ctx.from.first_name) || "Do'stim";
      var username = (ctx.from && ctx.from.username) ? '@' + ctx.from.username : 'username yoq';

      if (isRateLimited(userId)) return;

      var ok = await requireSubscription(ctx);
      if (!ok) return;

      // Referral parametrini aniqlash
      var startParam = ctx.match || '';
      var refFrom = null;
      if (startParam && startParam !== '' && startParam !== String(userId)) {
        refFrom = startParam;
      }

      var isNew = saveUser(ctx.from, refFrom);

      // Shaxsiy referral havola
      var myRefLink = 'https://t.me/' + ctx.me.username + '?start=' + userId;
      var myAppLink = APP_LINK + '&ref=' + userId;

      await ctx.reply(
        '⚡️ Assalomu alaykum, ' + name + '! ⚡️\n\n' +
        '💰 Uzum Bank Referral Dasturiga xush kelibsiz!\n\n' +
        '🌟 Nima olasiz:\n' +
        '• 💳 Bepul virtual karta — 0 soʻmga\n' +
        '• 🤑 Har bir doʻst uchun 45 000 soʻm\n' +
        '• 🛒 Uzum Marketda maxsus narxlar\n' +
        '• ♾️ Cheksiz daromad imkoniyati\n\n' +
        '🔗 Sizning referral havolangiz:\n' + myRefLink + '\n\n' +
        '👇 Menyudan tanlang:',
        { reply_markup: mainKb() }
      );

      if (isNew && userId !== ADMIN_ID) {
        var refText = refFrom ? '\n🔗 Ref: ' + refFrom : '';
        await notifyAdmin('🆕 Yangi foydalanuvchi!\n\n👤 ' + name + '\n🔗 ' + username + '\n🆔 ' + userId + refText);
      }
    } catch(e) { process.stderr.write('/start: ' + e.message + '\n'); }
  });

  // ============ /admin ============
  b.command('admin', async function(ctx) {
    try {
      if (!ctx.from || ctx.from.id !== ADMIN_ID) return;
      var stats = getStats();
      var db = loadDB();
      var users = Object.values(db.users);
      var withRefs = users.filter(function(u) { return (u.referrals || 0) > 0; }).length;
      await ctx.reply(
        '🔐 Admin Panel\n\n' +
        '👥 Jami foydalanuvchilar: ' + stats.total + '\n' +
        '🆕 Bugun: ' + stats.today + '\n' +
        '🔗 Referral qilganlar: ' + withRefs + '\n\n' +
        '📌 Buyruqlar:\n' +
        '/broadcast [matn] — Hammaga xabar\n' +
        '/stats — Statistika\n' +
        '/admin — Admin panel'
      );
    } catch(e) {}
  });

  // ============ /broadcast ============
  b.command('broadcast', async function(ctx) {
    try {
      if (!ctx.from || ctx.from.id !== ADMIN_ID) {
        await ctx.reply('⛔️ Bu buyruq faqat admin uchun!');
        return;
      }
      var text = ctx.match;
      if (!text || text.trim() === '') {
        await ctx.reply('❌ Xabar matni kiriting:\n/broadcast [matn]');
        return;
      }
      var users = getAllUsers();
      var sent = 0, failed = 0;
      await ctx.reply('📤 ' + users.length + ' ta foydalanuvchiga yuborilmoqda...');
      for (var i = 0; i < users.length; i++) {
        try {
          await b.api.sendMessage(users[i].id, '📢 ' + text);
          sent++;
          await new Promise(function(r) { setTimeout(r, 50); });
        } catch(e) {
          failed++;
          if (e.message && e.message.includes('blocked')) {
            var db = loadDB();
            if (db.users[users[i].id]) {
              db.users[users[i].id].blocked = true;
              saveDB(db);
            }
          }
        }
      }
      await ctx.reply('✅ Yuborildi: ' + sent + '\n❌ Yuborilmadi: ' + failed);
    } catch(e) { process.stderr.write('/broadcast: ' + e.message + '\n'); }
  });

  // ============ /stats ============
  b.command('stats', async function(ctx) {
    try {
      var userId = ctx.from && ctx.from.id;
      var db = loadDB();
      var user = db.users[userId];
      var myRefs = user ? (user.referrals || 0) : 0;
      var myEarnings = myRefs * 45000;
      await ctx.reply(
        '📊 Sizning Statistikangiz\n\n' +
        '🔗 Taklif qilganlar: ' + myRefs + ' ta\n' +
        "💰 Taxminiy daromad: " + myEarnings.toLocaleString() + " so'm\n\n" +
        '📈 Umumiy:\n' +
        "🤑 10 do'st = 450 000 so'm\n" +
        "🤑 50 do'st = 2 250 000 so'm\n" +
        "🤑 100 do'st = 4 500 000 so'm\n\n" +
        '💡 Ko\'proq taklif qiling!',
        { reply_markup: new grammy.InlineKeyboard().text("🤑 Do'stni Taklif Qil", 'invite').row().text('🔙 Orqaga', 'back_main') }
      );
    } catch(e) {}
  });

  // ============ /help ============
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

  // ============ /havola ============
  b.command('havola', async function(ctx) {
    try {
      var userId = ctx.from && ctx.from.id;
      var myRefLink = 'https://t.me/' + (ctx.me ? ctx.me.username : 'UzumBonusBot') + '?start=' + userId;
      await ctx.reply(
        '🔗 Sizning Referral Havolalaringiz:\n\n' +
        '🤖 Bot havola:\n' + myRefLink + '\n\n' +
        '📱 App havola:\n' + APP_LINK + '\n\n' +
        '💰 Har bir do\'st uchun 45 000 so\'m!',
        { reply_markup: new grammy.InlineKeyboard().url('📱 App', APP_LINK).row().text('✈️ Ulashish', 'invite') }
      );
    } catch(e) {}
  });

  // ============ CALLBACKS ============
  b.callbackQuery('check_sub', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      var userId = ctx.from && ctx.from.id;
      var subscribed = await isSubscribed(userId);
      if (subscribed) {
        var name = (ctx.from && ctx.from.first_name) || "Do'stim";
        var myRefLink = 'https://t.me/' + ctx.me.username + '?start=' + userId;
        saveUser(ctx.from, null);
        await ctx.reply(
          '✅ Rahmat! Kanalga obuna bo\'ldingiz!\n\n' +
          '⚡️ Assalomu alaykum, ' + name + '!\n\n' +
          '🔗 Sizning referral havolangiz:\n' + myRefLink + '\n\n' +
          '👇 Menyudan tanlang:',
          { reply_markup: mainKb() }
        );
      } else {
        await ctx.answerCallbackQuery('❌ Hali obuna bo\'lmadingiz!', { show_alert: true });
      }
    } catch(e) {}
  });

  b.callbackQuery('open_card', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      if (isRateLimited(ctx.from && ctx.from.id)) return;
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
      if (isRateLimited(ctx.from && ctx.from.id)) return;
      var userId = ctx.from && ctx.from.id;
      var myRefLink = 'https://t.me/' + ctx.me.username + '?start=' + userId;
      var shareText = encodeURIComponent("⚡️ Do'stim, bugun Uzum Bank ilovasini yuklab, bepul virtual karta oching!\n\n💰 45 000 so'm bonus!\n\n📱 " + APP_LINK);
      await ctx.reply(
        "🤝 Do'stlaringizni Taklif Qiling!\n\n" +
        "🤑 Har taklif: 45 000 so'm\n" +
        '♾️ Limit: CHEKSIZ\n\n' +
        '🔗 Sizning havolangiz:\n' + myRefLink,
        {
          reply_markup: new grammy.InlineKeyboard()
            .url('✈️ Telegramda Ulashish', 'https://t.me/share/url?url=' + encodeURIComponent(myRefLink) + '&text=' + shareText).row()
            .url('📱 App', APP_LINK).row()
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
        '1️⃣ /start bosib havolangizni oling\n\n' +
        '2️⃣ Havolani do\'stingizga yuboring\n\n' +
        '3️⃣ Do\'st botga kiradi va karta ochadi\n\n' +
        "4️⃣ 45 000 so'm hisobingizga tushadi! 💰\n\n" +
        "✅ Qancha ko'p do'st — shuncha ko'p pul!",
        { reply_markup: new grammy.InlineKeyboard().url('🚀 Boshlash →', APP_LINK).row().text('🔙 Orqaga', 'back_main') }
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
      var myEarnings = myRefs * 45000;
      await ctx.reply(
        '📊 Sizning Statistikangiz\n\n' +
        '🔗 Taklif qilganlar: ' + myRefs + ' ta\n' +
        "💰 Taxminiy daromad: " + myEarnings.toLocaleString() + " so'm\n\n" +
        '📈 Umumiy:\n' +
        "🤑 10 do'st = 450 000 so'm\n" +
        "🤑 50 do'st = 2 250 000 so'm\n\n" +
        '💡 Ko\'proq taklif qiling!',
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
      if (userId && userId !== ADMIN_ID) {
        await notifyAdmin('📞 Yordam so\'raldi!\n\n👤 ' + name + '\n🔗 ' + username + '\n🆔 ' + userId);
      }
    } catch(e) {}
  });

  b.callbackQuery('back_main', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      var userId = ctx.from && ctx.from.id;
      var name = (ctx.from && ctx.from.first_name) || "Do'stim";
      var myRefLink = 'https://t.me/' + ctx.me.username + '?start=' + userId;
      await ctx.reply(
        '⚡️ Assalomu alaykum, ' + name + '! ⚡️\n\n' +
        '💰 Uzum Bank Referral Dasturiga xush kelibsiz!\n\n' +
        '🔗 Sizning referral havolangiz:\n' + myRefLink + '\n\n' +
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
        '⚡️ Assalomu alaykum, ' + name + '!\n\n' +
        '👇 Menyudan tanlang:',
        { reply_markup: mainKb() }
      );
    } catch(e) {}
  });

  b.on('message', async function(ctx) {
    try {
      var userId = ctx.from && ctx.from.id;
      if (isRateLimited(userId)) {
        await ctx.reply('⚠️ Juda tez xabar yuboryapsiz. Biroz kuting.');
        return;
      }
      if (ctx.message && ctx.message.text && !ctx.message.text.startsWith('/')) {
        await ctx.reply("👋 Salom! /start bosing yoki menyudan foydalaning.", { reply_markup: mainKb() });
      }
    } catch(e) {}
  });

  b.catch(function(err) {
    process.stderr.write('[bot.catch] ' + (err && err.message ? err.message : String(err)) + '\n');
  });

  return b;
}
