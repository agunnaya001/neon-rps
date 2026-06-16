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

const queryClient = new QueryClient();

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
