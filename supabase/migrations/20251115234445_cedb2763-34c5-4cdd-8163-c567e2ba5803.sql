-- Tabela de categorias
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de produtos
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  description TEXT,
  sale_price DECIMAL(10,2) NOT NULL CHECK (sale_price >= 0),
  cost_price DECIMAL(10,2) NOT NULL CHECK (cost_price >= 0),
  current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  min_stock INTEGER DEFAULT 10 CHECK (min_stock >= 0),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de movimentações de estoque
CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('entrada', 'saida')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (acesso público para este sistema de estoque)
CREATE POLICY "Permitir leitura de categorias" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de categorias" ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de categorias" ON public.categories FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de categorias" ON public.categories FOR DELETE USING (true);

CREATE POLICY "Permitir leitura de produtos" ON public.products FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de produtos" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de produtos" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de produtos" ON public.products FOR DELETE USING (true);

CREATE POLICY "Permitir leitura de movimentações" ON public.stock_movements FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de movimentações" ON public.stock_movements FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir atualização de movimentações" ON public.stock_movements FOR UPDATE USING (true);
CREATE POLICY "Permitir exclusão de movimentações" ON public.stock_movements FOR DELETE USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at em produtos
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Função para atualizar estoque após movimentação
CREATE OR REPLACE FUNCTION public.update_stock_after_movement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.movement_type = 'entrada' THEN
    UPDATE public.products 
    SET current_stock = current_stock + NEW.quantity
    WHERE id = NEW.product_id;
  ELSIF NEW.movement_type = 'saida' THEN
    UPDATE public.products 
    SET current_stock = GREATEST(0, current_stock - NEW.quantity)
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para atualizar estoque automaticamente
CREATE TRIGGER update_stock_trigger
AFTER INSERT ON public.stock_movements
FOR EACH ROW
EXECUTE FUNCTION public.update_stock_after_movement();

-- Inserir categorias padrão
INSERT INTO public.categories (name, description) VALUES
  ('Eletrônicos', 'Produtos eletrônicos e tecnologia'),
  ('Alimentos', 'Produtos alimentícios'),
  ('Roupas', 'Vestuário e acessórios'),
  ('Higiene', 'Produtos de higiene e limpeza'),
  ('Outros', 'Produtos diversos');

-- Habilitar realtime para atualizações em tempo real
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_movements;