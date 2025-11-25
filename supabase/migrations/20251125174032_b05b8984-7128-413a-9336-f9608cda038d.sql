-- Update the handle_new_user trigger to set 7-day trial period
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_tenant_id UUID;
BEGIN
  -- Create tenant for new user with 7-day trial period
  INSERT INTO public.tenants (
    owner_user_id, 
    name, 
    status, 
    plan,
    plan_status,
    trial_until
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'Minha Empresa'), 
    'active', 
    'free',
    'inactive',
    NOW() + INTERVAL '7 days'
  )
  RETURNING id INTO new_tenant_id;
  
  -- Assign admin role to first user with tenant_id
  INSERT INTO public.user_roles (user_id, role, tenant_id)
  VALUES (NEW.id, 'admin', new_tenant_id);
  
  RETURN NEW;
END;
$function$;