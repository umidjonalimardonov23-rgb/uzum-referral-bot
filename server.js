'use strict';
// v3.1 - mini app fixed, soft channel check, clean start

process.stdout.write('=== UZUM BOT v3.1 STARTING ===\n');

var express = require('express');
var cors = require('cors');
var fs = require('fs');
var path = require('path');

var app = express();
var PORT = parseInt(process.env.PORT || '8080', 10);
var BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
var DATA_DIR = process.env.DATA_DIR || '/data';
var USERS_FILE = path.join(DATA_DIR, 'users.json');
var MINI_APP_URL = process.env.MINI_APP_URL || 'https://uzum-bot-v2-production.up.railway.app/';

app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.get('/api/healthz', function(req, res) { res.json({ status: 'ok' }); });
app.get('/', function(req, res) { res.json({ status: 'ok', service: 'UzumRef Bot v3.1' }); });

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

app.listen(PORT, '0.0.0.0', async function() {
  process.stdout.write('HTTP server on port ' + PORT + '\n');
  if (!BOT_TOKEN) { process.stdout.write('No token\n'); return; }

  var grammy;
  try { grammy = require('grammy'); } catch(e) { process.stderr.write('grammy: ' + e.message + '\n'); return; }

  try { await fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/deleteWebhook?drop_pending_updates=true'); } catch(e) {}

  var bot = buildBot(grammy);
  var db = loadDB();
  process.stdout.write('Users: ' + Object.keys(db.users).length + '\n');

  function sendDailyReport() {
    var s = getStats();
    bot.api.sendMessage(8787603995,
      '📊 Kunlik Hisobot\n\n👥 Jami: ' + s.total + '\n🆕 Bugun: ' + s.today + '\n📅 ' + new Date().toLocaleDateString('uz-UZ')
    ).catch(function() {});
  }
  var now = new Date();
  var msUntil9 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0) - now;
  setTimeout(function() { sendDailyReport(); setInterval(sendDailyReport, 86400000); }, msUntil9);

  setTimeout(function() {
    bot.start({ drop_pending_updates: true }).catch(function(e) { process.stderr.write('poll: ' + e.message + '\n'); });
    process.stdout.write('Bot started!\n');
  }, 2000);
});

function buildBot(grammy) {
  var APP_LINK = 'https://b.2u.uz/ref?c=50&a=L6DaizF7cl';
  var SUPPORT_USERNAME = '@uzum_bonus_admin';
  var CHANNEL_LINK = 'https://t.me/uuzum_bonus_45k';
  var CHANNEL_ID = '@uuzum_bonus_45k';
  var ADMIN_ID = 8787603995;

  var b = new grammy.Bot(BOT_TOKEN);

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
      .text('💳 Karta Ochish', 'open_card').text('🤑 Do\'st Taklif', 'invite').row()
      .text('📊 Imkoniyatlar', 'opportunities').text('❓ Qanday Ishlaydi?', 'how_it_works').row()
      .text('📈 Statistika', 'stats').text('📞 Yordam', 'support').row()
      .text('🔗 Referral', 'my_ref').row()
      .webApp('🚀 Mini App\'ni Ochish ⚡️', MINI_APP_URL).row()
      .url('📣 Kanalimiz', CHANNEL_LINK).row()
      .text('🌐 Русский', 'lang_ru');
  }

  function mainKbRu() {
    return new grammy.InlineKeyboard()
      .text('💳 Открыть карту', 'open_card').text('🤑 Пригласить друга', 'invite').row()
      .text('📊 Возможности', 'opportunities').text('❓ Как работает?', 'how_it_works').row()
      .text('📈 Статистика', 'stats').text('📞 Поддержка', 'support').row()
      .text('🔗 Реферал', 'my_ref').row()
      .webApp('🚀 Открыть Mini App ⚡️', MINI_APP_URL).row()
      .url('📣 Наш канал', CHANNEL_LINK).row()
      .text('🌐 O\'zbek tili', 'lang_uz');
  }

  async function notifyAdmin(text) {
    try { await b.api.sendMessage(ADMIN_ID, text); } catch(e) {}
  }

  function startText(name) {
    return '👋 Assalomu alaykum, ' + name + '!\n\n' +
      '🏦 Uzum Bank rasmiy referral botiga xush kelibsiz!\n\n' +
      '✅ Bu orqali siz:\n' +
      '• Bepul virtual karta ochasiz\n' +
      '• Do\'stlarni taklif qilib bonus olasiz\n' +
      '• Uzum Market\'da maxsus imkoniyatlardan foydalanasiz\n\n' +
      '📣 Yangiliklardan xabardor bo\'lish uchun kanalimizga obuna bo\'ling!\n\n' +
      '👇 Quyidagi menyudan boshlang:';
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
          '📣 Iltimos, kanalimizga obuna bo\'ling — yangiliklar va bonuslardan birinchi xabardor bo\'ling!',
          { reply_markup: new grammy.InlineKeyboard().url('📣 Kanalga obuna bo\'lish', CHANNEL_LINK) }
        );
      }

      if (isNew && userId !== ADMIN_ID) {
        await notifyAdmin('🆕 Yangi foydalanuvchi!\n👤 ' + name + '\n🔗 ' + username + '\n🆔 ' + userId + (refFrom ? '\n📎 Ref: ' + refFrom : ''));
      }
    } catch(e) { process.stderr.write('/start: ' + e.message + '\n'); }
  });

  b.command('admin', async function(ctx) {
    try {
      if (!ctx.from || ctx.from.id !== ADMIN_ID) return;
      var s = getStats();
      var db = loadDB();
      var users = Object.values(db.users);
      await ctx.reply(
        '🔐 Admin Panel\n\n👥 Jami: ' + s.total + '\n🆕 Bugun: ' + s.today + '\n🔗 Referral qilganlar: ' + users.filter(function(u){return(u.referrals||0)>0;}).length + '\n\n/broadcast [matn] — Hammaga xabar'
      );
    } catch(e) {}
  });

  b.command('broadcast', async function(ctx) {
    try {
      if (!ctx.from || ctx.from.id !== ADMIN_ID) { await ctx.reply('⛔️ Faqat admin!'); return; }
      var text = ctx.match;
      if (!text || !text.trim()) { await ctx.reply('❌ Matn kiriting: /broadcast [matn]'); return; }
      var db = loadDB();
      var users = Object.values(db.users).filter(function(u){ return !u.blocked; });
      await ctx.reply('📤 ' + users.length + ' ta foydalanuvchiga yuborilmoqda...');
      var sent = 0, failed = 0;
      for (var i = 0; i < users.length; i++) {
        try {
          await b.api.sendMessage(users[i].id, '📢 ' + text);
          sent++;
          await new Promise(function(r){ setTimeout(r, 50); });
        } catch(e) {
          failed++;
          var dbu = loadDB();
          if (dbu.users[users[i].id]) { dbu.users[users[i].id].blocked = true; saveDB(dbu); }
        }
      }
      await ctx.reply('✅ Yuborildi: ' + sent + '\n❌ Xato: ' + failed);
    } catch(e) {}
  });

  b.command('stats', async function(ctx) {
    try {
      var userId = ctx.from && ctx.from.id;
      var db = loadDB();
      var user = db.users[userId];
      var myRefs = user ? (user.referrals || 0) : 0;
      await ctx.reply(
        '📊 Sizning Natijalaringiz\n\n🔗 Taklif qilganlar: ' + myRefs + ' nafar\n\n💡 Qancha ko\'p taklif — shuncha ko\'p bonus!',
        { reply_markup: new grammy.InlineKeyboard().text("🤑 Do'stni Taklif Qil", 'invite').row().text('🔙 Orqaga', 'back_main') }
      );
    } catch(e) {}
  });

  b.command('help', async function(ctx) {
    try {
      await ctx.reply('🆘 Yordam\n\n/start — Boshlanish\n/stats — Statistika\n/havola — Referral havola\n\n👨‍💼 ' + SUPPORT_USERNAME + '\n📣 ' + CHANNEL_LINK);
    } catch(e) {}
  });

  b.command('havola', async function(ctx) {
    try {
      var userId = ctx.from && ctx.from.id;
      var myRefLink = 'https://t.me/' + ctx.me.username + '?start=' + userId;
      await ctx.reply(
        '🔗 Sizning referral havolangiz:\n\n' + myRefLink + '\n\nDo\'stlaringizga yuboring va bonus oling!',
        { reply_markup: new grammy.InlineKeyboard().url('✈️ Ulashish', 'https://t.me/share/url?url=' + encodeURIComponent(myRefLink)).row().text('🔙 Orqaga', 'back_main') }
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
      await ctx.reply(
        '🔗 Referral Tizimi\n\n' +
        '👥 Siz taklif qilgan: ' + myRefs + ' nafar\n\n' +
        '📎 Sizning havolangiz:\n' + myRefLink + '\n\n' +
        '💡 Havolangizni do\'stlaringizga yuboring!',
        {
          reply_markup: new grammy.InlineKeyboard()
            .url('✈️ Telegram orqali ulashish', 'https://t.me/share/url?url=' + encodeURIComponent(myRefLink)).row()
            .text('🔙 Orqaga', 'back_main')
        }
      );
    } catch(e) {}
  });

  b.callbackQuery('open_card', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      await ctx.reply(
        '💳 Virtual Karta Ochish\n\n✅ Mutlaqo bepul\n✅ Onlayn xaridlar uchun\n✅ Uzum Market imkoniyatlari\n✅ Cashback va bonuslar\n\n🔗 Ro\'yxatdan o\'tish:',
        { reply_markup: new grammy.InlineKeyboard().url('🚀 Karta Ochish →', APP_LINK).row().text('🔙 Orqaga', 'back_main') }
      );
    } catch(e) {}
  });

  b.callbackQuery('invite', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      var userId = ctx.from && ctx.from.id;
      var myRefLink = 'https://t.me/' + ctx.me.username + '?start=' + userId;
      await ctx.reply(
        "🤝 Do'stlarni Taklif Qiling!\n\n" +
        '📎 Sizning havolangiz:\n' + myRefLink + '\n\n' +
        '💡 Har bir taklif uchun bonus olasiz!',
        {
          reply_markup: new grammy.InlineKeyboard()
            .url('✈️ Telegram orqali ulashish', 'https://t.me/share/url?url=' + encodeURIComponent(myRefLink)).row()
            .url('📱 Ilovani ochish', APP_LINK).row()
            .text('🔙 Orqaga', 'back_main')
        }
      );
    } catch(e) {}
  });

  b.callbackQuery('opportunities', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      await ctx.reply(
        '🌟 Uzum Bank Imkoniyatlari\n\n💳 Bepul Virtual Karta\n🛒 Uzum Market — maxsus chegirmalar\n⚡️ Tezkor to\'lovlar — 24/7\n🔒 O\'zbekiston litsenziyali bank\n🤝 Referral bonus tizimi\n♾️ Cheksiz imkoniyatlar',
        { reply_markup: new grammy.InlineKeyboard().url('🚀 Boshlash →', APP_LINK).row().text('🔙 Orqaga', 'back_main') }
      );
    } catch(e) {}
  });

  b.callbackQuery('how_it_works', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      await ctx.reply(
        '📖 Qanday Ishlaydi?\n\n' +
        '1️⃣ Havolangizni oling — /start yoki 🔗 Referral\n\n' +
        '2️⃣ Do\'stingizga yuboring\n\n' +
        '3️⃣ Do\'stingiz ro\'yxatdan o\'tadi\n\n' +
        '4️⃣ Bonus hisobingizga tushadi!\n\n' +
        '✅ Juda oddiy!',
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
      await ctx.reply(
        '📊 Sizning Natijalaringiz\n\n🔗 Taklif qilganlar: ' + myRefs + ' nafar\n\n💡 Qancha ko\'p taklif — shuncha ko\'p bonus!',
        { reply_markup: new grammy.InlineKeyboard().text("🤑 Do'stni Taklif Qil", 'invite').row().text('🔙 Orqaga', 'back_main') }
      );
    } catch(e) {}
  });

  b.callbackQuery('support', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      var name = (ctx.from && ctx.from.first_name) || "Do'stim";
      var username = ctx.from && ctx.from.username ? '@' + ctx.from.username : 'username yoq';
      var userId = ctx.from && ctx.from.id;
      await ctx.reply(
        '📞 Qo\'llab-Quvvatlash\n\n' +
        'Savollaringiz bo\'lsa, adminga murojaat qiling:\n\n' +
        '👨‍💼 Admin: ' + SUPPORT_USERNAME + '\n' +
        '📣 Kanal: ' + CHANNEL_LINK + '\n' +
        '🕐 Ish vaqti: 24/7\n' +
        '🌐 uzumbank.uz',
        {
          reply_markup: new grammy.InlineKeyboard()
            .url('👨‍💼 Admin', 'https://t.me/' + SUPPORT_USERNAME.replace('@', '')).url('📣 Kanal', CHANNEL_LINK).row()
            .text('🔙 Orqaga', 'back_main')
        }
      );
      if (userId && userId !== ADMIN_ID) {
        await notifyAdmin('📞 Yordam so\'raldi!\n👤 ' + name + '\n🔗 ' + username + '\n🆔 ' + userId);
      }
    } catch(e) {}
  });

  b.callbackQuery('back_main', async function(ctx) {
    try {
      await ctx.answerCallbackQuery();
      var name = (ctx.from && ctx.from.first_name) || "Do'stim";
      await ctx.reply(startText(name), { reply_markup: mainKb() });
    } catch(e) {}
  });

  b.callbackQuery('lang_ru', async function(ctx) {
    try {
      await ctx.answerCallbackQuery('🇷🇺 Русский!');
      var name = (ctx.from && ctx.from.first_name) || 'Друг';
      await ctx.reply(
        '👋 Здравствуйте, ' + name + '!\n\n🏦 Добро пожаловать в официальный реферальный бот Uzum Bank!\n\n✅ Здесь вы можете:\n• Открыть бесплатную виртуальную карту\n• Приглашать друзей и получать бонусы\n• Пользоваться специальными возможностями Uzum Market\n\n📣 Подпишитесь на наш канал!\n\n👇 Выберите из меню:',
        { reply_markup: mainKbRu() }
      );
    } catch(e) {}
  });

  b.callbackQuery('lang_uz', async function(ctx) {
    try {
      await ctx.answerCallbackQuery("🇺🇿 O'zbek!");
      var name = (ctx.from && ctx.from.first_name) || "Do'stim";
      await ctx.reply(startText(name), { reply_markup: mainKb() });
    } catch(e) {}
  });

  b.on('message', async function(ctx) {
    try {
      var userId = ctx.from && ctx.from.id;
      if (isRateLimited(userId)) { await ctx.reply('⚠️ Biroz kuting.'); return; }
      if (ctx.message && ctx.message.text && !ctx.message.text.startsWith('/')) {
        await ctx.reply('👋 /start bosing yoki menyudan foydalaning.', { reply_markup: mainKb() });
      }
    } catch(e) {}
  });

  b.catch(function(err) { process.stderr.write('[err] ' + (err && err.message || err) + '\n'); });

  return b;
}
