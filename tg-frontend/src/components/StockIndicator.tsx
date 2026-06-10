import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StockIndicatorProps {
  currentStock: number;
  minStock: number;
}

export default function StockIndicator({ currentStock, minStock }: StockIndicatorProps) {
  const getStatus = () => {
    if (currentStock === 0) {
      return { label: "Esgotado", variant: "destructive" as const };
    }
    if (currentStock <= minStock * 0.5) {
      return { label: "Crítico", variant: "destructive" as const };
    }
    if (currentStock <= minStock) {
      return { label: "Baixo", variant: "warning" as const };
    }
    return { label: "Normal", variant: "success" as const };
  };

  const status = getStatus();

  return (
    <Badge 
      variant={status.variant}
      className={cn(
        "font-medium",
        status.variant === "warning" && "bg-warning text-warning-foreground hover:bg-warning/80",
        status.variant === "success" && "bg-success text-success-foreground hover:bg-success/80"
      )}
    >
      {status.label}
    </Badge>
  );
}
