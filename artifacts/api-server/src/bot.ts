import { Bot, InlineKeyboard, session, type SessionFlavor } from "grammy";
import { logger } from "./lib/logger";

const APP_LINK = "https://b.2u.uz/ref?c=50&a=L6DaizF7cl";
const BOT_LINK = "https://t.me/UzumBankRbot?start=L6DaizF7cl";

interface SessionData {
  step?: string;
}

type MyContext = SessionFlavor<SessionData>;

const MINI_APP_URL = process.env.MINI_APP_URL || "";

const welcomeText = `
⚡️ *Assalomu alaykum! Xush kelibsiz!* ⚡️

💰 *Uzum Bank Referral Dasturiga xush kelibsiz!*

Bepul virtual karta oching va do'stlaringizni taklif qilib daromad ishlang!

🌟 *Sizni nima kutmoqda:*
• 💳 Bepul virtual karta — 0 so'mga
• 🤑 Har bir do'st uchun *45 000 so'm*
• 🛒 Uzum Marketda maxsus narxlar
• ♾️ Cheksiz daromad imkoniyati

👇 Quyidagi tugmalardan birini tanlang:
`;

const mainKeyboard = (hasApp: boolean) => {
  const kb = new InlineKeyboard()
    .text("💳 Karta Ochish", "open_card")
    .text("🤑 Do'st Taklif Qilish", "invite").row()
    .text("📊 Imkoniyatlar", "opportunities")
    .text("❓ Qanday Ishlaydi?", "how_it_works").row()
    .text("📱 Mini App'ni Ochish", "open_miniapp").row();
  return kb;
};

export function startBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    logger.warn("TELEGRAM_BOT_TOKEN not set, bot will not start");
    return;
  }

  const bot = new Bot<MyContext>(token);

  bot.use(session({ initial: (): SessionData => ({}) }));

  bot.command("start", async (ctx) => {
    const name = ctx.from?.first_name || "Do'stim";
    await ctx.replyWithPhoto(
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Uzum_Bank_logo.svg/1200px-Uzum_Bank_logo.svg.png",
      {
        caption: welcomeText.replace("Assalomu alaykum!", `Assalomu alaykum, *${name}*!`),
        parse_mode: "Markdown",
        reply_markup: mainKeyboard(!!MINI_APP_URL),
      }
    ).catch(() =>
      ctx.reply(welcomeText.replace("Assalomu alaykum!", `Assalomu alaykum, *${name}*!`), {
        parse_mode: "Markdown",
        reply_markup: mainKeyboard(!!MINI_APP_URL),
      })
    );
  });

  bot.callbackQuery("open_card", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(
      `💳 *Bepul Virtual Kartangizni Oching!*\n\n✅ Karta ochish — *TO'LIQ BEPUL* (0 so'm)\n✅ Onlayn xaridlar uchun ideal\n✅ Uzum Marketda maxsus narxlar\n\n👇 Quyidagi havoladan ro'yxatdan o'ting:\n\n🔗 ${APP_LINK}`,
      {
        parse_mode: "Markdown",
        reply_markup: new InlineKeyboard()
          .url("🚀 Karta Ochish →", APP_LINK)
          .row()
          .text("🔙 Orqaga", "back_main"),
      }
    );
  });

  bot.callbackQuery("invite", async (ctx) => {
    await ctx.answerCallbackQuery();
    const shareMsg = encodeURIComponent(
      `⚡️ Do'stim, bugun Uzum Bank ilovasini yuklab, bepul virtual karta oching!\n\n💰 Har bir taklif uchun 45 000 so'm bonus!\n🛒 Uzum Marketda maxsus narxlar\n\n📱 Ilova: ${APP_LINK}\n🤖 Bot: ${BOT_LINK}`
    );
    await ctx.reply(
      `🤝 *Do'stlaringizni Taklif Qiling!*\n\n🤑 Har bir taklif uchun: *45 000 so'm*\n♾️ Taklif limiti: *CHEKSIZ*\n\n📱 *Ilova havolasi:*\n\`${APP_LINK}\`\n\n🤖 *Bot havolasi:*\n\`${BOT_LINK}\`\n\n👇 Telegramda ulashing:`,
      {
        parse_mode: "Markdown",
        reply_markup: new InlineKeyboard()
          .url("✈️ Telegramda Ulashish", `https://t.me/share/url?url=${encodeURIComponent(APP_LINK)}&text=${shareMsg}`)
          .row()
          .url("📱 Ilova Havolasi", APP_LINK)
          .url("🤖 Bot Havolasi", BOT_LINK)
          .row()
          .text("🔙 Orqaga", "back_main"),
      }
    );
  });

  bot.callbackQuery("opportunities", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(
      `🌟 *Imkoniyatlar va Afzalliklar*\n\n` +
      `💳 *Bepul Virtual Karta*\n└ 0 so'mga oching, hech qanday yashirin to'lov yo'q\n\n` +
      `🤑 *45 000 so'm Bonus*\n└ Har bir taklif qilgan do'stingiz uchun\n\n` +
      `🛒 *Uzum Market Imtiyozlari*\n└ Maxsus chegirmalar va aksiyalar\n\n` +
      `⚡️ *Tezkor To'lovlar*\n└ 24/7 istalgan vaqtda\n\n` +
      `📊 *Cashback Dasturi*\n└ Har xariddan foiz qaytariladi\n\n` +
      `🔒 *Xavfsiz Bank*\n└ O'zbekiston litsenziyali bank\n\n` +
      `♾️ *Cheksiz Daromad*\n└ Qancha ko'p do'st — shuncha ko'p pul!`,
      {
        parse_mode: "Markdown",
        reply_markup: new InlineKeyboard()
          .url("📱 Hozir Boshlash →", APP_LINK)
          .row()
          .text("🔙 Orqaga", "back_main"),
      }
    );
  });

  bot.callbackQuery("how_it_works", async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(
      `📖 *Qanday Ishlaydi?*\n\n` +
      `*Qadam 1️⃣* — Havolani ulashing\n└ Referral havolangizni do'stingizga yuboring\n\n` +
      `*Qadam 2️⃣* — Do'st karta ochadi\n└ Do'stingiz ilovani yuklab, bepul karta ochadi\n\n` +
      `*Qadam 3️⃣* — Pul tushadi! 💰\n└ Karta ochilgach, sizga 45 000 so'm o'tkaziladi\n\n` +
      `✅ Shunday oddiy! Cheklov yo'q — qancha ko'p do'st, shuncha ko'p pul!\n\n` +
      `❓ *Savollar:*\n• 💳 Karta — to'liq bepul\n• 💰 Bonus — bir necha soatda\n• 👥 Limit — CHEKSIZ`,
      {
        parse_mode: "Markdown",
        reply_markup: new InlineKeyboard()
          .url("🚀 Boshlash →", APP_LINK)
          .row()
          .text("🔙 Orqaga", "back_main"),
      }
    );
  });

  bot.callbackQuery("open_miniapp", async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!MINI_APP_URL) {
      await ctx.reply("📱 Mini App tez orada ishga tushadi! ⚡️");
      return;
    }
    await ctx.reply("📱 Mini App'ni oching:", {
      reply_markup: new InlineKeyboard().webApp("⚡️ Mini App'ni Ochish", MINI_APP_URL),
    });
  });

  bot.callbackQuery("back_main", async (ctx) => {
    await ctx.answerCallbackQuery();
    const name = ctx.from?.first_name || "Do'stim";
    await ctx.reply(
      welcomeText.replace("Assalomu alaykum!", `Assalomu alaykum, *${name}*!`),
      {
        parse_mode: "Markdown",
        reply_markup: mainKeyboard(!!MINI_APP_URL),
      }
    );
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(
      `🆘 *Yordam*\n\n` +
      `📌 *Buyruqlar:*\n` +
      `/start — Botni qayta boshlash\n` +
      `/havola — Referral havola\n` +
      `/help — Yordam\n\n` +
      `❓ Savollar uchun: @UzumSupport`,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("havola", async (ctx) => {
    await ctx.reply(
      `🔗 *Sizning Referral Havolalaringiz:*\n\n` +
      `📱 *Ilova:*\n\`${APP_LINK}\`\n\n` +
      `🤖 *Bot:*\n\`${BOT_LINK}\`\n\n` +
      `💰 Har bir do'st uchun *45 000 so'm!*`,
      {
        parse_mode: "Markdown",
        reply_markup: new InlineKeyboard()
          .url("📱 Ilovani Ochish", APP_LINK)
          .url("🤖 Bot", BOT_LINK),
      }
    );
  });

  bot.on("message", async (ctx) => {
    await ctx.reply(
      `👋 Salom! Quyidagi tugmalardan foydalaning yoki /start buyrug'ini yuboring.`,
      { reply_markup: mainKeyboard(!!MINI_APP_URL) }
    );
  });

  bot.catch((err) => {
    logger.error({ err: err.error }, "Bot error");
  });

  bot.start({
    onStart: () => logger.info("Telegram bot started successfully 🤖"),
    drop_pending_updates: true,
  });

  logger.info("Bot initialization complete");
  return bot;
}
