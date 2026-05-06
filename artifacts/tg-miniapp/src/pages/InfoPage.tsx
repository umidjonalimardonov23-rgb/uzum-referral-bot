const APP_LINK = "https://b.2u.uz/ref?c=50&a=L6DaizF7cl";
const BOT_LINK = "https://t.me/UzumBankRbot?start=L6DaizF7cl";

const features = [
  { icon: "💳", title: "Bepul Virtual Karta", desc: "Uzum Bank virtual kartasi 0 so'mga ochiladi. Hech qanday yashirin to'lov yo'q!" },
  { icon: "🤑", title: "45 000 so'm Bonus", desc: "Har bir taklif qilgan do'stingiz uchun hisobingizga 45 000 so'm tushadi." },
  { icon: "🛒", title: "Uzum Market Imtiyozlari", desc: "Karta egasi sifatida Uzum Marketdagi maxsus narxlar va chegirmalardan foydalaning." },
  { icon: "🔒", title: "Xavfsiz va Ishonchli", desc: "Uzum Bank O'zbekistonning eng yirik fintech kompaniyalaridan biri. Pullaringiz xavfsiz." },
  { icon: "⚡️", title: "Tezkor To'lovlar", desc: "24/7 istalgan vaqtda to'lovlar, pul o'tkazmalar va boshqa moliyaviy operatsiyalar." },
  { icon: "📊", title: "Cashback & Bonuslar", desc: "Har bir xariddan cashback oling va bonuslarni to'plovchilar dasturida qatnashing." },
];

export default function InfoPage() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500 px-5 pt-10 pb-14 relative overflow-hidden">
        <div className="absolute top-6 right-4 text-6xl opacity-20 animate-float">🏦</div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
            ℹ️ Uzum Bank haqida
          </div>
          <h1 className="text-2xl font-black text-white">
            Nima uchun<br />
            <span className="text-white/90">Uzum Bank? 🌟</span>
          </h1>
          <p className="text-white/80 text-sm mt-2">
            O'zbekistonning eng qulay raqamli bank
          </p>
        </div>
      </div>

      {/* Referral Promo Card */}
      <div className="mx-4 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-4 py-3 flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <p className="text-white font-bold text-sm">Referral Dasturi</p>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-xs text-gray-500">💰 Bir taklif uchun</span>
              <span className="text-sm font-black text-violet-700">45 000 so'm</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-xs text-gray-500">💳 Karta narxi</span>
              <span className="text-sm font-black text-emerald-600">BEPUL</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-xs text-gray-500">👥 Taklif limiti</span>
              <span className="text-sm font-black text-blue-600">CHEKSIZ</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-gray-500">⚡️ To'lov tezligi</span>
              <span className="text-sm font-black text-orange-600">Tezkor</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-4 mt-5">
        <h2 className="text-sm font-bold text-gray-700 mb-3">🌟 Imkoniyatlar</h2>
        <div className="grid grid-cols-2 gap-3">
          {features.map((f, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
              <div className="text-3xl mb-2">{f.icon}</div>
              <h3 className="text-xs font-bold text-gray-800 leading-tight">{f.title}</h3>
              <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="px-4 mt-5 flex flex-col gap-3 mb-2">
        <a
          href={APP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-gradient-to-r from-violet-600 to-purple-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-purple-200 active:scale-95 transition-transform"
        >
          📱 Ilovani Yuklab Olish
        </a>
        <a
          href={BOT_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-transform"
        >
          🤖 Telegramda Boshlash
        </a>
      </div>

      {/* Footer */}
      <div className="mx-4 mt-3 mb-4 bg-gray-50 rounded-2xl p-4 text-center border border-gray-100">
        <p className="text-xs text-gray-400">
          🏦 Uzum Bank — O'zbekiston Respublikasida litsenziyalangan bank
        </p>
        <p className="text-[10px] text-gray-300 mt-1">
          © 2024 Uzum Bank. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </div>
  );
}
