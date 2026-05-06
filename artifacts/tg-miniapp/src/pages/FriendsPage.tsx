import { useState } from "react";

const APP_LINK = "https://b.2u.uz/ref?c=50&a=L6DaizF7cl";
const BOT_LINK = "https://t.me/UzumBankRbot?start=L6DaizF7cl";

const shareText = `⚡️ Do'stim, bugun Uzum Bank ilovasini yuklab, bepul virtual karta oching!

💰 Men sizga 45 000 so'm sovg'a qilaman!
🛒 Uzum Marketda maxsus narxlar

📱 Ilova orqali: ${APP_LINK}
🤖 Bot orqali: ${BOT_LINK}`;

export default function FriendsPage() {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: "Uzum Bank Taklif", text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const tgShare = `https://t.me/share/url?url=${encodeURIComponent(APP_LINK)}&text=${encodeURIComponent("⚡️ Uzum Bank orqali 45 000 so'm ishlang! Bepul virtual karta oching 💳")}`;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-5 pt-10 pb-14 relative overflow-hidden">
        <div className="absolute top-4 right-4 text-5xl opacity-20 animate-float">👥</div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
            🤝 Do'stlarni taklif qiling
          </div>
          <h1 className="text-2xl font-black text-white">
            Do'stlaringizni<br />
            <span className="text-yellow-300">boy qiling! 🎁</span>
          </h1>
          <p className="text-white/80 text-sm mt-2">
            Har bir do'st uchun <strong>45 000 so'm</strong> oling
          </p>
        </div>
      </div>

      {/* Earnings Calc */}
      <div className="mx-4 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-4 border border-green-100">
          <p className="text-xs text-gray-500 font-semibold mb-3">💡 Hisoblab ko'ring</p>
          <div className="grid grid-cols-3 gap-2">
            {[1, 5, 10].map((n) => (
              <div key={n} className="bg-gradient-to-b from-emerald-50 to-teal-50 rounded-xl p-3 text-center border border-emerald-100">
                <div className="text-sm font-black text-gray-700">{n} do'st</div>
                <div className="text-lg font-black text-emerald-600 mt-0.5">
                  {(n * 45000).toLocaleString("uz")}
                </div>
                <div className="text-[10px] text-gray-500">so'm</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Share Message Preview */}
      <div className="mx-4 mt-5">
        <h2 className="text-sm font-bold text-gray-700 mb-2">📨 Taklif xabari</h2>
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-lg flex-shrink-0">
              😊
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm p-3 shadow-sm flex-1 border border-gray-100">
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                {shareText}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="px-4 mt-4 flex flex-col gap-3">
        <button
          onClick={handleShare}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 active:scale-95 transition-transform"
        >
          {copied ? "✅ Nusxalandi!" : "📤 Xabarni ulashish"}
        </button>

        <a
          href={tgShare}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-transform"
        >
          ✈️ Telegramda ulashish
        </a>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">💡</span>
          <div>
            <p className="text-sm font-bold text-amber-800">Maslahat!</p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              Do'stingiz havola orqali karta ochgandan keyin sizga avtomatik 45 000 so'm tushadi. Qancha ko'p taklif, shuncha ko'p daromad! 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
