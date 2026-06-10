import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { getProducts } from "@/integrations/productsApi";
import { createMovement } from "@/integrations/movementsApi";

interface Product {
  id: number;
  name: string;
  sku: string;
  currentStock: number;
}

interface MovementFormProps {
  onSuccess: () => void;
}

export default function MovementForm({ onSuccess }: MovementFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    product_id: "",
    movement_type: "entrada",
    quantity: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar produtos",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const selectedProduct = products.find((p) => p.id.toString() === formData.product_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const quantity = Number(formData.quantity);

      if (!formData.product_id || quantity <= 0) {
        toast({
          title: "Dados inválidos",
          description: "Selecione um produto e informe uma quantidade válida.",
          variant: "destructive",
        });
        return;
      }

      if (formData.movement_type === "saida" && selectedProduct && quantity > selectedProduct.currentStock) {
        toast({
          title: "Estoque insuficiente",
          description: `Disponível: ${selectedProduct.currentStock} unidades`,
          variant: "destructive",
        });
        return;
      }

      await createMovement({
        productId: Number(formData.product_id),
        movementType: formData.movement_type as "entrada" | "saida",
        quantity,
        notes: formData.notes || null,
      });

      toast({
        title: "Movimentação registrada com sucesso!",
        description: `${formData.movement_type === "entrada" ? "Entrada" : "Saída"} de ${quantity} unidades`,
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro ao registrar movimentação",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Tipo de Movimentação *</Label>
        <RadioGroup
          value={formData.movement_type}
          onValueChange={(value) => setFormData({ ...formData, movement_type: value })}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="entrada" id="entrada" />
            <Label htmlFor="entrada" className="cursor-pointer">
              Entrada
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="saida" id="saida" />
            <Label htmlFor="saida" className="cursor-pointer">
              Saída
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="product">Produto *</Label>
        <Select
          value={formData.product_id}
          onValueChange={(value) => setFormData({ ...formData, product_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um produto" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id.toString()}>
                {product.name} ({product.sku}) - Estoque: {product.currentStock}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantidade *</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          required
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
        />
        {selectedProduct && formData.movement_type === "saida" && (
          <p className="text-sm text-muted-foreground">
            Estoque disponível: {selectedProduct.currentStock} unidades
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          rows={3}
          placeholder="Motivo, fornecedor, cliente, etc."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Registrando..." : "Registrar Movimentação"}
      </Button>
    </form>
  );
}
