declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        HapticFeedback?: {
          impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
          notificationOccurred: (type: "error" | "success" | "warning") => void;
          selectionChanged: () => void;
        };
        ready?: () => void;
        expand?: () => void;
      };
    };
  }
}

export function useTelegram() {
  const tg = window.Telegram?.WebApp;

  const haptic = {
    impact: (style: "light" | "medium" | "heavy" | "rigid" | "soft" = "medium") => {
      tg?.HapticFeedback?.impactOccurred(style);
    },
    success: () => {
      tg?.HapticFeedback?.notificationOccurred("success");
    },
    error: () => {
      tg?.HapticFeedback?.notificationOccurred("error");
    },
    selection: () => {
      tg?.HapticFeedback?.selectionChanged();
    },
  };

  return { tg, haptic };
}
