import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProviders } from "@/lib/providers";
import { NetworkBanner } from "@/components/NetworkBanner";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import CreateGame from "@/pages/CreateGame";
import GameDetail from "@/pages/GameDetail";
import Leaderboard from "@/pages/Leaderboard";
import Treasury from "@/pages/Treasury";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={CreateGame} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/treasury" component={Treasury} />
      <Route path="/game/:id" component={GameDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AppProviders>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <NetworkBanner />
          <Router />
        </WouterRouter>
        <Toaster theme="dark" toastOptions={{ className: 'arcade-box font-mono !border-primary' }} />
      </TooltipProvider>
    </AppProviders>
  );
}

export default App;
