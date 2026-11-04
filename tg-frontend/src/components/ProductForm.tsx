import { useEffect, useMemo, useRef, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { ImagePlus, Star, Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getCategories } from "@/integrations/categoriesApi";
import {
  createProduct,
  updateProduct,
  uploadProductImage,
} from "@/integrations/productsApi";

interface Category {
  id: number;
  name: string;
}

interface ProductFormProps {
  product?: any;
  onSuccess: () => void;
}

function getInitialImageUrls(product?: any) {
  const galleryUrls = Array.isArray(product?.images)
    ? product.images.map((image: any) => image.imageUrl).filter(Boolean)
    : [];
  return [...galleryUrls, product?.imageUrl]
    .filter((url) => typeof url === "string" && url.trim())
    .filter((url, index, all) => all.indexOf(url) === index);
}

export default function ProductForm({ product, onSuccess }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [manualImageUrl, setManualImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category_id: "",
    description: "",
    sale_price: "0",
    cost_price: "0",
    current_stock: "0",
    min_stock: "10",
    image_urls: [] as string[],
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();

    if (product) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        category_id: product.categoryId?.toString() || "",
        description: product.description || "",
        sale_price: product.salePrice?.toString() || "0",
        cost_price: product.costPrice?.toString() || "0",
        current_stock: product.currentStock?.toString() || "0",
        min_stock: product.minStock?.toString() || "10",
        image_urls: getInitialImageUrls(product),
      });
    } else {
      setFormData({
        name: "",
        sku: "",
        category_id: "",
        description: "",
        sale_price: "0",
        cost_price: "0",
        current_stock: "0",
        min_stock: "10",
        image_urls: [],
      });
    }
    setManualImageUrl("");
  }, [product]);

  const marginPreview = useMemo(() => {
    const sale = Number(formData.sale_price) || 0;
    const cost = Number(formData.cost_price) || 0;
    const margin = sale - cost;
    const marginPercent = sale > 0 ? (margin / sale) * 100 : 0;

    return {
      margin,
      marginPercent,
    };
  }, [formData.sale_price, formData.cost_price]);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addImageUrl = (imageUrl: string) => {
    const cleanUrl = imageUrl.trim();
    if (!cleanUrl) return;

    setFormData((prev) => ({
      ...prev,
      image_urls: prev.image_urls.includes(cleanUrl)
        ? prev.image_urls
        : [...prev.image_urls, cleanUrl],
    }));
  };

  const removeImageUrl = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      image_urls: prev.image_urls.filter((url) => url !== imageUrl),
    }));
  };

  const setCoverImage = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      image_urls: [imageUrl, ...prev.image_urls.filter((url) => url !== imageUrl)],
    }));
  };

  const handleAddManualImage = () => {
    if (!manualImageUrl.trim()) {
      toast({
        title: "Informe uma URL",
        description: "Cole o link da imagem antes de adicionar.",
        variant: "destructive",
      });
      return;
    }

    addImageUrl(manualImageUrl);
    setManualImageUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.category_id) {
        toast({
          title: "Categoria obrigatória",
          description: "Selecione uma categoria para o produto.",
          variant: "destructive",
        });
        return;
      }

      const salePrice = Number(formData.sale_price);
      const costPrice = Number(formData.cost_price);
      const currentStock = Number(formData.current_stock);
      const minStock = Number(formData.min_stock);

      if (salePrice < 0 || costPrice < 0 || currentStock < 0 || minStock < 0) {
        toast({
          title: "Valores inválidos",
          description: "Preço e estoque não podem ser negativos.",
          variant: "destructive",
        });
        return;
      }

      const productData = {
        name: formData.name,
        sku: formData.sku,
        categoryId: Number(formData.category_id),
        description: formData.description || null,
        salePrice,
        costPrice,
        currentStock,
        minStock,
        imageUrl: formData.image_urls[0] || null,
        imageUrls: formData.image_urls,
      };

      if (product) {
        await updateProduct(product.id, productData);
        toast({ title: "Produto atualizado com sucesso!" });
      } else {
        await createProduct(productData);
        toast({ title: "Produto cadastrado com sucesso!" });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar produto",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (files?: FileList | null) => {
    if (!files?.length) return;

    const maxSizeBytes = 5 * 1024 * 1024;
    const selectedFiles = Array.from(files);
    const invalidFile = selectedFiles.find((file) => !file.type.startsWith("image/"));
    const oversizedFile = selectedFiles.find((file) => file.size > maxSizeBytes);

    if (invalidFile) {
      toast({
        title: "Arquivo inválido",
        description: "Selecione apenas imagens validas.",
        variant: "destructive",
      });
      return;
    }

    if (oversizedFile) {
      toast({
        title: "Imagem muito grande",
        description: "O limite por imagem e 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingImage(true);
    try {
      const uploadedUrls: string[] = [];

      for (const file of selectedFiles) {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ""));
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const response = await uploadProductImage({ fileData: dataUrl });
        if (response.imageUrl) uploadedUrls.push(response.imageUrl);
      }

      setFormData((prev) => ({
        ...prev,
        image_urls: [...prev.image_urls, ...uploadedUrls].filter(
          (url, index, all) => all.indexOf(url) === index,
        ),
      }));

      toast({
        title: "Imagens enviadas",
        description: `${uploadedUrls.length} imagem(ns) anexada(s) ao produto.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível enviar a imagem.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
        <Label>Categoria *</Label>
        <Select
          value={formData.category_id}
          onValueChange={(value) => setFormData({ ...formData, category_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
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
          placeholder="Detalhes adicionais do produto"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sale_price">Preço de Venda (R$) *</Label>
          <Input
            id="sale_price"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            required
            value={formData.sale_price}
            onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost_price">Preço de Custo (R$) *</Label>
          <Input
            id="cost_price"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            required
            value={formData.cost_price}
            onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
          />
        </div>
      </div>

      <div className="rounded-md border bg-muted/30 p-3 text-sm">
        <p className="text-muted-foreground">
          Margem estimada por unidade:{" "}
          <span className="font-semibold text-foreground">
            {formatCurrency(marginPreview.margin)} ({marginPreview.marginPercent.toFixed(1).replace(".", ",")}%)
          </span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="current_stock">Quantidade em Estoque *</Label>
          <Input
            id="current_stock"
            type="number"
            inputMode="numeric"
            min="0"
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
            inputMode="numeric"
            min="0"
            required
            value={formData.min_stock}
            onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="product_images">Imagens do Produto</Label>
          {formData.image_urls.length > 0 ? (
            <Badge variant="secondary">{formData.image_urls.length} imagem(ns)</Badge>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Input
            ref={fileInputRef}
            id="product_images"
            type="file"
            multiple
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={(e) => handleUploadImage(e.target.files)}
            disabled={uploadingImage}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
          >
            <ImagePlus className="mr-2 h-4 w-4" />
            Selecionar imagens
          </Button>
          <div className="text-sm text-muted-foreground">
            {uploadingImage ? "Enviando imagens..." : "Selecione uma ou mais fotos"}
          </div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row">
          <Input
            placeholder="Cole uma URL de imagem"
            value={manualImageUrl}
            onChange={(e) => setManualImageUrl(e.target.value)}
          />
          <Button type="button" variant="outline" onClick={handleAddManualImage}>
            <ImagePlus className="mr-2 h-4 w-4" />
            Adicionar URL
          </Button>
        </div>

        {formData.image_urls.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {formData.image_urls.map((imageUrl, index) => (
              <div key={imageUrl} className="overflow-hidden rounded-md border bg-card">
                <img
                  src={imageUrl}
                  alt={`Imagem ${index + 1} do produto`}
                  className="h-32 w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="flex items-center justify-between gap-2 p-2">
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    {index === 0 ? "Capa" : `Foto ${index + 1}`}
                  </Badge>
                  <div className="flex gap-1">
                    {index !== 0 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setCoverImage(imageUrl)}
                        title="Definir como capa"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeImageUrl(imageUrl)}
                      title="Remover imagem"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <Button type="submit" disabled={loading || uploadingImage} className="w-full">
        {loading ? "Salvando..." : product ? "Atualizar Produto" : "Cadastrar Produto"}
      </Button>
    </form>
  );
}
