import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import SubscriptionProtectedRoute from "./components/SubscriptionProtectedRoute";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Movements from "./pages/Movements";
import Stock from "./pages/Stock";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Audit from "./pages/Audit";
import Team from "./pages/Team";
import Subscription from "./pages/Subscription";
import AdminRoute from "./components/AdminRoute";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <SubscriptionProtectedRoute>
                    <Dashboard />
                  </SubscriptionProtectedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/produtos"
              element={
                <ProtectedRoute>
                  <SubscriptionProtectedRoute>
                    <Products />
                  </SubscriptionProtectedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/categorias"
              element={
                <ProtectedRoute>
                  <SubscriptionProtectedRoute>
                    <Categories />
                  </SubscriptionProtectedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/movimentacoes"
              element={
                <ProtectedRoute>
                  <SubscriptionProtectedRoute>
                    <Movements />
                  </SubscriptionProtectedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/estoque"
              element={
                <ProtectedRoute>
                  <SubscriptionProtectedRoute>
                    <Stock />
                  </SubscriptionProtectedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventario"
              element={
                <ProtectedRoute>
                  <SubscriptionProtectedRoute>
                    <Inventory />
                  </SubscriptionProtectedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/relatorios"
              element={
                <ProtectedRoute>
                  <SubscriptionProtectedRoute>
                    <Reports />
                  </SubscriptionProtectedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/auditoria"
              element={
                <ProtectedRoute>
                  <SubscriptionProtectedRoute>
                    <AdminRoute>
                      <Audit />
                    </AdminRoute>
                  </SubscriptionProtectedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/equipe"
              element={
                <ProtectedRoute>
                  <SubscriptionProtectedRoute>
                    <AdminRoute>
                      <Team />
                    </AdminRoute>
                  </SubscriptionProtectedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/assinatura"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <Subscription />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
