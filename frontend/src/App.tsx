import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "./apps/public/pages/Home.jsx";
import NotFound from "./apps/public/pages/NotFound.tsx";
import Admin from "./apps/admin/pages/Admin";
import Dashboard from "./apps/admin/pages/Dashboard.tsx";
import PostManager from "./apps/admin/pages/PostManager";
import ConfigManager from "./apps/admin/pages/ConfigManager";
import SectionPage from "./apps/public/pages/SectionPage.jsx";
import Login from "./apps/public/pages/Login";
import RequireAuth from "./components/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route element={<RequireAuth role="editor" />}>
            <Route path="/admin" element={<Admin />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="posts" element={<PostManager />} />
              <Route
                path="config"
                element={(
                  <RequireAuth role="admin">
                    <ConfigManager />
                  </RequireAuth>
                )}
              />
            </Route>
          </Route>
          <Route path="/:section" element={<SectionPage />} />
          <Route path="/:section/:subsection" element={<SectionPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
