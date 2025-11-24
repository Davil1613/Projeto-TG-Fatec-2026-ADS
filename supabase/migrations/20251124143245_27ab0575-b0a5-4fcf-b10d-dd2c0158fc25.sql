-- Add subscription fields to tenants table
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS plan_status text NOT NULL DEFAULT 'inactive' CHECK (plan_status IN ('inactive', 'active')),
ADD COLUMN IF NOT EXISTS subscription_id text,
ADD COLUMN IF NOT EXISTS plan_expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS trial_until timestamp with time zone;

-- Create index for faster queries on plan_status
CREATE INDEX IF NOT EXISTS idx_tenants_plan_status ON public.tenants(plan_status);

-- Create index for faster queries on plan_expires_at
CREATE INDEX IF NOT EXISTS idx_tenants_plan_expires_at ON public.tenants(plan_expires_at);