
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import TodayRoutine from "./pages/TodayRoutine";
import ManageRoutines from "./pages/ManageRoutines";
import Stats from "./pages/Stats";
import NotFound from "./pages/NotFound";
import useRoutineStore from "./store/routineStore";
import { themes } from "./types/theme";
import "./styles/abstract-pattern.css";

const queryClient = new QueryClient();

const App = () => {
  const { theme } = useRoutineStore();
  const currentTheme = themes.find(t => t.name === theme);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className={`min-h-screen ${currentTheme?.background || 'bg-gray-50'} transition-colors duration-300`}>
          {theme === 'abstract' && (
            <>
              <div className="abstract-shape shape-1"></div>
              <div className="abstract-shape shape-2"></div>
              <div className="abstract-shape shape-3"></div>
              <div className="abstract-shape shape-4"></div>
              <div className="abstract-shape shape-5"></div>
            </>
          )}
          <div className="relative max-w-screen-xl mx-auto px-4 py-8">
            <BrowserRouter> basename="/routine-wonderful">
              <div className="flex flex-col min-h-screen">
                <main className="flex-grow mb-20 sm:mb-0">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/today" element={<TodayRoutine />} />
                    <Route path="/manage" element={<ManageRoutines />} />
                    <Route path="/stats" element={<Stats />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Navigation />
              </div>
            </BrowserRouter>
          </div>
        </div>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
