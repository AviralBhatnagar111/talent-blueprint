import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import TemplateBuilder from "./pages/TemplateBuilder";
import MCQBuilder from "./pages/MCQBuilder";
import CodingBuilder from "./pages/CodingBuilder";
import AIRoundConfig from "./pages/AIRoundConfig";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:jobId" element={<JobDetails />} />
          <Route path="/jobs/:jobId/template" element={<TemplateBuilder />} />
          <Route path="/jobs/:jobId/template/rounds/:roundId/mcq-builder" element={<MCQBuilder />} />
          <Route path="/jobs/:jobId/template/rounds/:roundId/coding-builder" element={<CodingBuilder />} />
          <Route path="/jobs/:jobId/round/:roundId/ai-config" element={<AIRoundConfig />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
