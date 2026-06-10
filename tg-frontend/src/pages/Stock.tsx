import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Images, Search } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import StockIndicator from "@/components/StockIndicator";
import { getProducts } from "@/integrations/productsApi";

interface ProductImage {
  id: number;
  imageUrl: string;
  sortOrder: number;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  currentStock: number;
  minStock: number;
  salePrice: number;
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

export default function Stock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [galleryProduct, setGalleryProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts((data || []) as Product[]);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar estoque",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  let filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (categoryFilter !== "all") {
    filteredProducts = filteredProducts.filter((p) => p.category?.name === categoryFilter);
  }

  filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "stock":
        return b.currentStock - a.currentStock;
      case "price":
        return b.salePrice - a.salePrice;
      default:
        return 0;
    }
  });

  const categories = Array.from(new Set(products.map((p) => p.category?.name).filter(Boolean)));
  const galleryImages = galleryProduct ? getProductImageUrls(galleryProduct) : [];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Estoque Atual</h1>
          <p className="text-muted-foreground mt-2">
            Visualize e monitore seu estoque em tempo real
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat!}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="stock">Quantidade</SelectItem>
              <SelectItem value="price">Preco</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imagem</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Estoque Minimo</TableHead>
                <TableHead className="text-right">Preco</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const imageUrls = getProductImageUrls(product);
                const coverImage = imageUrls[0];

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
                    <TableCell className="text-right font-semibold">{product.currentStock}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{product.minStock}</TableCell>
                    <TableCell className="text-right">R$ {Number(product.salePrice).toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      R$ {(Number(product.currentStock) * Number(product.salePrice)).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <StockIndicator currentStock={product.currentStock} minStock={product.minStock} />
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
      </div>
    </Layout>
  );
}
