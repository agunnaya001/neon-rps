import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "@/pages/home";
import PlayPage from "@/pages/play";
import LeaderboardPage from "@/pages/leaderboard";
import TournamentsPage from "@/pages/tournaments";
import ChallengesPage from "@/pages/challenges";
import BattlePassPage from "@/pages/battle-pass";
import NotFound from "@/pages/not-found";

// Optimized QueryClient configuration for better caching and performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data in cache for 5 minutes before considering it stale
      staleTime: 5 * 60 * 1000,
      // Keep data in garbage collection queue for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Disable automatic refetch on window focus (useful for game data)
      refetchOnWindowFocus: false,
      // Refetch on mount only if data is stale
      refetchOnMount: 'stale',
      // Retry failed requests up to 2 times with exponential backoff
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry failed mutations up to 1 time
      retry: 1,
      retryDelay: 1000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/play" component={PlayPage} />
      <Route path="/leaderboard" component={LeaderboardPage} />
      <Route path="/tournaments" component={TournamentsPage} />
      <Route path="/challenges" component={ChallengesPage} />
      <Route path="/battle-pass" component={BattlePassPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
