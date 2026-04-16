import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SiteNav } from "@/components/SiteNav";
import Home from "./pages/Home";
import ITerm2ToGhostty from "./pages/ITerm2ToGhostty";
import P10kToStarship from "./pages/P10kToStarship";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SiteNav />
        <div className="min-h-[calc(100vh-3.5rem)] terminal-grid">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/iterm2-to-ghostty" element={<ITerm2ToGhostty />} />
            <Route path="/p10k-to-starship" element={<P10kToStarship />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
