import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import MovementForm from "@/components/MovementForm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getMovements } from "@/integrations/movementsApi";

interface Movement {
  id: number;
  movementType: "entrada" | "saida";
  quantity: number;
  notes: string | null;
  createdAt: string;
  product: {
    name: string;
    sku: string;
  } | null;
}

export default function Movements() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMovements();
  }, []);

  const loadMovements = async () => {
    try {
      const data = await getMovements();
      setMovements((data || []) as Movement[]);
    } catch (error: any) {
      if (error.status === 404) {
        setMovements([]);
        return;
      }
      toast({
        title: "Erro ao carregar movimentações",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    loadMovements();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Movimentações</h1>
            <p className="text-muted-foreground mt-2">
              Registre entradas e saídas de estoque
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Nova Movimentação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nova Movimentação</DialogTitle>
              </DialogHeader>
              <MovementForm onSuccess={handleSuccess} />
            </DialogContent>
          </Dialog>
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
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="text-sm">
                    {format(new Date(movement.createdAt), "dd/MM/yyyy HH:mm", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {movement.product?.name || "-"}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {movement.product?.sku || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={movement.movementType === "entrada" ? "success" : "destructive"}
                      className={
                        movement.movementType === "entrada"
                          ? "bg-success text-success-foreground hover:bg-success/80"
                          : ""
                      }
                    >
                      {movement.movementType === "entrada" ? "Entrada" : "Saída"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {movement.movementType === "entrada" ? "+" : "-"}
                    {movement.quantity}
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
