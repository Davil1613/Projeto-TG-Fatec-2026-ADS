-- Create a view that excludes cost_price for non-admin users
CREATE OR REPLACE VIEW public.products_public AS
SELECT 
  id,
  name,
  sku,
  description,
  image_url,
  category_id,
  sale_price,
  current_stock,
  min_stock,
  tenant_id,
  created_at,
  updated_at
FROM public.products;

-- Enable RLS on the view
ALTER VIEW public.products_public SET (security_invoker = true);

-- Update the main products SELECT policy to be admin-only
DROP POLICY IF EXISTS "Users can view products from their tenant" ON public.products;

CREATE POLICY "Admins can view all product data from their tenant" 
ON public.products 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  AND tenant_id = get_user_tenant_id(auth.uid())
);

-- Create a policy on the view for non-admin users
-- Note: Views inherit RLS from base tables, but we control access via the base table policy