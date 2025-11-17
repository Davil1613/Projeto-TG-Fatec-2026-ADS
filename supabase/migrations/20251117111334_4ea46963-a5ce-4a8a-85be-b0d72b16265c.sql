-- Create tenants table
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'trial')),
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  subscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(owner_user_id)
);

-- Enable RLS on tenants
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'mercadopago')),
  subscription_id TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'active', 'failed', 'canceled')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  next_billing_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(subscription_id)
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Add tenant_id to user_roles FIRST (before creating functions that use it)
ALTER TABLE public.user_roles ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_user_roles_tenant_id ON public.user_roles(tenant_id);

-- Add tenant_id to existing tables
ALTER TABLE public.products ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.categories ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
ALTER TABLE public.stock_movements ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Create indexes for tenant_id
CREATE INDEX idx_products_tenant_id ON public.products(tenant_id);
CREATE INDEX idx_categories_tenant_id ON public.categories(tenant_id);
CREATE INDEX idx_stock_movements_tenant_id ON public.stock_movements(tenant_id);

-- NOW create security definer function to get user's tenant
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Update handle_new_user function to create tenant
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_tenant_id UUID;
  trial_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate trial end date (7 days from now)
  trial_end := now() + interval '7 days';
  
  -- Create tenant for new user
  INSERT INTO public.tenants (owner_user_id, name, status, trial_ends_at)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'company_name', 'Minha Empresa'), 'trial', trial_end)
  RETURNING id INTO new_tenant_id;
  
  -- Assign admin role to first user with tenant_id
  INSERT INTO public.user_roles (user_id, role, tenant_id)
  VALUES (NEW.id, 'admin', new_tenant_id);
  
  RETURN NEW;
END;
$$;

-- Drop existing RLS policies on products
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

-- Create new tenant-scoped policies for products
CREATE POLICY "Users can view products from their tenant"
  ON public.products
  FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can insert products to their tenant"
  ON public.products
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') AND 
    tenant_id = public.get_user_tenant_id(auth.uid())
  );

CREATE POLICY "Admins can update products in their tenant"
  ON public.products
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') AND 
    tenant_id = public.get_user_tenant_id(auth.uid())
  );

CREATE POLICY "Admins can delete products from their tenant"
  ON public.products
  FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin') AND 
    tenant_id = public.get_user_tenant_id(auth.uid())
  );

-- Drop existing RLS policies on categories
DROP POLICY IF EXISTS "Authenticated users can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;

-- Create new tenant-scoped policies for categories
CREATE POLICY "Users can view categories from their tenant"
  ON public.categories
  FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can insert categories to their tenant"
  ON public.categories
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') AND 
    tenant_id = public.get_user_tenant_id(auth.uid())
  );

CREATE POLICY "Admins can update categories in their tenant"
  ON public.categories
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') AND 
    tenant_id = public.get_user_tenant_id(auth.uid())
  );

CREATE POLICY "Admins can delete categories from their tenant"
  ON public.categories
  FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin') AND 
    tenant_id = public.get_user_tenant_id(auth.uid())
  );

-- Drop existing RLS policies on stock_movements
DROP POLICY IF EXISTS "Authenticated users can view movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Admins can insert movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Admins can update movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Admins can delete movements" ON public.stock_movements;

-- Create new tenant-scoped policies for stock_movements
CREATE POLICY "Users can view movements from their tenant"
  ON public.stock_movements
  FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Admins can insert movements to their tenant"
  ON public.stock_movements
  FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') AND 
    tenant_id = public.get_user_tenant_id(auth.uid())
  );

CREATE POLICY "Admins can update movements in their tenant"
  ON public.stock_movements
  FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin') AND 
    tenant_id = public.get_user_tenant_id(auth.uid())
  );

CREATE POLICY "Admins can delete movements from their tenant"
  ON public.stock_movements
  FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin') AND 
    tenant_id = public.get_user_tenant_id(auth.uid())
  );

-- RLS policies for tenants
CREATE POLICY "Users can view their own tenant"
  ON public.tenants
  FOR SELECT
  USING (id = public.get_user_tenant_id(auth.uid()));

CREATE POLICY "Owners can update their tenant"
  ON public.tenants
  FOR UPDATE
  USING (owner_user_id = auth.uid());

-- RLS policies for subscriptions
CREATE POLICY "Users can view subscriptions of their tenant"
  ON public.subscriptions
  FOR SELECT
  USING (tenant_id = public.get_user_tenant_id(auth.uid()));

-- Trigger for updated_at on tenants
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for updated_at on subscriptions
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();