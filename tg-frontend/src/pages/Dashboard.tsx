import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import Layout from "@/components/Layout";
import MetricCard from "@/components/MetricCard";
import {
  AlertTriangle,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import StockIndicator from "@/components/StockIndicator";
import { getProducts } from "@/integrations/productsApi";

interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  lowStockCount: number;
  criticalStockCount: number;
  emptyStockCount: number;
  totalSaleValue: number;
  totalCostValue: number;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  currentStock: number;
  minStock: number;
  salePrice: number;
  costPrice?: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalStock: 0,
    lowStockCount: 0,
    criticalStockCount: 0,
    emptyStockCount: 0,
    totalSaleValue: 0,
    totalCostValue: 0,
  });
  const [restockProducts, setRestockProducts] = useState<Product[]>([]);
  const { toast } = useToast();
  const { isAdmin } = useUserRole();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const products = (await getProducts()) as Product[];

      if (products) {
        const totalProducts = products.length;
        const totalStock = products.reduce((sum, p) => sum + Number(p.currentStock), 0);
        const lowStockProducts = products.filter(
          (p) => Number(p.currentStock) <= Number(p.minStock),
        );
        const criticalStockCount = products.filter(
          (p) => Number(p.currentStock) > 0 && Number(p.currentStock) <= Number(p.minStock) * 0.5,
        ).length;
        const emptyStockCount = products.filter((p) => Number(p.currentStock) === 0).length;
        const totalSaleValue = products.reduce(
          (sum, p) => sum + Number(p.currentStock) * Number(p.salePrice),
          0,
        );
        const totalCostValue = products.reduce(
          (sum, p) => sum + Number(p.currentStock) * Number(p.costPrice || 0),
          0,
        );

        setStats({
          totalProducts,
          totalStock,
          lowStockCount: lowStockProducts.length,
          criticalStockCount,
          emptyStockCount,
          totalSaleValue,
          totalCostValue,
        });

        setRestockProducts(
          lowStockProducts
            .sort((a, b) => {
              const aNeed = Number(a.minStock) - Number(a.currentStock);
              const bNeed = Number(b.minStock) - Number(b.currentStock);
              return bNeed - aNeed;
            })
            .slice(0, 6),
        );
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const estimatedProfit = stats.totalSaleValue - stats.totalCostValue;

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Visão geral do seu estoque</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Total de Produtos" value={stats.totalProducts} icon={Package} />
          <MetricCard title="Itens em Estoque" value={stats.totalStock} icon={TrendingUp} />
          <MetricCard
            title="Estoque Baixo"
            value={stats.lowStockCount}
            icon={AlertTriangle}
            className="border-warning/50"
          />
          <MetricCard
            title="Valor de Venda"
            value={formatCurrency(stats.totalSaleValue)}
            icon={DollarSign}
          />
        </div>

        <div className={isAdmin ? "grid gap-6 md:grid-cols-3" : "grid gap-6 md:grid-cols-1"}>
          {isAdmin && (
          <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custo em Estoque</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalCostValue)}</div>
              <p className="text-xs text-muted-foreground">Baseado no preço de custo cadastrado</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Margem Potencial</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(estimatedProfit)}</div>
              <p className="text-xs text-muted-foreground">Venda estimada menos custo do estoque</p>
            </CardContent>
          </Card>
          </>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risco de Ruptura</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{stats.criticalStockCount}</span>
                <Badge variant="destructive">críticos</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.emptyStockCount} produto(s) já estão esgotados
              </p>
            </CardContent>
          </Card>
        </div>

        {restockProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-warning" />
                Sugestão de Reposição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {restockProducts.map((product) => {
                  const suggestedQuantity = Math.max(
                    Number(product.minStock) - Number(product.currentStock),
                    0,
                  );

                  return (
                    <div
                      key={product.id}
                      className="flex flex-col gap-3 rounded-lg border border-border p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          SKU {product.sku} | Estoque: {product.currentStock} de {product.minStock}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">Comprar {suggestedQuantity} un.</Badge>
                        <StockIndicator
                          currentStock={product.currentStock}
                          minStock={product.minStock}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
