import {
  Bot,
  InlineKeyboard,
  session,
  type SessionFlavor,
  InlineQueryResultBuilder,
} from "grammy";
import { logger } from "./lib/logger";

const APP_LINK = "https://b.2u.uz/ref?c=50&a=L6DaizF7cl";
const BOT_LINK = "https://t.me/UzumBankRbot?start=L6DaizF7cl";
const SUPPORT_USERNAME = "@UzumSupport";
const ADMIN_ID = 8787603995;

interface SessionData {
  lang?: "uz" | "ru";
}
type MyContext = SessionFlavor<SessionData>;

const rawDomains = process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN || "";
const primaryDomain = rawDomains.split(",")[0]?.trim();
const MINI_APP_URL = primaryDomain
  ? `https://${primaryDomain}/`
  : process.env.MINI_APP_URL || "";

// ─── TEXTS ────────────────────────────────────────────────────────────────────
const T = {
  uz: {
    welcome: (name: string) => `
⚡️ *Assalomu alaykum, ${name}!* ⚡️

💰 *Uzum Bank Referral Dasturiga xush kelibsiz!*

Bepul virtual karta oching va do'stlaringizni taklif qilib daromad ishlang!

🌟 *Nima olasiz:*
• 💳 Bepul virtual karta — 0 so'mga
• 🤑 Har bir do'st uchun *45 000 so'm*
• 🛒 Uzum Marketda maxsus narxlar
• ♾️ Cheksiz daromad imkoniyati

👇 Menyudan tanlang:`,

    card: `💳 *Bepul Virtual Kartangizni Oching!*\n\n✅ Karta ochish — *TO'LIQ BEPUL* (0 so'm)\n✅ Onlayn xaridlar uchun ideal\n✅ Uzum Marketda maxsus narxlar\n✅ Cashback va bonuslar\n\n🔗 Quyidagi havoladan ro'yxatdan o'ting:`,

    invite: (app: string, bot: string) => `
🤝 *Do'stlaringizni Taklif Qiling!*

🤑 Har bir taklif uchun: *45 000 so'm*
♾️ Taklif limiti: *CHEKSIZ*

📱 *Ilova havolasi:*
\`${app}\`

🤖 *Bot havolasi:*
\`${bot}\`

👇 Telegramda ulashing:`,

    shareMsg: (app: string) => `⚡️ Do'stim, bugun Uzum Bank ilovasini yuklab, bepul virtual karta oching!\n\n💰 Har bir taklif uchun 45 000 so'm bonus!\n🛒 Uzum Marketda maxsus narxlar\n\n📱 Ilova: ${app}\n🤖 Bot: ${BOT_LINK}`,

    opportunities: `🌟 *Imkoniyatlar va Afzalliklar*\n\n💳 *Bepul Virtual Karta*\n└ 0 so'mga oching\n\n🤑 *45 000 so'm Bonus*\n└ Har bir taklif qilgan do'stingiz uchun\n\n🛒 *Uzum Market Imtiyozlari*\n└ Maxsus chegirmalar va aksiyalar\n\n⚡️ *Tezkor To'lovlar*\n└ 24/7 istalgan vaqtda\n\n📊 *Cashback Dasturi*\n└ Har xariddan foiz qaytariladi\n\n🔒 *Xavfsiz Bank*\n└ O'zbekiston litsenziyali bank\n\n♾️ *Cheksiz Daromad*\n└ Qancha ko'p do'st — shuncha ko'p pul!`,

    howItWorks: `📖 *Qanday Ishlaydi?*\n\n*Qadam 1️⃣* — Havolani ulashing\n└ Referral havolangizni do'stingizga yuboring\n\n*Qadam 2️⃣* — Do'st karta ochadi\n└ Do'stingiz ilovani yuklab, bepul karta ochadi\n\n*Qadam 3️⃣* — Pul tushadi! 💰\n└ Karta ochilgach, sizga 45 000 so'm o'tkaziladi\n\n✅ Shunday oddiy! Qancha ko'p do'st, shuncha ko'p pul!\n\n❓ *Savollar:*\n• 💳 Karta — to'liq bepul\n• 💰 Bonus — bir necha soatda\n• 👥 Limit — CHEKSIZ`,

    stats: `📊 *Sizning Statistikangiz*\n\n🤑 Potensial daromad (10 do'st): *450 000 so'm*\n🤑 Potensial daromad (50 do'st): *2 250 000 so'm*\n🤑 Potensial daromad (100 do'st): *4 500 000 so'm*\n\n💡 *Maslahat:*\nHar kuni 2-3 ta do'stga yuboring — oyiga millions ishlang! 🚀\n\nDo'stlaringiz uchun havola:\n📱 \`${APP_LINK}\``,

    support: `📞 *Qo'llab-Quvvatlash*\n\n❓ Savollaringiz bormi? Biz yordam beramiz!\n\n💬 Telegram: ${SUPPORT_USERNAME}\n📧 Uzum Bank rasmiy qo'llab-quvvatlash\n\n🕐 Ish vaqti: 24/7\n\n🔗 Rasmiy sayt: uzumbank.uz`,

    links: (app: string, bot: string) => `🔗 *Sizning Referral Havolalaringiz:*\n\n📱 *Ilova:*\n\`${app}\`\n\n🤖 *Bot:*\n\`${bot}\`\n\n💰 Har bir do'st uchun *45 000 so'm!*`,

    help: `🆘 *Yordam*\n\n📌 *Buyruqlar:*\n/start — Botni qayta boshlash\n/havola — Referral havola\n/stats — Statistika\n/lang — Til o'zgartirish 🇺🇿🇷🇺\n/help — Yordam\n\n❓ Savollar uchun: ${SUPPORT_USERNAME}`,

    changeLang: `🌐 *Tilni tanlang / Выберите язык:*`,
    back: "🔙 Orqaga",
    openCard: "🚀 Karta Ochish →",
    shareTg: "✈️ Telegramda Ulashish",
    openApp: "📱 Mini App →",
    unknown: "👋 Salom! /start buyrug'ini yuboring yoki menyudan foydalaning.",
  },

  ru: {
    welcome: (name: string) => `
⚡️ *Привет, ${name}!* ⚡️

💰 *Добро пожаловать в реферальную программу Uzum Bank!*

Откройте бесплатную виртуальную карту и зарабатывайте, приглашая друзей!

🌟 *Что вы получаете:*
• 💳 Бесплатная виртуальная карта — 0 сум
• 🤑 За каждого друга *45 000 сум*
• 🛒 Специальные цены в Uzum Market
• ♾️ Неограниченный заработок

👇 Выберите из меню:`,

    card: `💳 *Откройте бесплатную виртуальную карту!*\n\n✅ Открытие карты — *ПОЛНОСТЬЮ БЕСПЛАТНО* (0 сум)\n✅ Идеально для онлайн-покупок\n✅ Специальные цены в Uzum Market\n✅ Кэшбэк и бонусы\n\n🔗 Зарегистрируйтесь по ссылке:`,

    invite: (app: string, bot: string) => `
🤝 *Пригласите друзей!*

🤑 За каждое приглашение: *45 000 сум*
♾️ Лимит приглашений: *БЕЗЛИМИТНЫЙ*

📱 *Ссылка на приложение:*
\`${app}\`

🤖 *Ссылка на бота:*
\`${bot}\`

👇 Поделитесь в Telegram:`,

    shareMsg: (app: string) => `⚡️ Друг, скачай приложение Uzum Bank и получи бесплатную виртуальную карту!\n\n💰 45 000 сум бонус за регистрацию!\n🛒 Специальные цены в Uzum Market\n\n📱 Приложение: ${app}\n🤖 Бот: ${BOT_LINK}`,

    opportunities: `🌟 *Возможности и преимущества*\n\n💳 *Бесплатная виртуальная карта*\n└ Откройте за 0 сум\n\n🤑 *Бонус 45 000 сум*\n└ За каждого приглашённого друга\n\n🛒 *Привилегии в Uzum Market*\n└ Специальные скидки и акции\n\n⚡️ *Быстрые платежи*\n└ 24/7 в любое время\n\n📊 *Кэшбэк программа*\n└ Процент возвращается с каждой покупки\n\n🔒 *Надёжный банк*\n└ Лицензированный банк Узбекистана\n\n♾️ *Безлимитный заработок*\n└ Чем больше друзей — тем больше денег!`,

    howItWorks: `📖 *Как это работает?*\n\n*Шаг 1️⃣* — Поделитесь ссылкой\n└ Отправьте реферальную ссылку другу\n\n*Шаг 2️⃣* — Друг открывает карту\n└ Друг скачивает приложение и открывает карту\n\n*Шаг 3️⃣* — Деньги падают! 💰\n└ После открытия карты вам зачисляется 45 000 сум\n\n✅ Всё просто! Чем больше друзей, тем больше денег!\n\n❓ *Вопросы:*\n• 💳 Карта — полностью бесплатно\n• 💰 Бонус — в течение нескольких часов\n• 👥 Лимит — БЕЗЛИМИТ`,

    stats: `📊 *Ваша статистика*\n\n🤑 Потенциальный заработок (10 друзей): *450 000 сум*\n🤑 Потенциальный заработок (50 друзей): *2 250 000 сум*\n🤑 Потенциальный заработок (100 друзей): *4 500 000 сум*\n\n💡 *Совет:*\nОтправляйте 2-3 друзьям каждый день — зарабатывайте миллионы в месяц! 🚀\n\nВаша ссылка:\n📱 \`${APP_LINK}\``,

    support: `📞 *Поддержка*\n\n❓ Есть вопросы? Мы поможем!\n\n💬 Telegram: ${SUPPORT_USERNAME}\n📧 Официальная поддержка Uzum Bank\n\n🕐 Время работы: 24/7\n\n🔗 Официальный сайт: uzumbank.uz`,

    links: (app: string, bot: string) => `🔗 *Ваши реферальные ссылки:*\n\n📱 *Приложение:*\n\`${app}\`\n\n🤖 *Бот:*\n\`${bot}\`\n\n💰 За каждого друга *45 000 сум!*`,

    help: `🆘 *Помощь*\n\n📌 *Команды:*\n/start — Перезапустить бота\n/havola — Реферальные ссылки\n/stats — Статистика\n/lang — Сменить язык 🇺🇿🇷🇺\n/help — Помощь\n\n❓ По вопросам: ${SUPPORT_USERNAME}`,

    changeLang: `🌐 *Tilni tanlang / Выберите язык:*`,
    back: "🔙 Назад",
    openCard: "🚀 Открыть карту →",
    shareTg: "✈️ Поделиться в Telegram",
    openApp: "📱 Открыть Mini App →",
    unknown: "👋 Привет! Отправьте /start или используйте меню.",
  },
};

// ─── KEYBOARDS ────────────────────────────────────────────────────────────────
function mainKb(lang: "uz" | "ru", hasApp: boolean) {
  const isUz = lang === "uz";
  const kb = new InlineKeyboard()
    .text(isUz ? "💳 Karta Ochish" : "💳 Открыть карту", "open_card")
    .text(isUz ? "🤑 Do'st Taklif" : "🤑 Пригласить друга", "invite").row()
    .text(isUz ? "📊 Imkoniyatlar" : "📊 Возможности", "opportunities")
    .text(isUz ? "❓ Qanday Ishlaydi?" : "❓ Как работает?", "how_it_works").row()
    .text(isUz ? "📈 Statistika" : "📈 Статистика", "stats")
    .text(isUz ? "📞 Yordam" : "📞 Поддержка", "support").row();

  if (hasApp) {
    kb.webApp(isUz ? "🚀 Mini App'ni Ochish ⚡️" : "🚀 Открыть Mini App ⚡️", MINI_APP_URL).row();
  }

  kb.text(isUz ? "🌐 Русский" : "🌐 O'zbek tili", "lang_toggle");
  return kb;
}

function backKb(lang: "uz" | "ru") {
  return new InlineKeyboard().text(T[lang].back, "back_main");
}

// ─── BOT ──────────────────────────────────────────────────────────────────────
export function startBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    logger.warn("TELEGRAM_BOT_TOKEN not set, bot will not start");
    return;
  }

  const bot = new Bot<MyContext>(token);

  bot.use(session({ initial: (): SessionData => ({ lang: "uz" }) }));

  // ── Admin notify helper ──
  async function notifyAdmin(text: string) {
    try {
      await bot.api.sendMessage(ADMIN_ID, text, { parse_mode: "Markdown" });
    } catch {
      // Admin may not have started the bot yet
    }
  }

  // ── /start ──
  bot.command("start", async (ctx) => {
    const name = ctx.from?.first_name || "Do'stim";
    const username = ctx.from?.username ? `@${ctx.from.username}` : "username yo'q";
    const userId = ctx.from?.id;
    const lang = ctx.session.lang ?? "uz";
    const t = T[lang];

    await ctx.reply(t.welcome(name), {
      parse_mode: "Markdown",
      reply_markup: mainKb(lang, !!MINI_APP_URL),
    });

    if (userId !== ADMIN_ID) {
      await notifyAdmin(
        `🆕 *Yangi foydalanuvchi!*\n\n👤 Ism: *${name}*\n🔗 Username: ${username}\n🆔 ID: \`${userId}\`\n🌐 Til: ${lang === "uz" ? "🇺🇿 O'zbek" : "🇷🇺 Rus"}`
      );
    }
  });

  // ── /admin ──
  bot.command("admin", async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID) {
      await ctx.reply("❌ Sizda admin huquqi yo'q.");
      return;
    }
    const kb = new InlineKeyboard()
      .text("📊 Statistika", "admin_stats").row()
      .text("📢 Xabar yuborish", "admin_broadcast").row()
      .text("🔗 Havolalar", "admin_links");

    await ctx.reply(
      `🛠 *Admin Panel*\n\n` +
      `👑 Xush kelibsiz, Admin!\n\n` +
      `📱 App: \`${APP_LINK}\`\n` +
      `🤖 Bot: \`${BOT_LINK}\`\n\n` +
      `Quyidagi tugmalardan foydalaning:`,
      { parse_mode: "Markdown", reply_markup: kb }
    );
  });

  bot.callbackQuery("admin_stats", async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID) { await ctx.answerCallbackQuery("❌"); return; }
    await ctx.answerCallbackQuery();
    await ctx.reply(
      `📊 *Bot Statistikasi*\n\n` +
      `✅ Bot ishlayapti\n` +
      `🔗 App havola: \`${APP_LINK}\`\n` +
      `🤖 Bot havola: \`${BOT_LINK}\`\n\n` +
      `💡 Har yangi foydalanuvchi haqida sizga xabar keladi.`,
      { parse_mode: "Markdown" }
    );
  });

  bot.callbackQuery("admin_broadcast", async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID) { await ctx.answerCallbackQuery("❌"); return; }
    await ctx.answerCallbackQuery();
    await ctx.reply(
      `📢 *Xabar yuborish*\n\nFoydalanuvchilarga xabar yuborish uchun:\n\`/broadcast <xabar matni>\`\n\nMasalan:\n/broadcast 🎉 Yangi aksiya boshlandi!`,
      { parse_mode: "Markdown" }
    );
  });

  bot.callbackQuery("admin_links", async (ctx) => {
    if (ctx.from?.id !== ADMIN_ID) { await ctx.answerCallbackQuery("❌"); return; }
    await ctx.answerCallbackQuery();
    await ctx.reply(
      `🔗 *Referral Havolalar*\n\n📱 *App:*\n\`${APP_LINK}\`\n\n🤖 *Bot:*\n\`${BOT_LINK}\``,
      { parse_mode: "Markdown" }
    );
  });

  // ── /lang ──
  bot.command("lang", async (ctx) => {
    await ctx.reply(T.uz.changeLang, {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard()
        .text("🇺🇿 O'zbek tili", "set_lang_uz")
        .text("🇷🇺 Русский язык", "set_lang_ru"),
    });
  });

  // ── /help ──
  bot.command("help", async (ctx) => {
    const lang = ctx.session.lang ?? "uz";
    await ctx.reply(T[lang].help, { parse_mode: "Markdown" });
  });

  // ── /havola ──
  bot.command("havola", async (ctx) => {
    const lang = ctx.session.lang ?? "uz";
    await ctx.reply(T[lang].links(APP_LINK, BOT_LINK), {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard()
        .url("📱 App", APP_LINK)
        .url("🤖 Bot", BOT_LINK),
    });
  });

  // ── /stats ──
  bot.command("stats", async (ctx) => {
    const lang = ctx.session.lang ?? "uz";
    await ctx.reply(T[lang].stats, {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard()
        .text(lang === "uz" ? "🤑 Do'stni Taklif Qil" : "🤑 Пригласить друга", "invite")
        .row()
        .text(T[lang].back, "back_main"),
    });
  });

  // ── Language callbacks ──
  bot.callbackQuery("set_lang_uz", async (ctx) => {
    ctx.session.lang = "uz";
    await ctx.answerCallbackQuery("🇺🇿 O'zbek tili tanlandi!");
    const name = ctx.from?.first_name || "Do'stim";
    await ctx.editMessageText(T.uz.welcome(name), {
      parse_mode: "Markdown",
      reply_markup: mainKb("uz", !!MINI_APP_URL),
    });
  });

  bot.callbackQuery("set_lang_ru", async (ctx) => {
    ctx.session.lang = "ru";
    await ctx.answerCallbackQuery("🇷🇺 Русский язык выбран!");
    const name = ctx.from?.first_name || "Друг";
    await ctx.editMessageText(T.ru.welcome(name), {
      parse_mode: "Markdown",
      reply_markup: mainKb("ru", !!MINI_APP_URL),
    });
  });

  bot.callbackQuery("lang_toggle", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(T.uz.changeLang, {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard()
        .text("🇺🇿 O'zbek tili", "set_lang_uz")
        .text("🇷🇺 Русский язык", "set_lang_ru"),
    });
  });

  // ── open_card ──
  bot.callbackQuery("open_card", async (ctx) => {
    await ctx.answerCallbackQuery();
    const lang = ctx.session.lang ?? "uz";
    await ctx.reply(T[lang].card, {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard()
        .url(T[lang].openCard, APP_LINK).row()
        .text(T[lang].back, "back_main"),
    });
  });

  // ── invite ──
  bot.callbackQuery("invite", async (ctx) => {
    await ctx.answerCallbackQuery();
    const lang = ctx.session.lang ?? "uz";
    const shareText = encodeURIComponent(T[lang].shareMsg(APP_LINK));
    const tgShareUrl = `https://t.me/share/url?url=${encodeURIComponent(APP_LINK)}&text=${shareText}`;

    await ctx.reply(T[lang].invite(APP_LINK, BOT_LINK), {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard()
        .url(T[lang].shareTg, tgShareUrl).row()
        .url("📱 App link", APP_LINK)
        .url("🤖 Bot link", BOT_LINK).row()
        .text(T[lang].back, "back_main"),
    });
  });

  // ── opportunities ──
  bot.callbackQuery("opportunities", async (ctx) => {
    await ctx.answerCallbackQuery();
    const lang = ctx.session.lang ?? "uz";
    await ctx.reply(T[lang].opportunities, {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard()
        .url(T[lang].openCard, APP_LINK).row()
        .text(T[lang].back, "back_main"),
    });
  });

  // ── how_it_works ──
  bot.callbackQuery("how_it_works", async (ctx) => {
    await ctx.answerCallbackQuery();
    const lang = ctx.session.lang ?? "uz";
    await ctx.reply(T[lang].howItWorks, {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard()
        .url(lang === "uz" ? "🚀 Boshlash →" : "🚀 Начать →", APP_LINK).row()
        .text(T[lang].back, "back_main"),
    });
  });

  // ── stats ──
  bot.callbackQuery("stats", async (ctx) => {
    await ctx.answerCallbackQuery();
    const lang = ctx.session.lang ?? "uz";
    await ctx.reply(T[lang].stats, {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard()
        .text(lang === "uz" ? "🤑 Do'stni Taklif Qil" : "🤑 Пригласить друга", "invite").row()
        .text(T[lang].back, "back_main"),
    });
  });

  // ── support ──
  bot.callbackQuery("support", async (ctx) => {
    await ctx.answerCallbackQuery();
    const lang = ctx.session.lang ?? "uz";
    await ctx.reply(T[lang].support, {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard()
        .url(lang === "uz" ? "💬 Yordam" : "💬 Поддержка", `https://t.me/${SUPPORT_USERNAME.replace("@", "")}`).row()
        .text(T[lang].back, "back_main"),
    });
  });

  // ── open_miniapp ──
  bot.callbackQuery("open_miniapp", async (ctx) => {
    await ctx.answerCallbackQuery();
    const lang = ctx.session.lang ?? "uz";
    if (!MINI_APP_URL) {
      await ctx.reply(lang === "uz" ? "📱 Mini App tez orada ishga tushadi! ⚡️" : "📱 Mini App скоро будет доступен! ⚡️");
      return;
    }
    await ctx.reply(lang === "uz" ? "📱 Mini App'ni oching:" : "📱 Открыть Mini App:", {
      reply_markup: new InlineKeyboard().webApp(T[lang].openApp, MINI_APP_URL),
    });
  });

  // ── back_main ──
  bot.callbackQuery("back_main", async (ctx) => {
    await ctx.answerCallbackQuery();
    const lang = ctx.session.lang ?? "uz";
    const name = ctx.from?.first_name || (lang === "uz" ? "Do'stim" : "Друг");
    await ctx.reply(T[lang].welcome(name), {
      parse_mode: "Markdown",
      reply_markup: mainKb(lang, !!MINI_APP_URL),
    });
  });

  // ── Inline mode — @botname + search ──
  bot.on("inline_query", async (ctx) => {
    const lang = (ctx.from as any)?.language_code?.startsWith("ru") ? "ru" : "uz";
    const shareMsg = T[lang].shareMsg(APP_LINK);

    const results = [
      InlineQueryResultBuilder.article("ref_app", lang === "uz" ? "📱 Ilova havolasini ulash" : "📱 Поделиться ссылкой на приложение", {
        description: lang === "uz" ? "Uzum Bank ilovasi orqali 45 000 so'm oling" : "Получите 45 000 сум через приложение Uzum Bank",
        reply_markup: new InlineKeyboard().url(lang === "uz" ? "📱 Ilovani Ochish" : "📱 Открыть приложение", APP_LINK),
      }).text(shareMsg),

      InlineQueryResultBuilder.article("ref_bot", lang === "uz" ? "🤖 Bot havolasini ulash" : "🤖 Поделиться ссылкой на бота", {
        description: lang === "uz" ? "Uzum Bank bot orqali 45 000 so'm oling" : "Получите 45 000 сум через бота Uzum Bank",
        reply_markup: new InlineKeyboard().url(lang === "uz" ? "🤖 Botni Ochish" : "🤖 Открыть бота", BOT_LINK),
      }).text(shareMsg),

      InlineQueryResultBuilder.article("both", lang === "uz" ? "⚡️ Ikkala havolani ulash" : "⚡️ Поделиться обеими ссылками", {
        description: "45 000 so'm bonus — app + bot havolalari",
        reply_markup: new InlineKeyboard()
          .url("📱 App", APP_LINK)
          .url("🤖 Bot", BOT_LINK),
      }).text(shareMsg),
    ];

    await ctx.answerInlineQuery(results, { cache_time: 0 });
  });

  // ── Unknown messages ──
  bot.on("message", async (ctx) => {
    const lang = ctx.session.lang ?? "uz";
    await ctx.reply(T[lang].unknown, {
      reply_markup: mainKb(lang, !!MINI_APP_URL),
    });
  });

  bot.catch((err) => {
    logger.error({ err: err.error }, "Bot error");
  });

  bot.start({
    onStart: () => logger.info("Telegram bot started successfully 🤖"),
    drop_pending_updates: true,
    allowed_updates: ["message", "callback_query", "inline_query"],
  });

  logger.info("Bot initialization complete");
  return bot;
}
