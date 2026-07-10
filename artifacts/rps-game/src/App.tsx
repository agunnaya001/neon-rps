import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProviders } from "@/lib/providers";
import { NetworkBanner } from "@/components/NetworkBanner";
import { InstallPrompt } from "@/components/InstallPrompt";
import { BottomNav } from "@/components/BottomNav";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NotificationCenter } from "@/components/NotificationCenter";

const Home = lazy(() => import("@/pages/Home"));
const CreateGame = lazy(() => import("@/pages/CreateGame"));
const GameDetail = lazy(() => import("@/pages/GameDetail"));
const CreateSeries = lazy(() => import("@/pages/CreateSeries"));
const SeriesDetail = lazy(() => import("@/pages/SeriesDetail"));
const Leaderboard = lazy(() => import("@/pages/Leaderboard"));
const Treasury = lazy(() => import("@/pages/Treasury"));
const NotFound = lazy(() => import("@/pages/not-found"));

function PageSkeleton() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
        <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground animate-pulse">
          Loading…
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/create" component={CreateGame} />
        <Route path="/series/new" component={CreateSeries} />
        <Route path="/series/:id" component={SeriesDetail} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/treasury" component={Treasury} />
        <Route path="/game/:id" component={GameDetail} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <NetworkBanner />
            <ErrorBoundary>
              <Router />
            </ErrorBoundary>
            <BottomNav />
          </WouterRouter>
          <NotificationCenter />
          <Toaster
            theme="dark"
            toastOptions={{ className: "arcade-box font-mono !border-primary" }}
          />
          <InstallPrompt />
        </TooltipProvider>
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;
