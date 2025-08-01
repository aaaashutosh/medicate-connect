import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import AIChatWidget from "@/components/ai-chat-widget";
import Home from "@/pages/home";
import About from "@/pages/about";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import Doctors from "@/pages/doctors";
import Messages from "@/pages/messages";
import Support from "@/pages/support";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/profile" component={Profile} />
        <Route path="/doctors" component={Doctors} />
        <Route path="/messages" component={Messages} />
        <Route path="/support" component={Support} />
        <Route path="/login" component={Login} />
        <Route component={NotFound} />
      </Switch>
      <AIChatWidget />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
