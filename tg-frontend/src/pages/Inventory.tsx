import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, Search } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getProducts } from "@/integrations/productsApi";
import { createMovement } from "@/integrations/movementsApi";

interface Product {
  id: number;
  name: string;
  sku: string;
  currentStock: number;
  minStock: number;
  category?: { name: string } | null;
}

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [countedStock, setCountedStock] = useState<Record<number, string>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts((data || []) as Product[]);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar produtos",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [products, searchTerm]);

  const adjustments = useMemo(() => {
    return products
      .map((product) => {
        const counted = countedStock[product.id];
        if (counted === undefined || counted === "") return null;

        const countedNumber = Number(counted);
        if (!Number.isFinite(countedNumber) || countedNumber < 0) return null;

        const difference = countedNumber - Number(product.currentStock);
        if (difference === 0) return null;

        return {
          product,
          countedNumber,
          difference,
          movementType: difference > 0 ? ("entrada" as const) : ("saida" as const),
          quantity: Math.abs(difference),
        };
      })
      .filter(Boolean) as Array<{
        product: Product;
        countedNumber: number;
        difference: number;
        movementType: "entrada" | "saida";
        quantity: number;
      }>;
  }, [products, countedStock]);

  const handleApplyAdjustments = async () => {
    if (adjustments.length === 0) return;

    setSaving(true);
    try {
      for (const adjustment of adjustments) {
        await createMovement({
          productId: adjustment.product.id,
          movementType: adjustment.movementType,
          quantity: adjustment.quantity,
          notes: `Ajuste de inventário: sistema ${adjustment.product.currentStock}, contagem ${adjustment.countedNumber}`,
        });
      }

      toast({
        title: "Inventário aplicado",
        description: `${adjustments.length} ajuste(s) registrado(s) nas movimentações.`,
      });
      setCountedStock({});
      await loadProducts();
    } catch (error: any) {
      toast({
        title: "Erro ao aplicar inventário",
        description: error.message || "Não foi possível registrar os ajustes.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Inventário</h1>
            <p className="text-muted-foreground mt-2">
              Compare a contagem fisica com o estoque do sistema
            </p>
          </div>

          <Button
            type="button"
            onClick={handleApplyAdjustments}
            disabled={saving || adjustments.length === 0}
            size="lg"
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Aplicar {adjustments.length} ajuste(s)
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Produtos conferidos</p>
            <p className="text-2xl font-bold">{Object.values(countedStock).filter(Boolean).length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Divergências</p>
            <p className="text-2xl font-bold">{adjustments.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Saldo dos ajustes</p>
            <p className="text-2xl font-bold">
              {adjustments.reduce((sum, item) => sum + item.difference, 0)}
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar produto por nome ou SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Sistema</TableHead>
                <TableHead className="text-right">Contagem Fisica</TableHead>
                <TableHead className="text-right">Diferenca</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const counted = countedStock[product.id];
                const countedNumber = counted === undefined || counted === "" ? null : Number(counted);
                const difference =
                  countedNumber === null || !Number.isFinite(countedNumber)
                    ? null
                    : countedNumber - Number(product.currentStock);

                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>{product.category?.name || "-"}</TableCell>
                    <TableCell className="text-right">{product.currentStock}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={countedStock[product.id] ?? ""}
                        onChange={(e) =>
                          setCountedStock((prev) => ({
                            ...prev,
                            [product.id]: e.target.value,
                          }))
                        }
                        className="ml-auto w-28 text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {difference === null ? "-" : difference > 0 ? `+${difference}` : difference}
                    </TableCell>
                    <TableCell>
                      {difference === null ? (
                        <Badge variant="secondary">Pendente</Badge>
                      ) : difference === 0 ? (
                        <Badge className="bg-success text-success-foreground">Conferido</Badge>
                      ) : (
                        <Badge variant="destructive">
                          <ClipboardCheck className="mr-1 h-3 w-3" />
                          Ajustar
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
