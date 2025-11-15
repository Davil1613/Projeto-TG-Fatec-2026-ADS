import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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

interface Movement {
  id: string;
  movement_type: string;
  quantity: number;
  notes: string | null;
  created_at: string;
  products: {
    name: string;
    sku: string;
  };
}

export default function Movements() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMovements();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("stock_movements_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "stock_movements",
        },
        () => {
          loadMovements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMovements = async () => {
    try {
      const { data, error } = await supabase
        .from("stock_movements")
        .select("*, products(name, sku)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setMovements(data || []);
    } catch (error: any) {
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
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((movement) => (
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
