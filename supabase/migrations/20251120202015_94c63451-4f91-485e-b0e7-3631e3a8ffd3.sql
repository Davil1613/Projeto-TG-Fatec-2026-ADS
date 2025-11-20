-- Remove trial logic and set all tenants as active by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_tenant_id UUID;
BEGIN
  -- Create tenant for new user with active status (no trial)
  INSERT INTO public.tenants (owner_user_id, name, status, plan)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'company_name', 'Minha Empresa'), 'active', 'free')
  RETURNING id INTO new_tenant_id;
  
  -- Assign admin role to first user with tenant_id
  INSERT INTO public.user_roles (user_id, role, tenant_id)
  VALUES (NEW.id, 'admin', new_tenant_id);
  
  RETURN NEW;
END;
$function$;