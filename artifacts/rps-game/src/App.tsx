import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProviders } from "@/lib/providers";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import CreateGame from "@/pages/CreateGame";
import GameDetail from "@/pages/GameDetail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/create" component={CreateGame} />
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
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </AppProviders>
  );
}

export default App;
