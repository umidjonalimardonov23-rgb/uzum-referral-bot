import { useLocation } from "wouter";

const tabs = [
  { path: "/", icon: "🏠", label: "Bosh sahifa" },
  { path: "/friends", icon: "👥", label: "Do'stlar" },
  { path: "/how", icon: "📖", label: "Qanday?" },
  { path: "/info", icon: "ℹ️", label: "Ma'lumot" },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  const getPath = (p: string) => (p === "/" ? base + "/" : base + p);

  const isActive = (p: string) => {
    const current = location === "" ? "/" : location;
    return current === p;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40">
      <div className="mx-3 mb-3 bg-white/90 backdrop-blur-xl border border-purple-100 rounded-2xl shadow-xl">
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map((tab) => {
            const active = isActive(tab.path);
            return (
              <button
                key={tab.path}
                onClick={() => navigate(getPath(tab.path))}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-0 ${
                  active
                    ? "bg-gradient-to-b from-violet-600 to-purple-700 shadow-lg shadow-purple-500/30 scale-105"
                    : "hover:bg-purple-50 active:scale-95"
                }`}
              >
                <span className="text-xl leading-none">{tab.icon}</span>
                <span
                  className={`text-[10px] font-semibold leading-none mt-0.5 truncate ${
                    active ? "text-white" : "text-gray-500"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
