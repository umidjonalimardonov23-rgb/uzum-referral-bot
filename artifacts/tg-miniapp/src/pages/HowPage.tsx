import { useState } from "react";
import { useTelegram } from "../hooks/useTelegram";

const APP_LINK = "https://b.2u.uz/ref?c=50&a=L6DaizF7cl";

const steps = [
  {
    step: "01",
    icon: "📱",
    title: "Havolani ulashing",
    desc: "Referral havolangizni do'stlaringizga yuboring — Telegram, WhatsApp yoki boshqa ilovalar orqali.",
    color: "from-violet-500 to-purple-600",
    light: "bg-violet-50 border-violet-100",
  },
  {
    step: "02",
    icon: "💳",
    title: "Do'st karta ochadi",
    desc: "Do'stingiz havolangiz orqali Uzum Bank ilovasini yuklab, bepul virtual karta ochadi.",
    color: "from-blue-500 to-indigo-600",
    light: "bg-blue-50 border-blue-100",
  },
  {
    step: "03",
    icon: "⚡️",
    title: "45 000 so'm oling!",
    desc: "Karta muvaffaqiyatli ochilgandan keyin hisobingizga 45 000 so'm tushadi. Shunday oddiy!",
    color: "from-emerald-500 to-teal-600",
    light: "bg-emerald-50 border-emerald-100",
  },
];

const faqs = [
  {
    q: "💳 Karta ochish to'lovmi?",
    a: "Yo'q! Uzum Bank virtual kartasi to'liq bepul. 0 so'mga ochiladi. Hech qanday yashirin to'lov yo'q.",
  },
  {
    q: "💰 Qachon pul tushadi?",
    a: "Do'stingiz karta ochgandan so'ng bir necha soat ichida pul hisobingizga tushadi. Odatda 1-24 soat ichida.",
  },
  {
    q: "👥 Nechta do'st taklif qilsa bo'ladi?",
    a: "Cheklov yo'q! Qancha ko'p do'st taklif qilsangiz, shuncha ko'p daromad olasiz. Limitsiz!",
  },
  {
    q: "🛒 Uzum Market bonuslari nima?",
    a: "Uzum Bank kartasi egasi sifatida Uzum Marketdagi maxsus chegirmalar va bonuslardan foydalanasiz.",
  },
  {
    q: "📱 Ilova qayerdan yuklanadi?",
    a: "Uzum Bank ilovasi App Store va Google Play'da mavjud. Referral havola orqali to'g'ridan-to'g'ri yuklab olishingiz mumkin.",
  },
  {
    q: "🔒 Pulim xavfsizmi?",
    a: "Ha! Uzum Bank O'zbekiston Markaziy Banki tomonidan litsenziyalangan. Barcha mablag'lar kafolatlangan.",
  },
];

export default function HowPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const { haptic } = useTelegram();

  const toggleFaq = (i: number) => {
    haptic.impact("light");
    setOpenIdx(openIdx === i ? null : i);
  };

  return (
    <div className="flex flex-col pb-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700 px-5 pt-10 pb-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {["⭐", "💫", "✨", "⭐", "💫", "✨", "⭐", "💫", "✨", "⭐"].map((em, i) => (
            <div
              key={i}
              className="absolute text-2xl"
              style={{
                top: `${(i * 17 + 5) % 90}%`,
                left: `${(i * 23 + 10) % 90}%`,
              }}
            >
              {em}
            </div>
          ))}
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
            📖 Qanday ishlaydi?
          </div>
          <h1 className="text-2xl font-black text-white">
            3 ta qadam —<br />
            <span className="text-yellow-300">pul sizniki! 💸</span>
          </h1>
        </div>
      </div>

      {/* Steps */}
      <div className="px-4 -mt-6 relative z-10 flex flex-col gap-4">
        {steps.map((s, i) => (
          <div key={i} className={`${s.light} border rounded-2xl p-4 flex gap-4`}>
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
              <span className="text-2xl">{s.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>
                  QADAM {s.step}
                </span>
              </div>
              <h3 className="font-bold text-gray-800 text-sm">{s.title}</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Flow */}
      <div className="mx-4 mt-5 bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-4 text-white">
        <p className="text-xs font-bold text-white/60 mb-3 uppercase tracking-wider">Jarayon</p>
        <div className="flex items-center gap-2 justify-between">
          {[
            { icon: "📤", label: "Yubordi" },
            { icon: "→", label: "" },
            { icon: "💳", label: "Karta" },
            { icon: "→", label: "" },
            { icon: "💰", label: "45K so'm" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className={`${item.label ? "text-2xl" : "text-xl text-white/50"}`}>{item.icon}</span>
              {item.label && <span className="text-[9px] font-semibold text-white/70">{item.label}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 mt-5">
        <a
          href={APP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => haptic.impact("heavy")}
          className="w-full bg-gradient-to-r from-violet-600 to-purple-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-purple-200 active:scale-95 transition-transform"
        >
          🚀 Hoziroq Boshlash →
        </a>
      </div>

      {/* FAQ — Accordion */}
      <div className="px-4 mt-5">
        <h2 className="text-sm font-bold text-gray-700 mb-3">❓ Ko'p so'raladigan savollar</h2>
        <div className="flex flex-col gap-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(i)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <p className="text-sm font-bold text-gray-800 flex-1 pr-2">{faq.q}</p>
                <span className={`text-gray-400 text-lg transition-transform duration-200 ${openIdx === i ? "rotate-180" : ""}`}>
                  ⌄
                </span>
              </button>
              {openIdx === i && (
                <div className="px-4 pb-4 -mt-1">
                  <p className="text-xs text-gray-500 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
