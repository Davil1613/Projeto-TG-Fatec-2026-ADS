import { useEffect, useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp, TrendingDown, Download } from "lucide-react";
import { getMovements } from "@/integrations/movementsApi";
import { exportTableToExcel } from "@/lib/excel";

interface Movement {
  id: number;
  movementType: "entrada" | "saida";
  quantity: number;
  notes: string | null;
  createdAt: string;
  product: {
    name: string;
    sku: string;
    salePrice: number;
  } | null;
}

export default function Reports() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [periodFilter, setPeriodFilter] = useState("7");
  const [typeFilter, setTypeFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadMovements();
  }, []);

  const loadMovements = async () => {
    try {
      const movementsData = await getMovements();
      setMovements((movementsData || []) as Movement[]);
    } catch (error: any) {
      if (error.status === 404) {
        setMovements([]);
      } else {
        toast({
          title: "Erro ao carregar relatorios",
          description: error.message,
          variant: "destructive",
        });
      }
    }

  };

  const periodMovements = useMemo(() => {
    const daysAgo = subDays(new Date(), Number(periodFilter));
    return movements.filter((m) => new Date(m.createdAt) >= daysAgo);
  }, [movements, periodFilter]);

  const filteredMovements = useMemo(() => {
    if (typeFilter === "all") return periodMovements;
    return periodMovements.filter((m) => m.movementType === typeFilter);
  }, [periodMovements, typeFilter]);

  const totalEntries = periodMovements.filter((m) => m.movementType === "entrada");
  const totalExits = periodMovements.filter((m) => m.movementType === "saida");

  const entriesQuantity = totalEntries.reduce((sum, m) => sum + Number(m.quantity), 0);
  const exitsQuantity = totalExits.reduce((sum, m) => sum + Number(m.quantity), 0);

  const entriesValue = totalEntries.reduce(
    (sum, m) => sum + Number(m.quantity) * Number(m.product?.salePrice || 0),
    0
  );
  const exitsValue = totalExits.reduce(
    (sum, m) => sum + Number(m.quantity) * Number(m.product?.salePrice || 0),
    0
  );

  const handleExportExcel = () => {
    const periodLabelMap: Record<string, string> = {
      "7": "Ultimos 7 dias",
      "15": "Ultimos 15 dias",
      "30": "Ultimos 30 dias",
      "90": "Ultimos 90 dias",
    };

    const typeLabelMap: Record<string, string> = {
      all: "Todos",
      entrada: "Entradas",
      saida: "Saidas",
    };

    const rows = filteredMovements.map((movement) => {
      const unit = Number(movement.product?.salePrice || 0);
      const total = Number(movement.quantity) * unit;
      return [
        format(new Date(movement.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR }),
        movement.product?.name || "-",
        movement.product?.sku || "-",
        movement.movementType === "entrada" ? "Entrada" : "Saida",
        movement.quantity,
        unit.toFixed(2),
        total.toFixed(2),
        movement.notes || "-",
        periodLabelMap[periodFilter] || periodFilter,
        typeLabelMap[typeFilter] || typeFilter,
      ];
    });

    exportTableToExcel({
      filename: `relatorio_estoque_${new Date().toISOString().slice(0, 10)}.csv`,
      headers: [
        "Data/Hora",
        "Produto",
        "SKU",
        "Tipo",
        "Quantidade",
        "Valor Unitario",
        "Valor Total",
        "Observacoes",
        "Periodo",
        "Filtro de Tipo",
      ],
      rows,
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Relatorios</h1>
          <p className="text-muted-foreground mt-2">
            Analise detalhada das movimentacoes de estoque
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Entradas</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{entriesQuantity} unidades</div>
              <p className="text-xs text-muted-foreground">Valor: R$ {entriesValue.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Saidas</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{exitsQuantity} unidades</div>
              <p className="text-xs text-muted-foreground">Valor: R$ {exitsValue.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-4">
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Ultimos 7 dias</SelectItem>
                <SelectItem value="15">Ultimos 15 dias</SelectItem>
                <SelectItem value="30">Ultimos 30 dias</SelectItem>
                <SelectItem value="90">Ultimos 90 dias</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="entrada">Apenas Entradas</SelectItem>
                <SelectItem value="saida">Apenas Saidas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleExportExcel}
            disabled={filteredMovements.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </div>

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
                <TableHead>Observacoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="text-sm">
                    {format(new Date(movement.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="font-medium">{movement.product?.name || "-"}</TableCell>
                  <TableCell className="font-mono text-sm">{movement.product?.sku || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={movement.movementType === "entrada" ? "success" : "destructive"}
                      className={
                        movement.movementType === "entrada"
                          ? "bg-success text-success-foreground hover:bg-success/80"
                          : ""
                      }
                    >
                      {movement.movementType === "entrada" ? "Entrada" : "Saida"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {movement.movementType === "entrada" ? "+" : "-"}
                    {movement.quantity}
                  </TableCell>
                  <TableCell className="text-right">
                    R$ {Number(movement.product?.salePrice || 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    R$ {(Number(movement.quantity) * Number(movement.product?.salePrice || 0)).toFixed(2)}
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
