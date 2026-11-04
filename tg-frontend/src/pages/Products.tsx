import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { getProducts, deleteProduct, createProduct } from "@/integrations/productsApi";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Download, Edit, FileUp, Images, Plus, QrCode, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import ProductForm from "@/components/ProductForm";
import StockIndicator from "@/components/StockIndicator";
import { exportTableToExcel } from "@/lib/excel";

interface ProductImage {
  id: number;
  imageUrl: string;
  sortOrder: number;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  categoryId: number | null;
  currentStock: number;
  minStock: number;
  salePrice: number;
  costPrice?: number;
  imageUrl?: string | null;
  images?: ProductImage[];
  category?: { name: string } | null;
}

function getProductImageUrls(product: Product) {
  const galleryUrls = (product.images || [])
    .sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder))
    .map((image) => image.imageUrl)
    .filter(Boolean);

  return [...galleryUrls, product.imageUrl]
    .filter((url) => typeof url === "string" && url.trim())
    .filter((url, index, all) => all.indexOf(url) === index);
}

function getStockFilter(product: Product) {
  if (Number(product.currentStock) === 0) return "empty";
  if (Number(product.currentStock) <= Number(product.minStock) * 0.5) return "critical";
  if (Number(product.currentStock) <= Number(product.minStock)) return "low";
  return "normal";
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [galleryProduct, setGalleryProduct] = useState<Product | null>(null);
  const [qrProduct, setQrProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const { isAdmin } = useUserRole();

  useEffect(() => {
    loadProducts();
  }, [isAdmin]);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar produtos",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      await deleteProduct(id);
      toast({ title: "Produto excluido com sucesso!" });
      loadProducts();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir produto",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
    loadProducts();
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStock =
        stockFilter === "all" || getStockFilter(product) === stockFilter;

      return matchesSearch && matchesStock;
    });
  }, [products, searchTerm, stockFilter]);

  const handleExportProducts = () => {
    const rows = filteredProducts.map((product) => {
      const replenishment = Math.max(Number(product.minStock) - Number(product.currentStock), 0);
      return [
        product.sku,
        product.name,
        product.category?.name || "-",
        product.currentStock,
        product.minStock,
        replenishment,
        Number(product.salePrice).toFixed(2),
        ...(isAdmin ? [Number(product.costPrice || 0).toFixed(2)] : []),
        getProductImageUrls(product).length,
      ];
    });

    exportTableToExcel({
      filename: `produtos_estoque_${new Date().toISOString().slice(0, 10)}.csv`,
      headers: [
        "SKU",
        "Produto",
        "Categoria",
        "Estoque Atual",
        "Estoque Mínimo",
        "Reposição Sugerida",
        "Preço Venda",
        ...(isAdmin ? ["Preço Custo"] : []),
        "Qtd. Imagens",
      ],
      rows,
    });
  };

  const parseCsvLine = (line: string) => {
    const separator = line.includes(";") ? ";" : ",";
    const values: string[] = [];
    let current = "";
    let insideQuotes = false;

    for (const char of line) {
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === separator && !insideQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values.map((value) => value.replace(/^"|"$/g, ""));
  };

  const handleImportCsv = async (file?: File) => {
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((line) => line.trim());
      const [headerLine, ...bodyLines] = lines;
      const headers = parseCsvLine(headerLine).map((header) => header.trim());

      let importedCount = 0;
      for (const line of bodyLines) {
        const values = parseCsvLine(line);
        const row = headers.reduce<Record<string, string>>((acc, header, index) => {
          acc[header] = values[index] || "";
          return acc;
        }, {});

        await createProduct({
          name: row.name || row.nome,
          sku: row.sku,
          categoryId: Number(row.categoryId || row.categoriaId),
          description: row.description || row.descricao || null,
          salePrice: Number(row.salePrice || row.precoVenda || 0),
          costPrice: Number(row.costPrice || row.precoCusto || 0),
          currentStock: Number(row.currentStock || row.estoqueAtual || 0),
          minStock: Number(row.minStock || row.estoqueMinimo || 0),
          imageUrl: row.imageUrl || row.imagem || null,
          imageUrls: row.imageUrl || row.imagem ? [row.imageUrl || row.imagem] : [],
        });
        importedCount += 1;
      }

      toast({
        title: "Importação concluída",
        description: `${importedCount} produto(s) importado(s) com sucesso.`,
      });
      loadProducts();
    } catch (error: any) {
      toast({
        title: "Erro ao importar CSV",
        description:
          error.message ||
          "Verifique as colunas: name, sku, categoryId, salePrice, costPrice, currentStock e minStock.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadImportTemplate = () => {
    exportTableToExcel({
      filename: "modelo_importacao_produtos.csv",
      headers: [
        "name",
        "sku",
        "categoryId",
        "description",
        "salePrice",
        "costPrice",
        "currentStock",
        "minStock",
        "imageUrl",
      ],
      rows: [["Produto Exemplo", "SKU-001", 1, "Descrição opcional", 49.9, 25.5, 10, 3, ""]],
    });
  };

  const galleryImages = galleryProduct ? getProductImageUrls(galleryProduct) : [];
  const qrPayload = qrProduct
    ? JSON.stringify({
        id: qrProduct.id,
        sku: qrProduct.sku,
        name: qrProduct.name,
      })
    : "";
  const qrUrl = qrPayload
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrPayload)}`
    : "";

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Produtos</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie seu catálogo de produtos
            </p>
          </div>
          {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" onClick={() => setEditingProduct(null)}>
                <Plus className="mr-2 h-5 w-5" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Editar Produto" : "Novo Produto"}
                </DialogTitle>
              </DialogHeader>
              <ProductForm
                product={editingProduct}
                onSuccess={handleSuccess}
              />
            </DialogContent>
          </Dialog>
          )}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos por nome ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {isAdmin && (
            <>
            <Button type="button" variant="outline" onClick={handleDownloadImportTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Modelo CSV
            </Button>

            <Button type="button" variant="outline" asChild>
              <label className="cursor-pointer">
                <FileUp className="mr-2 h-4 w-4" />
                Importar CSV
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(e) => handleImportCsv(e.target.files?.[0])}
                />
              </label>
            </Button>
            </>
            )}

            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="Status do estoque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Baixo</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
                <SelectItem value="empty">Esgotado</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              onClick={handleExportProducts}
              disabled={filteredProducts.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagem</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead className="text-right">Reposição</TableHead>
                <TableHead className="text-right">Preço Venda</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const imageUrls = getProductImageUrls(product);
                const coverImage = imageUrls[0];
                const replenishment = Math.max(
                  Number(product.minStock) - Number(product.currentStock),
                  0,
                );

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      {coverImage ? (
                        <button
                          type="button"
                          onClick={() => setGalleryProduct(product)}
                          className="relative block rounded-md border focus:outline-none focus:ring-2 focus:ring-ring"
                          title="Ver imagens do produto"
                        >
                          <img
                            src={coverImage}
                            alt={product.name}
                            className="h-11 w-11 rounded-md object-cover"
                          />
                          {imageUrls.length > 1 ? (
                            <Badge className="absolute -right-2 -top-2 h-5 min-w-5 px-1 text-[10px]">
                              {imageUrls.length}
                            </Badge>
                          ) : null}
                        </button>
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-md border bg-muted">
                          <Images className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category?.name || "-"}</TableCell>
                    <TableCell className="text-right">{product.currentStock}</TableCell>
                    <TableCell className="text-right">
                      {replenishment > 0 ? `${replenishment} un.` : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(product.salePrice))}
                    </TableCell>
                    <TableCell>
                      <StockIndicator
                        currentStock={product.currentStock}
                        minStock={product.minStock}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setQrProduct(product)}
                          title="Gerar QR Code"
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingProduct(product);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <Dialog open={!!galleryProduct} onOpenChange={(open) => !open && setGalleryProduct(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{galleryProduct?.name || "Imagens do produto"}</DialogTitle>
            </DialogHeader>

            {galleryImages.length > 0 ? (
              <Carousel className="mx-auto w-full max-w-2xl">
                <CarouselContent>
                  {galleryImages.map((imageUrl, index) => (
                    <CarouselItem key={imageUrl}>
                      <div className="overflow-hidden rounded-md border bg-muted">
                        <img
                          src={imageUrl}
                          alt={`${galleryProduct?.name || "Produto"} - imagem ${index + 1}`}
                          className="h-[420px] w-full object-contain"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {galleryImages.length > 1 ? (
                  <>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </>
                ) : null}
              </Carousel>
            ) : null}
          </DialogContent>
        </Dialog>

        <Dialog open={!!qrProduct} onOpenChange={(open) => !open && setQrProduct(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>QR Code do Produto</DialogTitle>
            </DialogHeader>

            {qrProduct ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-md border bg-white p-4">
                  <img src={qrUrl} alt={`QR Code de ${qrProduct.name}`} className="h-full w-full" />
                </div>
                <div>
                  <p className="font-semibold">{qrProduct.name}</p>
                  <p className="text-sm text-muted-foreground">SKU {qrProduct.sku}</p>
                </div>
                <Button type="button" variant="outline" asChild className="w-full">
                  <a href={qrUrl} download={`qrcode-${qrProduct.sku}.png`}>
                    <Download className="mr-2 h-4 w-4" />
                    Baixar QR Code
                  </a>
                </Button>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
