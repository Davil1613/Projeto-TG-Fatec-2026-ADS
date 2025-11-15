import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  product?: any;
  onSuccess: () => void;
}

export default function ProductForm({ product, onSuccess }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category_id: "",
    description: "",
    sale_price: "",
    cost_price: "",
    current_stock: "",
    min_stock: "10",
    image_url: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
    if (product) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        category_id: product.category_id || "",
        description: product.description || "",
        sale_price: product.sale_price?.toString() || "",
        cost_price: product.cost_price?.toString() || "",
        current_stock: product.current_stock?.toString() || "",
        min_stock: product.min_stock?.toString() || "10",
        image_url: product.image_url || "",
      });
    }
  }, [product]);

  const loadCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("name");
    if (data) setCategories(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        sku: formData.sku,
        category_id: formData.category_id || null,
        description: formData.description || null,
        sale_price: parseFloat(formData.sale_price),
        cost_price: parseFloat(formData.cost_price),
        current_stock: parseInt(formData.current_stock),
        min_stock: parseInt(formData.min_stock),
        image_url: formData.image_url || null,
      };

      if (product) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id);
        if (error) throw error;
        toast({ title: "Produto atualizado com sucesso!" });
      } else {
        const { error } = await supabase.from("products").insert(productData);
        if (error) throw error;
        toast({ title: "Produto cadastrado com sucesso!" });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar produto",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Produto *</Label>
          <Input
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sku">SKU *</Label>
          <Input
            id="sku"
            required
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
        <Select
          value={formData.category_id}
          onValueChange={(value) => setFormData({ ...formData, category_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cost_price">Preço de Custo *</Label>
          <Input
            id="cost_price"
            type="number"
            step="0.01"
            required
            value={formData.cost_price}
            onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sale_price">Preço de Venda *</Label>
          <Input
            id="sale_price"
            type="number"
            step="0.01"
            required
            value={formData.sale_price}
            onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="current_stock">Quantidade Inicial *</Label>
          <Input
            id="current_stock"
            type="number"
            required
            value={formData.current_stock}
            onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="min_stock">Estoque Mínimo *</Label>
          <Input
            id="min_stock"
            type="number"
            required
            value={formData.min_stock}
            onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image_url">URL da Imagem</Label>
        <Input
          id="image_url"
          type="url"
          placeholder="https://..."
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Salvando..." : product ? "Atualizar Produto" : "Cadastrar Produto"}
      </Button>
    </form>
  );
}
