import { useEffect, useState } from "react";

const names = [
  "Jasur", "Malika", "Bobur", "Zulfiya", "Sherzod",
  "Nodira", "Ulugbek", "Feruza", "Akbar", "Dilnoza",
  "Sardor", "Maftuna", "Firdavs", "Barno", "Hamid",
  "Kamola", "Rustam", "Shahlo", "Behruz", "Sabohat",
];

interface Toast {
  id: number;
  name: string;
}

export default function SocialProof() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = { current: 0 };

  useEffect(() => {
    const show = () => {
      const name = names[Math.floor(Math.random() * names.length)];
      const id = Date.now();
      setToasts((prev) => [...prev.slice(-2), { id, name }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    };

    const delays = [1800, 5500, 9500, 14000, 19000];
    const timers = delays.map((d) => setTimeout(show, d));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed bottom-20 left-3 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-gray-100 rounded-2xl px-3 py-2 shadow-lg animate-slide-in"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {t.name[0]}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">{t.name}</p>
            <p className="text-[10px] text-emerald-600 font-semibold">+45 000 so'm oldi! 🤑</p>
          </div>
        </div>
      ))}
    </div>
  );
}
