import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import { useTelegram } from "../hooks/useTelegram";

const APP_LINK = "https://b.2u.uz/ref?c=50&a=L6DaizF7cl";
const BOT_LINK = "https://t.me/UzumBankRbot?start=L6DaizF7cl";
const PER_FRIEND = 45000;

function formatMoney(n: number) {
  return n.toLocaleString("uz") + " so'm";
}

function fireConfetti() {
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: ["#7c3aed", "#a855f7", "#fbbf24", "#10b981", "#3b82f6"],
    disableForReducedMotion: true,
  });
}

const GOALS = [5, 10, 25, 50, 100];

export default function FriendsPage() {
  const [friends, setFriends] = useState(10);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [goalIdx, setGoalIdx] = useState(1);
  const { haptic } = useTelegram();
  const earned = friends * PER_FRIEND;
  const goal = GOALS[goalIdx];
  const goalProgress = Math.min((friends / goal) * 100, 100);

  const shareText = `⚡️ Do'stim, bugun Uzum Bank ilovasini yuklab, bepul virtual karta oching!\n\n💰 Men sizga 45 000 so'm sovg'a qilaman!\n🛒 Uzum Marketda maxsus narxlar\n\n📱 Ilova orqali: ${APP_LINK}\n🤖 Bot orqali: ${BOT_LINK}`;
  const tgShare = `https://t.me/share/url?url=${encodeURIComponent(APP_LINK)}&text=${encodeURIComponent("⚡️ Uzum Bank orqali 45 000 so'm ishlang! Bepul virtual karta oching 💳")}`;

  const handleShare = () => {
    haptic.impact("heavy");
    fireConfetti();
    setShared(true);
    setTimeout(() => setShared(false), 3000);
    if (navigator.share) {
      navigator.share({ title: "Uzum Bank Taklif", text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleTgShare = () => {
    haptic.impact("medium");
    fireConfetti();
  };

  return (
    <div className="flex flex-col pb-4">
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

      {/* Slider Calculator */}
      <div className="mx-4 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-5 border border-green-100">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-500 font-semibold">🎛️ Do'stlar sonini tanlang</p>
            <span className="text-sm font-black text-emerald-600">{friends} do'st</span>
          </div>

          <input
            type="range"
            min={1}
            max={100}
            value={friends}
            onChange={(e) => {
              haptic.selection();
              setFriends(Number(e.target.value));
            }}
            className="w-full h-2 rounded-full appearance-none cursor-pointer mt-2 mb-4"
            style={{
              background: `linear-gradient(to right, #10b981 ${friends}%, #e5e7eb ${friends}%)`,
            }}
          />

          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 text-center border border-emerald-100">
            <p className="text-xs text-gray-500 font-medium mb-1">Sizning daromadingiz</p>
            <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
              {formatMoney(earned)}
            </div>
            {earned >= 1000000 && (
              <p className="text-xs text-emerald-600 font-bold mt-1 animate-bounce">
                🔥 Millioner bo'lasiz!
              </p>
            )}
          </div>

          {/* Quick picks */}
          <div className="flex gap-2 mt-3">
            {[5, 10, 25, 50, 100].map((n) => (
              <button
                key={n}
                onClick={() => { haptic.impact("light"); setFriends(n); }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 ${
                  friends === n
                    ? "bg-emerald-500 text-white shadow"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Goal Tracker */}
      <div className="mx-4 mt-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-700">🎯 Maqsad</p>
            <div className="flex gap-1">
              {GOALS.map((g, i) => (
                <button
                  key={g}
                  onClick={() => { haptic.impact("light"); setGoalIdx(i); }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    goalIdx === i ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <p className="text-[10px] text-gray-400">{friends} / {goal} do'st</p>
            <p className="text-[10px] font-bold text-violet-600">{formatMoney(goal * PER_FRIEND)} maqsad</p>
          </div>
        </div>
      </div>

      {/* Share Message Preview */}
      <div className="mx-4 mt-4">
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
          className={`w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all ${
            shared
              ? "bg-gradient-to-r from-yellow-400 to-orange-400 shadow-yellow-200"
              : "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-200"
          } text-white`}
        >
          {copied ? "✅ Nusxalandi!" : shared ? "🎉 Zo'r! Ulashildi!" : "📤 Xabarni ulashish"}
        </button>

        <a
          href={tgShare}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleTgShare}
          className="w-full bg-gradient-to-r from-sky-400 to-blue-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-transform"
        >
          ✈️ Telegramda ulashish
        </a>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">💡</span>
          <div>
            <p className="text-sm font-bold text-amber-800">Maslahat!</p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              Do'stingiz havola orqali karta ochgandan keyin sizga avtomatik <strong>45 000 so'm</strong> tushadi. Qancha ko'p taklif, shuncha ko'p daromad! 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
