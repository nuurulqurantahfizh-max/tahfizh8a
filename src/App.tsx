import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import StudentDetail from "./pages/StudentDetail";
import StudentMonitoring from "./pages/StudentMonitoring";
import StudentMurajaah from "./pages/StudentMurajaah";
import RekapMonitoring from "./pages/RekapMonitoring";
import RekapMurajaah from "./pages/RekapMurajaah";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/student/:id" element={<StudentDetail />} />
          <Route path="/student/:id/monitoring" element={<StudentMonitoring />} />
          <Route path="/student/:id/murajaah" element={<StudentMurajaah />} />
          <Route path="/rekap/monitoring" element={<RekapMonitoring />} />
          <Route path="/rekap/murajaah" element={<RekapMurajaah />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
