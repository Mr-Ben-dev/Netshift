import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "./config/wallet";
import Analytics from "./pages/Analytics";
import Dashboard from "./pages/Dashboard";
import HowItWorks from "./pages/HowItWorks";
import Import from "./pages/Import";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import Preview from "./pages/Preview";
import Proof from "./pages/Proof";
import Settlement from "./pages/Settlement";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Disable auto-refetch on window focus
      refetchOnReconnect: false, // Disable auto-refetch on reconnect
      retry: 1, // Only retry once on failure
    },
  },
});

const App = () => (
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/import" element={<Import />} />
            <Route path="/preview" element={<Preview />} />
            <Route path="/settlement/:batchId" element={<Settlement />} />
            <Route path="/proof/:batchId" element={<Proof />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
