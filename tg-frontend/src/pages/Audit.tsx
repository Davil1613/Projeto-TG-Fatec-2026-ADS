import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { History } from "lucide-react";
import Layout from "@/components/Layout";
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
import { getAuditLogs } from "@/integrations/auditApi";

interface AuditLog {
  id: number;
  userId: number | null;
  action: "create" | "update" | "delete" | string;
  entity: string;
  entityId: number | null;
  description: string | null;
  createdAt: string;
}

const actionLabel: Record<string, string> = {
  create: "Criacao",
  update: "Edicao",
  delete: "Exclusao",
};

const entityLabel: Record<string, string> = {
  product: "Produto",
  category: "Categoria",
  movement: "Movimentacao",
};

export default function Audit() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await getAuditLogs();
      setLogs((data || []) as AuditLog[]);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar auditoria",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="flex items-center gap-3 text-4xl font-bold text-foreground">
            <History className="h-9 w-9" />
            Auditoria
          </h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe acoes importantes realizadas no sistema
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Acao</TableHead>
                <TableHead>Modulo</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Descricao</TableHead>
                <TableHead>Usuario</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm">
                    {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={log.action === "delete" ? "destructive" : "secondary"}>
                      {actionLabel[log.action] || log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>{entityLabel[log.entity] || log.entity}</TableCell>
                  <TableCell className="font-mono text-sm">{log.entityId || "-"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {log.description || "-"}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{log.userId || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
