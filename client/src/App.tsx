import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import NotFound from "@/pages/not-found";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Namhattas from "@/pages/Namhattas";
import NamhattaDetail from "@/pages/NamhattaDetail";
import Devotees from "@/pages/Devotees";
import DevoteeDetail from "@/pages/DevoteeDetail";

import Statuses from "@/pages/Statuses";
import Shraddhakutirs from "@/pages/Shraddhakutirs";
import NamhattaApprovals from "@/pages/NamhattaApprovals";
import Updates from "@/pages/Updates";
import Health from "@/pages/Health";
import About from "@/pages/About";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/namhattas" component={Namhattas} />
        <Route path="/namhattas/:id" component={NamhattaDetail} />
        <Route path="/devotees" component={Devotees} />
        <Route path="/devotees/:id" component={DevoteeDetail} />

        <Route path="/statuses" component={Statuses} />
        <Route path="/shraddhakutirs" component={Shraddhakutirs} />
        <Route path="/updates" component={Updates} />
        <Route path="/health" component={Health} />
        <Route path="/about" component={About} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="namhatta-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
