import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 5;
      });
    }, 90);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 flex flex-col items-center justify-center z-50">
      <div className="relative animate-float">
        <div className="w-28 h-28 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl border border-white/30">
          <span className="text-6xl">⚡</span>
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-lg animate-bounce">
          💰
        </div>
      </div>

      <div className="mt-8 text-center">
        <h1 className="text-3xl font-black text-white tracking-tight">
          Uzum<span className="text-yellow-300">Ref</span>
        </h1>
        <p className="text-white/70 text-sm mt-1 font-medium">
          Tez va Oson Daromad ⚡️
        </p>
      </div>

      <div className="mt-10 w-48">
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-white/50 text-xs text-center mt-2">Yuklanmoqda...</p>
      </div>
    </div>
  );
}
