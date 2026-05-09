'use strict';
// v5.0 - FULL PRO BOT: karta, yechish, referral, admin panel, leaderboard

process.stdout.write('=== UZUM BOT v5.0 PRO STARTING ===\n');

var express = require('express');
var cors = require('cors');
var fs = require('fs');
var path = require('path');
var grammy = require('grammy');
var Bot = grammy.Bot;
var InlineKeyboard = grammy.InlineKeyboard;

var app = express();
var PORT = parseInt(process.env.PORT || '8080', 10);
var BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8609314242:AAGUIEmXzuIfvFxXEUIu_Y_bx7ijLh2MjK8';
var WEBHOOK_DOMAIN = process.env.WEBHOOK_DOMAIN || 'uzum-bot-v2-production.up.railway.app';
var DATA_DIR = process.env.DATA_DIR || '/data';
var ADMIN_ID = parseInt(process.env.ADMIN_ID || '8787603995', 10);
var CHANNEL_ID = process.env.CHANNEL_ID || '@uuzum_bonus_45k';
var CHANNEL_LINK = 'https://t.me/uuzum_bonus_45k';
var APP_LINK = 'https://b.2u.uz/ref?c=50&a=L6DaizF7cl';
var MINI_APP_URL = process.env.MINI_APP_URL || 'https://uzum-bot-v2-production.up.railway.app/';
var BONUS_PER_REF = 45000;
var MIN_WITHDRAW = 50000;
var MAX_24H = 500000;
var DB_FILE = path.join(DATA_DIR, 'uzumbot.json');

app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.get('/api/healthz', function(req, res) { res.json({ status: 'ok', version: '5.0', mode: 'webhook' }); });
app.get('/', function(req, res) { res.json({ status: 'ok', service: 'UzumRef Bot v5.0 PRO' }); });

// ─── DATABASE ──────────────────────────────────────────────────────────────────
function ensureDir() { try { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); } catch(e) {} }
function loadDB() {
  try { ensureDir(); if (!fs.existsSync(DB_FILE)) return { users: {} }; return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch(e) { return { users: {} }; }
}
function saveDB(db) { try { ensureDir(); fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); } catch(e) {} }

function getUser(userId) { var db = loadDB(); return db.users[String(userId)] || null; }
function saveUser(user) { var db = loadDB(); db.users[String(user.id)] = user; saveDB(db); }

function getOrCreateUser(from, refFrom) {
  var db = loadDB();
  var key = String(from.id);
  var isNew = !db.users[key];
  if (isNew) {
    var newUser = {
      id: from.id, name: from.first_name || 'Foydalanuvchi', username: from.username || '',
      joinedAt: new Date().toISOString(), refFrom: refFrom || null, referrals: 0,
      balance: 0, totalEarned: 0, cards: [], withdrawals: [], blocked: false, lastActivity: new Date().toISOString()
    };
    db.users[key] = newUser;
    if (refFrom && db.users[String(refFrom)]) {
      db.users[String(refFrom)].referrals += 1;
      db.users[String(refFrom)].balance += BONUS_PER_REF;
      db.users[String(refFrom)].totalEarned += BONUS_PER_REF;
    }
  } else {
    db.users[key].name = from.first_name || db.users[key].name;
    db.users[key].username = from.username || db.users[key].username;
    db.users[key].blocked = false;
    db.users[key].lastActivity = new Date().toISOString();
  }
  saveDB(db);
  return { user: db.users[key], isNew: isNew };
}

function addCard(userId, number, holder, bank) {
  var db = loadDB();
  var user = db.users[String(userId)];
  if (!user) return null;
  var card = { id: 'card_' + Date.now(), number: number, holder: holder, bank: bank, addedAt: new Date().toISOString() };
  user.cards.push(card);
  saveDB(db);
  return card;
}

function createWithdrawal(userId, amount, cardId) {
  var db = loadDB();
  var user = db.users[String(userId)];
  if (!user) return null;
  var wd = { id: 'wd_' + Date.now(), userId: userId, amount: amount, cardId: cardId, status: 'pending', createdAt: new Date().toISOString() };
  user.balance -= amount;
  user.withdrawals.push(wd);
  saveDB(db);
  return wd;
}

function processWithdrawal(wdId, status, note) {
  var db = loadDB();
  for (var uid in db.users) {
    var user = db.users[uid];
    var wd = user.withdrawals.find(function(w) { return w.id === wdId; });
    if (wd) {
      wd.status = status; wd.processedAt = new Date().toISOString(); wd.adminNote = note || '';
      if (status === 'rejected') user.balance += wd.amount;
      saveDB(db);
      return { withdrawal: wd, user: user };
    }
  }
  return null;
}

function get24hAmount(userId) {
  var user = getUser(userId);
  if (!user) return 0;
  var cutoff = Date.now() - 24 * 3600 * 1000;
  return user.withdrawals.filter(function(w) { return w.status !== 'rejected' && new Date(w.createdAt).getTime() > cutoff; })
    .reduce(function(s, w) { return s + w.amount; }, 0);
}

function getAllUsers() { var db = loadDB(); return Object.values(db.users); }

function getStats() {
  var db = loadDB();
  var users = Object.values(db.users);
  var today = new Date().toDateString();
  var week = Date.now() - 7 * 24 * 3600 * 1000;
  var allWds = users.flatMap(function(u) { return u.withdrawals || []; });
  var pending = allWds.filter(function(w) { return w.status === 'pending'; });
  var approved = allWds.filter(function(w) { return w.status === 'approved'; });
  return {
    total: users.length,
    today: users.filter(function(u) { return new Date(u.joinedAt).toDateString() === today; }).length,
    week: users.filter(function(u) { return new Date(u.joinedAt).getTime() > week; }).length,
    withCards: users.filter(function(u) { return (u.cards || []).length > 0; }).length,
    pendingCount: pending.length,
    pendingAmount: pending.reduce(function(s, w) { return s + w.amount; }, 0),
    totalPaid: approved.reduce(function(s, w) { return s + w.amount; }, 0),
    topReferrers: users.sort(function(a, b) { return b.referrals - a.referrals; }).slice(0, 5)
      .map(function(u) { return { name: u.name, referrals: u.referrals, earned: u.totalEarned }; })
  };
}

function getLeaderboard() {
  return getAllUsers().filter(function(u) { return u.referrals > 0; })
    .sort(function(a, b) { return b.referrals - a.referrals; }).slice(0, 10);
}

function getPendingWithdrawals() {
  return getAllUsers().flatMap(function(u) {
    return (u.withdrawals || []).filter(function(w) { return w.status === 'pending'; })
      .map(function(w) { return Object.assign({}, w, { user: u }); });
  });
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function fmt(n) { return n.toLocaleString('uz-UZ') + ' UZS'; }
function mask(num) { return '**** **** **** ' + num.slice(-4); }
function bar(val, max, len) {
  len = len || 10;
  var filled = Math.round((Math.min(val, max) / max) * len);
  return '█'.repeat(filled) + '░'.repeat(len - filled);
}

async function checkSub(userId) {
  if (userId === ADMIN_ID) return true;
  try {
    var res = await fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/getChatMember?chat_id=' + CHANNEL_ID + '&user_id=' + userId);
    var d = await res.json();
    if (!d.ok) return true;
    var s = d.result && d.result.status;
    return s === 'member' || s === 'administrator' || s === 'creator';
  } catch(e) { return true; }
}

// ─── CONVERSATION STATE ────────────────────────────────────────────────────────
var convo = new Map();

// ─── KEYBOARDS ────────────────────────────────────────────────────────────────
function mainKb(username, userId) {
  var link = 'https://t.me/' + username + '?start=' + userId;
  return new InlineKeyboard()
    .text('💳 Karta Qo\'shish', 'add_card').text('💰 Pul Yechish', 'withdraw').row()
    .text('📊 Mening Hisobim', 'my_account').text('🏆 Top Referrerlar', 'leaderboard').row()
    .text('🔗 Referral Havola', 'my_ref').text('📋 Tarix', 'history').row()
    .url('✈️ Do\'stlarga Ulashish', 'https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent('🍇 Uzum Bank — 45,000 UZS bonus!')).row()
    .webApp('🚀 Mini App — Karta & Bonus ⚡️', MINI_APP_URL).row()
    .url('📣 Rasmiy Kanal', CHANNEL_LINK).text('📞 Yordam', 'support');
}

function backKb() { return new InlineKeyboard().text('🔙 Bosh Menyu', 'main_menu'); }

function cardListKb(cards) {
  var kb = new InlineKeyboard();
  (cards || []).forEach(function(c) {
    kb.text('💳 ' + mask(c.number) + ' (' + c.bank + ')', 'sel_card_' + c.id).row();
  });
  return kb.text('➕ Yangi Karta', 'add_card').row().text('🔙 Bosh Menyu', 'main_menu');
}

function subKb() {
  return new InlineKeyboard().url('📣 Kanalga Obuna Bo\'lish', CHANNEL_LINK).row().text('✅ Tekshirish', 'check_sub');
}

function adminWdKb(wdId) {
  return new InlineKeyboard().text('✅ Tasdiqlash', 'approve_' + wdId).text('❌ Rad etish', 'reject_' + wdId);
}

// ─── ACCOUNT TEXT ─────────────────────────────────────────────────────────────
function accountText(userId, name) {
  var user = getUser(userId);
  var bal = user ? fmt(user.balance) : '0 UZS';
  var refs = user ? (user.referrals || 0) : 0;
  var b = bar(refs % 5, 5);
  var next = Math.ceil((refs + 1) / 5) * 5;
  return '🍇 <b>UZUM BONUS BOT</b>\n\n' +
    '👤 <b>' + name + '</b>\n' +
    '💰 Balans: <b>' + bal + '</b>\n' +
    '🔗 Referrallar: <b>' + refs + ' ta</b>\n' +
    '📈 Progress: ' + b + ' ' + (refs % 5) + '/5\n' +
    '🎯 Keyingi ' + next + ' gacha: <b>' + (5 - refs % 5) + ' ta qoldi</b>\n\n' +
    '━━━━━━━━━━━━━━━━━━\n' +
    '💡 Har bir do\'st = <b>' + fmt(BONUS_PER_REF) + '</b> bonus!\n' +
    '📣 Do\'stlaringizni taklif qiling va daromad oling!';
}

// ─── BOT SETUP ────────────────────────────────────────────────────────────────
var bot = new Bot(BOT_TOKEN);

async function notifyAdmin(text, kb) {
  try { await bot.api.sendMessage(ADMIN_ID, text, { parse_mode: 'HTML', reply_markup: kb }); } catch(e) {}
}

// /start
bot.command('start', async function(ctx) {
  try {
    var from = ctx.from; if (!from) return;
    convo.delete(from.id);
    var param = String(ctx.match || '').trim();
    var refFrom = (param && param !== String(from.id)) ? (parseInt(param) || null) : null;
    var result = getOrCreateUser(from, refFrom);
    var user = result.user; var isNew = result.isNew;
    var subscribed = await checkSub(from.id);
    var me = await bot.api.getMe();
    if (!subscribed) {
      await ctx.reply('👋 Salom, <b>' + user.name + '</b>!\n\n🔒 Botdan foydalanish uchun avval kanalimizga obuna bo\'ling!\n\n📣 @uuzum_bonus_45k',
        { parse_mode: 'HTML', reply_markup: subKb() }); return;
    }
    if (isNew && refFrom && refFrom !== from.id) {
      var refUser = getUser(refFrom);
      if (refUser) {
        await notifyAdmin('🆕 <b>Yangi foydalanuvchi!</b>\n\n👤 ' + user.name + '\n🔗 @' + (user.username || 'yoq') + '\n🆔 <code>' + user.id + '</code>\n📎 Ref: ' + refUser.name + ' (+' + fmt(BONUS_PER_REF) + ')');
        await bot.api.sendMessage(refFrom,
          '🎉 <b>Tabriklaymiz!</b>\n\n✅ <b>' + user.name + '</b> havolangiz orqali qo\'shildi!\n💰 <b>' + fmt(BONUS_PER_REF) + '</b> balansga qo\'shildi!\n💼 Yangi balans: <b>' + fmt(refUser.balance) + '</b>',
          { parse_mode: 'HTML' }).catch(function() {});
      }
    }
    var txt = accountText(from.id, user.name) + (isNew ? '\n\n🎁 <b>Birinchi do\'stni taklif qiling — ' + fmt(BONUS_PER_REF) + ' oling!</b>' : '\n\n👇 Menyudan foydalaning:');
    await ctx.reply(txt, { parse_mode: 'HTML', reply_markup: mainKb(me.username, from.id) });
  } catch(e) { process.stderr.write('/start: ' + e.message + '\n'); }
});

// /admin
bot.command('admin', async function(ctx) {
  if (!ctx.from || ctx.from.id !== ADMIN_ID) return;
  var s = getStats();
  await ctx.reply(
    '🔐 <b>ADMIN PANEL</b>\n\n👥 Jami: <b>' + s.total + '</b>\n🆕 Bugun: <b>' + s.today + '</b>\n📅 Hafta: <b>' + s.week + '</b>\n💳 Kartali: <b>' + s.withCards + '</b>\n\n⏳ Kutilayotgan: <b>' + s.pendingCount + '</b> ta\n💵 Summa: <b>' + fmt(s.pendingAmount) + '</b>\n✅ To\'langan: <b>' + fmt(s.totalPaid) + '</b>\n\n🏆 <b>Top Referrerlar:</b>\n' +
    s.topReferrers.map(function(u, i) { return (i+1) + '. ' + u.name + ' — ' + u.referrals + ' ta (' + fmt(u.earned) + ')'; }).join('\n') +
    '\n\n<i>/pending /broadcast /users</i>',
    { parse_mode: 'HTML', reply_markup: new InlineKeyboard().text('💸 Kutilayotgan', 'admin_pending').row().text('📊 Statistika', 'admin_stats').text('👥 Foydalanuvchilar', 'admin_users') }
  );
});

// /pending
bot.command('pending', async function(ctx) {
  if (!ctx.from || ctx.from.id !== ADMIN_ID) return;
  var pending = getPendingWithdrawals();
  if (pending.length === 0) { await ctx.reply('✅ Kutilayotgan so\'rovlar yo\'q.'); return; }
  for (var i = 0; i < Math.min(10, pending.length); i++) {
    var wd = pending[i];
    var card = (wd.user.cards || []).find(function(c) { return c.id === wd.cardId; });
    await ctx.reply(
      '💸 <b>Yechish So\'rovi</b>\n\n👤 ' + wd.user.name + ' (@' + (wd.user.username || 'yoq') + ')\n🆔 <code>' + wd.userId + '</code>\n💰 <b>' + fmt(wd.amount) + '</b>\n💳 ' + (card ? mask(card.number) : '—') + '\n🏦 ' + (card ? card.bank : '—') + '\n👤 ' + (card ? card.holder : '—') + '\n🕐 ' + new Date(wd.createdAt).toLocaleString('uz-UZ'),
      { parse_mode: 'HTML', reply_markup: adminWdKb(wd.id) }
    );
  }
});

// /broadcast
bot.command('broadcast', async function(ctx) {
  if (!ctx.from || ctx.from.id !== ADMIN_ID) return;
  var text = ctx.match; if (!text || !text.trim()) { await ctx.reply('❌ /broadcast [matn]'); return; }
  var users = getAllUsers().filter(function(u) { return !u.blocked; });
  await ctx.reply('📤 ' + users.length + ' ta foydalanuvchiga yuborilmoqda...');
  var sent = 0, failed = 0;
  for (var i = 0; i < users.length; i++) {
    try { await bot.api.sendMessage(users[i].id, '📢 <b>Xabar</b>\n\n' + text, { parse_mode: 'HTML' }); sent++; await new Promise(function(r) { setTimeout(r, 35); }); }
    catch(e) { failed++; users[i].blocked = true; saveUser(users[i]); }
  }
  await ctx.reply('✅ Yuborildi: ' + sent + '\n❌ Xato: ' + failed);
});

// /users
bot.command('users', async function(ctx) {
  if (!ctx.from || ctx.from.id !== ADMIN_ID) return;
  var users = getAllUsers().sort(function(a,b){ return b.referrals - a.referrals; }).slice(0, 20);
  await ctx.reply('👥 <b>TOP FOYDALANUVCHILAR</b>\n\n' + users.map(function(u, i) {
    return (i+1) + '. ' + u.name + ' | 👥' + u.referrals + ' | 💰' + fmt(u.balance) + ' | 💳' + (u.cards || []).length;
  }).join('\n'), { parse_mode: 'HTML' });
});

// check_sub
bot.callbackQuery('check_sub', async function(ctx) {
  await ctx.answerCallbackQuery();
  var from = ctx.from;
  var subscribed = await checkSub(from.id);
  if (!subscribed) {
    await ctx.editMessageText('❌ Hali kanalga obuna bo\'lmagansiz!\n\n📣 @uuzum_bonus_45k', { reply_markup: subKb() }); return;
  }
  var user = getUser(from.id);
  if (user) { user.subscribed = true; saveUser(user); }
  var me = await bot.api.getMe();
  var name = (user ? user.name : null) || from.first_name || 'Foydalanuvchi';
  await ctx.editMessageText(accountText(from.id, name), { parse_mode: 'HTML', reply_markup: mainKb(me.username, from.id) });
});

// main_menu
bot.callbackQuery('main_menu', async function(ctx) {
  await ctx.answerCallbackQuery();
  convo.delete(ctx.from.id);
  var me = await bot.api.getMe();
  var user = getUser(ctx.from.id);
  var name = (user ? user.name : null) || ctx.from.first_name || 'Foydalanuvchi';
  try { await ctx.editMessageText(accountText(ctx.from.id, name), { parse_mode: 'HTML', reply_markup: mainKb(me.username, ctx.from.id) }); }
  catch(e) { await ctx.reply(accountText(ctx.from.id, name), { parse_mode: 'HTML', reply_markup: mainKb(me.username, ctx.from.id) }); }
});

// my_account
bot.callbackQuery('my_account', async function(ctx) {
  await ctx.answerCallbackQuery();
  var user = getUser(ctx.from.id); if (!user) return;
  var approved = (user.withdrawals || []).filter(function(w) { return w.status === 'approved'; });
  var pending = (user.withdrawals || []).filter(function(w) { return w.status === 'pending'; });
  var withdrawn = approved.reduce(function(s, w) { return s + w.amount; }, 0);
  var w24 = get24hAmount(ctx.from.id);
  await ctx.editMessageText(
    '📊 <b>MENING HISOBIM</b>\n\n👤 <b>' + user.name + '</b>  @' + (user.username || '—') + '\n\n━━━━━━━━━━━━━━━━━━\n' +
    '💰 Balans: <b>' + fmt(user.balance) + '</b>\n📈 Jami Daromat: <b>' + fmt(user.totalEarned) + '</b>\n✅ Jami Yechilgan: <b>' + fmt(withdrawn) + '</b>\n\n━━━━━━━━━━━━━━━━━━\n' +
    '🔗 Referrallar: <b>' + (user.referrals || 0) + ' ta</b>\n💳 Kartalar: <b>' + (user.cards || []).length + ' ta</b>\n⏳ Kutilayotgan: <b>' + pending.length + ' ta</b>\n\n━━━━━━━━━━━━━━━━━━\n' +
    '📉 24h limit: ' + bar(w24, MAX_24H) + ' ' + fmt(w24) + '/' + fmt(MAX_24H) + '\n🔓 Qolgan: <b>' + fmt(Math.max(0, MAX_24H - w24)) + '</b>\n\n📅 Qo\'shilgan: ' + new Date(user.joinedAt).toLocaleDateString('uz-UZ'),
    { parse_mode: 'HTML', reply_markup: backKb() }
  );
});

// my_ref
bot.callbackQuery('my_ref', async function(ctx) {
  await ctx.answerCallbackQuery();
  var me = await bot.api.getMe();
  var user = getUser(ctx.from.id); if (!user) return;
  var refLink = 'https://t.me/' + me.username + '?start=' + ctx.from.id;
  await ctx.editMessageText(
    '🔗 <b>REFERRAL TIZIMI</b>\n\n📎 Havolangiz:\n<code>' + refLink + '</code>\n\n━━━━━━━━━━━━━━━━━━\n' +
    '👥 Taklif qilganlar: <b>' + (user.referrals || 0) + ' ta</b>\n💰 Jami bonus: <b>' + fmt(user.totalEarned || 0) + '</b>\n\n━━━━━━━━━━━━━━━━━━\n' +
    '💡 <b>Qanday ishlaydi:</b>\n1️⃣ Havolani do\'stingizga yuboring\n2️⃣ Do\'st ro\'yxatdan o\'tadi\n3️⃣ <b>' + fmt(BONUS_PER_REF) + '</b> hisobingizga tushadi!\n\n🏆 5 ta referral = ' + fmt(5 * BONUS_PER_REF) + ' bonus!',
    { parse_mode: 'HTML', reply_markup: new InlineKeyboard().url('✈️ Ulashish', 'https://t.me/share/url?url=' + encodeURIComponent(refLink) + '&text=' + encodeURIComponent('🍇 Uzum Bank — 45,000 UZS bonus!')).row().text('🔙 Bosh Menyu', 'main_menu') }
  );
});

// leaderboard
bot.callbackQuery('leaderboard', async function(ctx) {
  await ctx.answerCallbackQuery();
  var top = getLeaderboard();
  var user = getUser(ctx.from.id);
  var myRank = top.findIndex(function(u) { return u.id === ctx.from.id; }) + 1;
  var medals = ['🥇','🥈','🥉'];
  var lines = top.map(function(u, i) {
    var medal = medals[i] || (i+1) + '.';
    var me = u.id === ctx.from.id ? ' 👈 Siz' : '';
    return medal + ' <b>' + u.name + '</b> — ' + u.referrals + ' ta (' + fmt(u.totalEarned) + ')' + me;
  });
  await ctx.editMessageText(
    '🏆 <b>TOP REFERRERLAR</b>\n\n' + (lines.length ? lines.join('\n') : 'Hali yo\'q') +
    '\n\n━━━━━━━━━━━━━━━━━━\n🎯 Sizning o\'rningiz: <b>' + (myRank > 0 ? '#' + myRank : 'Top 10 da yo\'q') + '</b>\n🔗 Referrallaringiz: <b>' + (user ? user.referrals : 0) + ' ta</b>',
    { parse_mode: 'HTML', reply_markup: backKb() }
  );
});

// history
bot.callbackQuery('history', async function(ctx) {
  await ctx.answerCallbackQuery();
  var user = getUser(ctx.from.id); if (!user) return;
  var all = [...(user.withdrawals || [])].reverse().slice(0, 10);
  var statusE = { pending: '⏳', approved: '✅', rejected: '❌' };
  var lines = all.map(function(w) {
    var card = (user.cards || []).find(function(c) { return c.id === w.cardId; });
    var date = new Date(w.createdAt).toLocaleDateString('uz-UZ');
    return (statusE[w.status] || '❓') + ' <b>' + fmt(w.amount) + '</b>\n   💳 ' + (card ? mask(card.number) : 'karta') + ' | ' + date;
  });
  await ctx.editMessageText(
    '📋 <b>TRANZAKSIYA TARIXI</b>\n\n' + (lines.length ? lines.join('\n\n') : 'Tranzaksiyalar yo\'q') + '\n\n💰 Balans: <b>' + fmt(user.balance) + '</b>',
    { parse_mode: 'HTML', reply_markup: backKb() }
  );
});

// support
bot.callbackQuery('support', async function(ctx) {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(
    '📞 <b>YORDAM MARKAZI</b>\n\nSalom, ' + ctx.from.first_name + '!\n\n🔹 Admin: @uzum_bonus_admin\n🔹 Kanal: @uuzum_bonus_45k\n\n━━━━━━━━━━━━━━━━━━\n❓ <b>Savol-javob:</b>\n\n🔸 <b>Qachon pul olaman?</b>\n→ 24-48 soat\n\n🔸 <b>Minimum yechish?</b>\n→ ' + fmt(MIN_WITHDRAW) + '\n\n🔸 <b>24h limit?</b>\n→ ' + fmt(MAX_24H) + '\n\n🔸 <b>1 referral = ?</b>\n→ ' + fmt(BONUS_PER_REF),
    { parse_mode: 'HTML', reply_markup: new InlineKeyboard().url('💬 Admin', 'https://t.me/uzum_bonus_admin').row().text('🔙 Bosh Menyu', 'main_menu') }
  );
});

// add_card
bot.callbackQuery('add_card', async function(ctx) {
  await ctx.answerCallbackQuery();
  convo.set(ctx.from.id, { step: 'card_number', data: {} });
  await ctx.editMessageText(
    '💳 <b>KARTA QO\'SHISH</b>\n\n1️⃣ Karta raqamini yuboring (16 raqam)\nMasalan: <code>8600 0000 0000 0000</code>',
    { parse_mode: 'HTML', reply_markup: new InlineKeyboard().text('❌ Bekor', 'main_menu') }
  );
});

// bank_*
bot.callbackQuery(/^bank_(.+)$/, async function(ctx) {
  await ctx.answerCallbackQuery();
  var bank = ctx.match[1];
  var state = convo.get(ctx.from.id);
  if (!state || state.step !== 'card_bank') return;
  state.data.bank = bank;
  convo.delete(ctx.from.id);
  var card = addCard(ctx.from.id, state.data.number, state.data.holder, bank);
  if (!card) { await ctx.editMessageText('❌ Xatolik. Qayta urinib ko\'ring.', { reply_markup: backKb() }); return; }
  await ctx.editMessageText(
    '✅ <b>Karta qo\'shildi!</b>\n\n💳 ' + mask(card.number) + '\n👤 ' + card.holder + '\n🏦 ' + card.bank + '\n\nEndi pul yechishingiz mumkin!',
    { parse_mode: 'HTML', reply_markup: new InlineKeyboard().text('💰 Pul Yechish', 'withdraw').row().text('🔙 Bosh Menyu', 'main_menu') }
  );
  var user = getUser(ctx.from.id);
  if (user) await notifyAdmin('💳 <b>Yangi karta</b>\n👤 ' + user.name + '\n💳 ' + mask(card.number) + '\n🏦 ' + card.bank);
});

// withdraw
bot.callbackQuery('withdraw', async function(ctx) {
  await ctx.answerCallbackQuery();
  var user = getUser(ctx.from.id); if (!user) return;
  if (!user.cards || user.cards.length === 0) {
    await ctx.editMessageText('❗ <b>Karta topilmadi!</b>\nAvval karta qo\'shing.', { parse_mode: 'HTML', reply_markup: new InlineKeyboard().text('💳 Karta Qo\'shish', 'add_card').row().text('🔙 Bosh Menyu', 'main_menu') }); return;
  }
  if (user.balance < MIN_WITHDRAW) {
    var need = MIN_WITHDRAW - user.balance;
    await ctx.editMessageText('❗ <b>Balans yetarli emas!</b>\n\n💰 Balans: <b>' + fmt(user.balance) + '</b>\n📉 Minimum: <b>' + fmt(MIN_WITHDRAW) + '</b>\n🔻 Yetishmaydi: <b>' + fmt(need) + '</b>\n\n🔗 Yana <b>' + Math.ceil(need / BONUS_PER_REF) + ' ta</b> do\'st taklif qiling!',
      { parse_mode: 'HTML', reply_markup: new InlineKeyboard().text('🔗 Referral Havola', 'my_ref').row().text('🔙 Bosh Menyu', 'main_menu') }); return;
  }
  var w24 = get24hAmount(ctx.from.id);
  if (w24 >= MAX_24H) {
    await ctx.editMessageText('⏰ <b>24h limit to\'ldi!</b>\nErtaga qayta urinib ko\'ring.', { parse_mode: 'HTML', reply_markup: backKb() }); return;
  }
  convo.set(ctx.from.id, { step: 'withdraw_amount', data: {} });
  var maxAmt = Math.min(user.balance, MAX_24H - w24);
  await ctx.editMessageText(
    '💰 <b>PUL YECHISH</b>\n\n💼 Balans: <b>' + fmt(user.balance) + '</b>\n📊 24h qoldi: <b>' + fmt(maxAmt) + '</b>\n\nQancha yechmoqchisiz?',
    { parse_mode: 'HTML', reply_markup: new InlineKeyboard().text('💸 Hammasini yechish', 'wd_all').row().text('❌ Bekor', 'main_menu') }
  );
});

// wd_all
bot.callbackQuery('wd_all', async function(ctx) {
  await ctx.answerCallbackQuery();
  var user = getUser(ctx.from.id); if (!user) return;
  var state = convo.get(ctx.from.id) || { step: 'withdraw_card', data: {} };
  state.data.amount = String(user.balance); state.step = 'withdraw_card';
  convo.set(ctx.from.id, state);
  await ctx.editMessageText('💳 <b>Karta tanlang:</b>', { parse_mode: 'HTML', reply_markup: cardListKb(user.cards) });
});

// sel_card_*
bot.callbackQuery(/^sel_card_(.+)$/, async function(ctx) {
  await ctx.answerCallbackQuery();
  var cardId = ctx.match[1];
  var user = getUser(ctx.from.id); if (!user) return;
  var card = (user.cards || []).find(function(c) { return c.id === cardId; }); if (!card) return;
  var state = convo.get(ctx.from.id);
  if (state && state.step === 'withdraw_card' && state.data.amount) {
    var amount = Number(state.data.amount);
    convo.delete(ctx.from.id);
    await ctx.editMessageText(
      '✅ <b>Tasdiqlang:</b>\n\n💰 Summa: <b>' + fmt(amount) + '</b>\n💳 Karta: <b>' + mask(card.number) + '</b>\n🏦 Bank: ' + card.bank + '\n👤 Egasi: ' + card.holder + '\n\n⚠️ So\'rov 24-48 soat ichida ko\'rib chiqiladi.',
      { parse_mode: 'HTML', reply_markup: new InlineKeyboard().text('✅ Tasdiqlash — ' + fmt(amount), 'conf_wd_' + amount + '_' + cardId).row().text('❌ Bekor', 'main_menu') }
    );
  }
});

// conf_wd_*
bot.callbackQuery(/^conf_wd_(\d+)_(.+)$/, async function(ctx) {
  await ctx.answerCallbackQuery('⏳ Yuborilmoqda...');
  var amount = Number(ctx.match[1]); var cardId = ctx.match[2];
  var user = getUser(ctx.from.id);
  if (!user || user.balance < amount) { await ctx.editMessageText('❌ Balans yetarli emas!', { reply_markup: backKb() }); return; }
  var card = (user.cards || []).find(function(c) { return c.id === cardId; }); if (!card) return;
  var wd = createWithdrawal(ctx.from.id, amount, cardId);
  await ctx.editMessageText(
    '✅ <b>So\'rov qabul qilindi!</b>\n\n🆔 <code>' + wd.id + '</code>\n💰 <b>' + fmt(amount) + '</b>\n💳 ' + mask(card.number) + '\n⏰ 24-48 soat ichida ko\'rib chiqiladi.\n📱 Natija haqida xabar olasiz.',
    { parse_mode: 'HTML', reply_markup: backKb() }
  );
  await notifyAdmin(
    '💸 <b>YANGI YECHISH SO\'ROVI!</b>\n\n👤 ' + user.name + ' (@' + (user.username || 'yoq') + ')\n🆔 <code>' + user.id + '</code>\n💰 <b>' + fmt(amount) + '</b>\n💳 ' + mask(card.number) + '\n🏦 ' + card.bank + '\n👤 ' + card.holder + '\n📊 Refs: ' + (user.referrals || 0) + ' ta',
    adminWdKb(wd.id)
  );
});

// approve_*
bot.callbackQuery(/^approve_(.+)$/, async function(ctx) {
  if (ctx.from.id !== ADMIN_ID) { await ctx.answerCallbackQuery('⛔️'); return; }
  await ctx.answerCallbackQuery('✅ Tasdiqlandi!');
  var result = processWithdrawal(ctx.match[1], 'approved');
  if (!result) { await ctx.editMessageText('❌ Topilmadi.'); return; }
  await ctx.editMessageText('✅ <b>TASDIQLANDI</b>\n\n💰 ' + fmt(result.withdrawal.amount) + '\n👤 User: ' + result.user.id, { parse_mode: 'HTML' });
  await bot.api.sendMessage(result.user.id, '✅ <b>Pul yechish tasdiqlandi!</b>\n\n💰 <b>' + fmt(result.withdrawal.amount) + '</b> kartangizga o\'tkazilmoqda...\n💼 Yangi balans: <b>' + fmt(result.user.balance) + '</b>\n\nRahmat! 🎉', { parse_mode: 'HTML' }).catch(function() {});
});

// reject_*
bot.callbackQuery(/^reject_(.+)$/, async function(ctx) {
  if (ctx.from.id !== ADMIN_ID) { await ctx.answerCallbackQuery('⛔️'); return; }
  await ctx.answerCallbackQuery('❌ Rad etildi.');
  var result = processWithdrawal(ctx.match[1], 'rejected', 'Admin rad etdi');
  if (!result) { await ctx.editMessageText('❌ Topilmadi.'); return; }
  await ctx.editMessageText('❌ <b>RAD ETILDI</b>\n\n💰 ' + fmt(result.withdrawal.amount) + ' qaytarildi.', { parse_mode: 'HTML' });
  await bot.api.sendMessage(result.user.id, '❌ <b>Yechish so\'rovi rad etildi.</b>\n\n💰 <b>' + fmt(result.withdrawal.amount) + '</b> balansga qaytarildi.\n📞 Savol: @uzum_bonus_admin', { parse_mode: 'HTML' }).catch(function() {});
});

// admin callbacks
bot.callbackQuery('admin_pending', async function(ctx) {
  if (ctx.from.id !== ADMIN_ID) { await ctx.answerCallbackQuery('⛔️'); return; }
  await ctx.answerCallbackQuery();
  var n = getPendingWithdrawals().length;
  await ctx.editMessageText(n === 0 ? '✅ Kutilayotgan so\'rovlar yo\'q.' : '⏳ <b>' + n + ' ta so\'rov</b>\n\n/pending buyrug\'ini yuboring', { parse_mode: 'HTML', reply_markup: backKb() });
});

bot.callbackQuery('admin_stats', async function(ctx) {
  if (ctx.from.id !== ADMIN_ID) { await ctx.answerCallbackQuery('⛔️'); return; }
  await ctx.answerCallbackQuery();
  var s = getStats();
  await ctx.editMessageText('📊 <b>STATISTIKA</b>\n\n👥 ' + s.total + '\n🆕 Bugun: ' + s.today + '\n📅 Hafta: ' + s.week + '\n💳 Kartali: ' + s.withCards + '\n⏳ Kutilayotgan: ' + s.pendingCount + '\n💵 ' + fmt(s.pendingAmount) + '\n✅ ' + fmt(s.totalPaid), { parse_mode: 'HTML', reply_markup: backKb() });
});

bot.callbackQuery('admin_users', async function(ctx) {
  if (ctx.from.id !== ADMIN_ID) { await ctx.answerCallbackQuery('⛔️'); return; }
  await ctx.answerCallbackQuery();
  var users = getAllUsers().sort(function(a,b){ return b.referrals - a.referrals; }).slice(0, 15);
  await ctx.editMessageText('👥 <b>TOP FOYDALANUVCHILAR</b>\n\n' + users.map(function(u, i) { return (i+1) + '. ' + u.name + ' | 👥' + u.referrals + ' | 💰' + fmt(u.balance); }).join('\n'), { parse_mode: 'HTML', reply_markup: backKb() });
});

// Text handler (conversation flow)
bot.on('message:text', async function(ctx) {
  var from = ctx.from; if (!from) return;
  var state = convo.get(from.id);
  var text = ctx.message.text.trim();
  var me = await bot.api.getMe();

  if (!state) {
    var subscribed = await checkSub(from.id);
    if (!subscribed) { await ctx.reply('📣 Avval kanalga obuna bo\'ling!', { reply_markup: subKb() }); return; }
    getOrCreateUser(from, null);
    var user = getUser(from.id);
    var name = (user ? user.name : null) || from.first_name || 'Foydalanuvchi';
    await ctx.reply(accountText(from.id, name), { parse_mode: 'HTML', reply_markup: mainKb(me.username, from.id) });
    return;
  }

  if (state.step === 'card_number') {
    var digits = text.replace(/\s/g, '');
    if (!/^\d{16}$/.test(digits)) { await ctx.reply('❌ Noto\'g\'ri format! 16 ta raqam kiriting.\nMasalan: <code>8600000000000000</code>', { parse_mode: 'HTML' }); return; }
    state.data.number = digits; state.step = 'card_holder';
    await ctx.reply('✅ Karta: <b>' + mask(digits) + '</b>\n\n2️⃣ Karta egasining to\'liq ismini yuboring:\n(Pasportdagi kabi)\nMasalan: <code>ALIYEV VOHID</code>', { parse_mode: 'HTML' }); return;
  }

  if (state.step === 'card_holder') {
    if (text.length < 5 || text.length > 50) { await ctx.reply('❌ Ism juda qisqa yoki uzun.'); return; }
    state.data.holder = text.toUpperCase(); state.step = 'card_bank';
    await ctx.reply('✅ Egasi: <b>' + state.data.holder + '</b>\n\n3️⃣ Bank nomini tanlang:', { parse_mode: 'HTML',
      reply_markup: new InlineKeyboard().text('🏦 Uzum Bank', 'bank_Uzum Bank').text('🏦 Kapitalbank', 'bank_Kapitalbank').row()
        .text('🏦 Ipoteka Bank', 'bank_Ipoteka Bank').text('🏦 Hamkorbank', 'bank_Hamkorbank').row()
        .text('🏦 Xalq Banki', 'bank_Xalq Banki').text('🏦 Boshqa', 'bank_Boshqa') }); return;
  }

  if (state.step === 'withdraw_amount') {
    var user2 = getUser(from.id); if (!user2) return;
    var amount = Number(text.replace(/\s/g, '').replace(',', '.'));
    if (isNaN(amount) || amount <= 0) { await ctx.reply('❌ Noto\'g\'ri summa. Raqam kiriting (masalan: 50000)'); return; }
    if (amount < MIN_WITHDRAW) { await ctx.reply('❌ Minimum: ' + fmt(MIN_WITHDRAW)); return; }
    if (amount > user2.balance) { await ctx.reply('❌ Balans yetarli emas! Balans: ' + fmt(user2.balance)); return; }
    var w24b = get24hAmount(from.id);
    if (amount + w24b > MAX_24H) { await ctx.reply('❌ 24h limit oshib ketadi! Qolgan: ' + fmt(MAX_24H - w24b)); return; }
    state.data.amount = String(amount); state.step = 'withdraw_card';
    await ctx.reply('💰 Summa: <b>' + fmt(amount) + '</b>\n\n💳 Qaysi kartaga?', { parse_mode: 'HTML', reply_markup: cardListKb(user2.cards) }); return;
  }
});

bot.catch(function(err) { process.stderr.write('Bot error: ' + err.message + '\n'); });

// Webhook route
app.post('/webhook/' + BOT_TOKEN, async function(req, res) {
  try { await bot.handleUpdate(req.body); res.json({ ok: true }); }
  catch(e) { process.stderr.write('handleUpdate: ' + e.message + '\n'); res.json({ ok: false }); }
});

// Start
app.listen(PORT, '0.0.0.0', async function() {
  process.stdout.write('HTTP server on port ' + PORT + '\n');
  var webhookUrl = 'https://' + WEBHOOK_DOMAIN + '/webhook/' + BOT_TOKEN;
  try {
    var r = await fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/setWebhook', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl, drop_pending_updates: true, max_connections: 10 })
    });
    var d = await r.json();
    process.stdout.write('setWebhook: ' + JSON.stringify(d) + '\n');
    process.stdout.write('Webhook: ' + webhookUrl + '\n');
  } catch(e) { process.stderr.write('setWebhook error: ' + e.message + '\n'); }

  // Daily report
  var now = new Date();
  var msUntil9 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0) - now;
  setTimeout(function() {
    var sendReport = function() {
      var s = getStats();
      bot.api.sendMessage(ADMIN_ID,
        '📊 <b>KUNLIK HISOBOT</b>\n\n📅 ' + new Date().toLocaleDateString('uz-UZ') + '\n\n👥 Jami: ' + s.total + '\n🆕 Bugun: ' + s.today + '\n💳 Kartali: ' + s.withCards + '\n⏳ Kutilayotgan: ' + s.pendingCount + ' ta (' + fmt(s.pendingAmount) + ')\n✅ To\'langan: ' + fmt(s.totalPaid) + '\n\n🏆 Top: ' + (s.topReferrers[0] ? s.topReferrers[0].name + ' (' + s.topReferrers[0].referrals + ' ta)' : '—'),
        { parse_mode: 'HTML' }).catch(function() {});
    };
    sendReport(); setInterval(sendReport, 86400000);
  }, msUntil9);

  process.stdout.write('Bot v5.0 PRO ready!\n');
});
