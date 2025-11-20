-- Remove the global unique constraint on SKU
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_sku_key;

-- Add a composite unique constraint on SKU + tenant_id
ALTER TABLE public.products ADD CONSTRAINT products_sku_tenant_unique UNIQUE (sku, tenant_id);