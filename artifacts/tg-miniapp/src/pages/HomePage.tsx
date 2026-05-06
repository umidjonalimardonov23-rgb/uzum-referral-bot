import { useState } from "react";
import { useCountUp } from "../hooks/useCountUp";
import { useTelegram } from "../hooks/useTelegram";
import SocialProof from "../components/SocialProof";

const APP_LINK = "https://b.2u.uz/ref?c=50&a=L6DaizF7cl";
const BOT_LINK = "https://t.me/UzumBankRbot?start=L6DaizF7cl";

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const { haptic } = useTelegram();

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      haptic.success();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 ${
        copied
          ? "bg-green-100 text-green-700"
          : "bg-white/20 text-white hover:bg-white/30"
      }`}
    >
      {copied ? "✅ Nusxalandi!" : `📋 ${label}`}
    </button>
  );
}

export default function HomePage() {
  const count = useCountUp(45000, 1400);
  const users = useCountUp(12847, 1800);

  return (
    <div className="flex flex-col gap-0 pb-4">
      <SocialProof />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-700 px-5 pt-10 pb-16">
        <div className="absolute top-4 right-4 text-4xl animate-float opacity-40">💸</div>
        <div className="absolute bottom-6 left-6 text-3xl animate-float opacity-30" style={{ animationDelay: "1s" }}>✨</div>
        <div className="absolute top-12 left-2 text-2xl animate-float opacity-20" style={{ animationDelay: "0.5s" }}>⭐</div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full mb-4 animate-bounce">
            ⚡️ TEZ VA OSON
          </div>
          <h1 className="text-3xl font-black text-white leading-tight">
            <span className="text-yellow-300">
              {count.toLocaleString("uz")}
            </span>{" "}
            so'm<br />
            sizniki! 🎉
          </h1>
          <p className="text-white/80 text-sm mt-2 leading-relaxed">
            Har bir do'stingizni taklif qiling va pul ishlang 💰
          </p>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex -space-x-2">
              {["😊", "🤩", "😎", "🥳"].map((em, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-sm">
                  {em}
                </div>
              ))}
            </div>
            <p className="text-white/70 text-xs">
              <span className="font-black text-yellow-300">{users.toLocaleString("uz")}</span> kishi allaqachon ishlayapti!
            </p>
          </div>
        </div>
      </div>

      {/* Earnings Card */}
      <div className="mx-4 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-4 border border-purple-100">
          <p className="text-xs text-gray-500 font-medium mb-1">Bir taklif uchun daromad</p>
          <div className="flex items-end gap-1">
            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-700">
              45 000
            </span>
            <span className="text-xl font-bold text-gray-400 mb-1">so'm</span>
            <span className="text-2xl mb-0.5">🤑</span>
          </div>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full w-3/4 animate-pulse" />
          </div>
          <p className="text-xs text-gray-400 mt-1">Cheklanmagan daromad imkoniyati ♾️</p>
        </div>
      </div>

      {/* Referral Links */}
      <div className="px-4 mt-5 flex flex-col gap-3">
        <h2 className="text-base font-bold text-gray-800">🔗 Referral havolalaringiz</h2>

        {/* App Link */}
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-4 shadow-lg shadow-purple-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📱</span>
              <div>
                <p className="text-white font-bold text-sm">Uzum Bank Ilovasi</p>
                <p className="text-white/70 text-xs">Bepul virtual karta</p>
              </div>
            </div>
            <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-lg">
              45K so'm 💰
            </span>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 mb-3 flex items-center gap-2">
            <span className="text-lg">🌐</span>
            <p className="text-white/90 text-xs font-mono truncate flex-1">{APP_LINK}</p>
          </div>
          <div className="flex gap-2">
            <a
              href={APP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-white text-purple-700 font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow active:scale-95 transition-transform"
            >
              🚀 Ochish
            </a>
            <CopyButton text={APP_LINK} label="Nusxa" />
          </div>
        </div>

        {/* Bot Link */}
        <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-4 shadow-lg shadow-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <div>
                <p className="text-white font-bold text-sm">Telegram Bot</p>
                <p className="text-white/70 text-xs">Botdan ro'yxatdan o'ting</p>
              </div>
            </div>
            <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-lg">
              45K so'm 💰
            </span>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 mb-3 flex items-center gap-2">
            <span className="text-lg">💬</span>
            <p className="text-white/90 text-xs font-mono truncate flex-1">{BOT_LINK}</p>
          </div>
          <div className="flex gap-2">
            <a
              href={BOT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-white text-blue-700 font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow active:scale-95 transition-transform"
            >
              💬 Botga o'tish
            </a>
            <CopyButton text={BOT_LINK} label="Nusxa" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 mt-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "💳", value: "0 so'm", label: "Karta ochish" },
            { icon: "👥", value: "∞", label: "Do'stlar soni" },
            { icon: "⚡️", value: "Tezkor", label: "To'lov" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-sm font-black text-gray-800">{stat.value}</div>
              <div className="text-[10px] text-gray-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
