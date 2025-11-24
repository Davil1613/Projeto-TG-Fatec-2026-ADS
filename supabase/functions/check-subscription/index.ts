import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { user_id } = await req.json();

    console.log('Checking subscription for user:', user_id);

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get tenant for this user
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('tenant_id')
      .eq('user_id', user_id)
      .single();

    if (roleError || !userRole) {
      console.error('Error fetching user role:', roleError);
      return new Response(
        JSON.stringify({ error: 'Tenant not found for user' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get tenant data
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('subscription_id, plan_status, plan_expires_at')
      .eq('id', userRole.tenant_id)
      .single();

    if (tenantError || !tenant) {
      console.error('Error fetching tenant:', tenantError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch tenant data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!tenant.subscription_id) {
      console.log('No subscription_id found for tenant');
      return new Response(
        JSON.stringify({ 
          status: 'inactive',
          message: 'No subscription found'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching subscription from Mercado Pago:', tenant.subscription_id);

    // Fetch subscription details from Mercado Pago
    const mpResponse = await fetch(
      `https://api.mercadopago.com/preapproval/${tenant.subscription_id}`,
      {
        headers: {
          'Authorization': `Bearer ${mpAccessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!mpResponse.ok) {
      console.error('Failed to fetch from Mercado Pago:', await mpResponse.text());
      return new Response(
        JSON.stringify({ error: 'Failed to fetch subscription from Mercado Pago' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const subscription = await mpResponse.json();
    console.log('Mercado Pago subscription status:', subscription.status);

    const { status, next_payment_date } = subscription;

    // Update tenant based on current status
    let newStatus = 'inactive';
    if (status === 'authorized') {
      newStatus = 'active';
    }

    const expiresAt = next_payment_date || tenant.plan_expires_at;

    const { error: updateError } = await supabase
      .from('tenants')
      .update({
        plan_status: newStatus,
        plan_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userRole.tenant_id);

    if (updateError) {
      console.error('Error updating tenant:', updateError);
    } else {
      console.log('Tenant updated with status:', newStatus);
    }

    return new Response(
      JSON.stringify({ 
        status: newStatus,
        subscription_status: status,
        next_payment_date: expiresAt,
        subscription_id: tenant.subscription_id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-subscription function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
