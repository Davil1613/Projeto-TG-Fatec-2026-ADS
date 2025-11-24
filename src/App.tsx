import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import SubscriptionProtectedRoute from "./components/SubscriptionProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Movements from "./pages/Movements";
import Stock from "./pages/Stock";
import Reports from "./pages/Reports";
import Auth from "./pages/Auth";
import SubscriptionRequired from "./pages/SubscriptionRequired";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/assinatura-necessaria" element={<SubscriptionRequired />} />
            <Route
              path="/"
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
              path="/relatorios"
              element={
                <ProtectedRoute>
                  <SubscriptionProtectedRoute>
                    <Reports />
                  </SubscriptionProtectedRoute>
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
