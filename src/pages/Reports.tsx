import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Movement {
  id: string;
  movement_type: string;
  quantity: number;
  notes: string | null;
  created_at: string;
  products: {
    name: string;
    sku: string;
    sale_price: number;
  };
}

export default function Reports() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [periodFilter, setPeriodFilter] = useState("7");
  const [typeFilter, setTypeFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadMovements();
  }, [periodFilter]);

  const loadMovements = async () => {
    try {
      const daysAgo = subDays(new Date(), parseInt(periodFilter));

      const { data, error } = await supabase
        .from("stock_movements")
        .select("*, products(name, sku, sale_price)")
        .gte("created_at", daysAgo.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMovements(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar relatórios",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  let filteredMovements = movements;
  if (typeFilter !== "all") {
    filteredMovements = movements.filter((m) => m.movement_type === typeFilter);
  }

  const totalEntries = movements.filter((m) => m.movement_type === "entrada");
  const totalExits = movements.filter((m) => m.movement_type === "saida");

  const entriesQuantity = totalEntries.reduce((sum, m) => sum + m.quantity, 0);
  const exitsQuantity = totalExits.reduce((sum, m) => sum + m.quantity, 0);

  const entriesValue = totalEntries.reduce(
    (sum, m) => sum + m.quantity * m.products.sale_price,
    0
  );
  const exitsValue = totalExits.reduce(
    (sum, m) => sum + m.quantity * m.products.sale_price,
    0
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground mt-2">
            Análise detalhada das movimentações de estoque
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Entradas
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{entriesQuantity} unidades</div>
              <p className="text-xs text-muted-foreground">
                Valor: R$ {entriesValue.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Saídas
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{exitsQuantity} unidades</div>
              <p className="text-xs text-muted-foreground">
                Valor: R$ {exitsValue.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="15">Últimos 15 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="entrada">Apenas Entradas</SelectItem>
              <SelectItem value="saida">Apenas Saídas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Movements Table */}
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Valor Unit.</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="text-sm">
                    {format(new Date(movement.created_at), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {movement.products.name}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {movement.products.sku}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        movement.movement_type === "entrada"
                          ? "success"
                          : "destructive"
                      }
                      className={
                        movement.movement_type === "entrada"
                          ? "bg-success text-success-foreground hover:bg-success/80"
                          : ""
                      }
                    >
                      {movement.movement_type === "entrada" ? "Entrada" : "Saída"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {movement.movement_type === "entrada" ? "+" : "-"}
                    {movement.quantity}
                  </TableCell>
                  <TableCell className="text-right">
                    R$ {movement.products.sale_price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    R${" "}
                    {(movement.quantity * movement.products.sale_price).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {movement.notes || "-"}
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
