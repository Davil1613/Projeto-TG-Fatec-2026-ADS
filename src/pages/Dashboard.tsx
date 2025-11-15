import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import MetricCard from "@/components/MetricCard";
import { Package, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import StockIndicator from "@/components/StockIndicator";

interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  lowStockCount: number;
  totalValue: number;
}

interface LowStockProduct {
  id: string;
  name: string;
  current_stock: number;
  min_stock: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalStock: 0,
    lowStockCount: 0,
    totalValue: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: products, error } = await supabase
        .from("products")
        .select("*");

      if (error) throw error;

      if (products) {
        const totalProducts = products.length;
        const totalStock = products.reduce((sum, p) => sum + p.current_stock, 0);
        const lowStockCount = products.filter(p => p.current_stock <= p.min_stock).length;
        const totalValue = products.reduce((sum, p) => sum + (p.current_stock * p.sale_price), 0);

        setStats({
          totalProducts,
          totalStock,
          lowStockCount,
          totalValue,
        });

        const lowStock = products
          .filter(p => p.current_stock <= p.min_stock)
          .slice(0, 5);
        setLowStockProducts(lowStock);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Visão geral do seu estoque
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total de Produtos"
            value={stats.totalProducts}
            icon={Package}
          />
          <MetricCard
            title="Itens em Estoque"
            value={stats.totalStock}
            icon={TrendingUp}
          />
          <MetricCard
            title="Estoque Baixo"
            value={stats.lowStockCount}
            icon={AlertTriangle}
            className="border-warning/50"
          />
          <MetricCard
            title="Valor Total"
            value={`R$ ${stats.totalValue.toFixed(2)}`}
            icon={DollarSign}
          />
        </div>

        {/* Low Stock Alerts */}
        {lowStockProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Alertas de Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Estoque: {product.current_stock} unidades
                      </p>
                    </div>
                    <StockIndicator
                      currentStock={product.current_stock}
                      minStock={product.min_stock}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
