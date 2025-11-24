import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import StockIndicator from "@/components/StockIndicator";

interface Product {
  id: string;
  name: string;
  sku: string;
  current_stock: number;
  min_stock: number;
  sale_price: number;
  categories?: { name: string } | null;
}

export default function Stock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const { toast } = useToast();
  const { isAdmin } = useUserRole();

  useEffect(() => {
    loadProducts();

    // Subscribe to realtime updates
    // Note: Realtime subscription is on the base products table
    const channel = supabase
      .channel("products_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        () => {
          loadProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  const loadProducts = async () => {
    try {
      // Use products_public view for non-admin users
      const tableName = isAdmin ? "products" : "products_public";
      
      const { data, error } = await supabase
        .from(tableName as any)
        .select("*, categories(name)");

      if (error) throw error;
      setProducts((data || []) as unknown as Product[]);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar estoque",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  let filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (categoryFilter !== "all") {
    filteredProducts = filteredProducts.filter(
      (p) => p.categories?.name === categoryFilter
    );
  }

  filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "stock":
        return b.current_stock - a.current_stock;
      case "price":
        return b.sale_price - a.sale_price;
      default:
        return 0;
    }
  });

  const categories = Array.from(
    new Set(products.map((p) => p.categories?.name).filter(Boolean))
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Estoque Atual</h1>
          <p className="text-muted-foreground mt-2">
            Visualize e monitore seu estoque em tempo real
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat!}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="stock">Quantidade</SelectItem>
              <SelectItem value="price">Preço</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stock Table */}
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Estoque Mínimo</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-mono text-sm">
                    {product.sku}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.categories?.name || "-"}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {product.current_stock}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {product.min_stock}
                  </TableCell>
                  <TableCell className="text-right">
                    R$ {product.sale_price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    R$ {(product.current_stock * product.sale_price).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <StockIndicator
                      currentStock={product.current_stock}
                      minStock={product.min_stock}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
