import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import HomePage from "@/pages/HomePage";
import FriendsPage from "@/pages/FriendsPage";
import InfoPage from "@/pages/InfoPage";
import HowPage from "@/pages/HowPage";
import BottomNav from "@/components/BottomNav";
import SplashScreen from "@/components/SplashScreen";

const queryClient = new QueryClient();

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative">
      <div className="flex-1 overflow-y-auto pb-24">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/friends" component={FriendsPage} />
          <Route path="/how" component={HowPage} />
          <Route path="/info" component={InfoPage} />
        </Switch>
      </div>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AppContent />
        <Toaster />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
