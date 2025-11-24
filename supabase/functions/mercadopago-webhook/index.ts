import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para validar assinatura do webhook do Mercado Pago
async function validateWebhookSignature(req: Request): Promise<boolean> {
  try {
    const mpWebhookSecret = Deno.env.get('MP_WEBHOOK_SECRET');
    if (!mpWebhookSecret) {
      console.warn('MP_WEBHOOK_SECRET not configured, skipping signature validation');
      return true; // Allow if secret not configured (for backward compatibility)
    }

    const signature = req.headers.get('x-signature');
    const requestId = req.headers.get('x-request-id');
    
    if (!signature || !requestId) {
      console.error('Missing signature headers');
      return false;
    }

    // Extrair ts e v1 da assinatura
    const signatureParts: Record<string, string> = {};
    signature.split(',').forEach(part => {
      const [key, value] = part.trim().split('=');
      if (key && value) signatureParts[key] = value;
    });

    const ts = signatureParts['ts'];
    const hash = signatureParts['v1'];

    if (!ts || !hash) {
      console.error('Invalid signature format');
      return false;
    }

    // Construir o manifest (data string) para validação
    const url = new URL(req.url);
    const dataId = url.searchParams.get('data.id') || url.searchParams.get('id') || '';
    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;

    // Calcular HMAC SHA256
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(mpWebhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(manifest)
    );

    const computedHash = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const isValid = computedHash === hash;
    if (!isValid) {
      console.error('Signature validation failed', { 
        computed: computedHash.substring(0, 10) + '...', 
        received: hash.substring(0, 10) + '...' 
      });
    }
    
    return isValid;
  } catch (error) {
    console.error('Error validating signature:', error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validar assinatura do webhook ANTES de processar
    const isValidSignature = await validateWebhookSignature(req);
    if (!isValidSignature) {
      console.error('Invalid webhook signature - possible forgery attempt');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const body = await req.json();
    
    console.log('Mercado Pago webhook received:', JSON.stringify(body, null, 2));

    // Mercado Pago sends notification with type and data
    const { type, data } = body;

    // We're interested in subscription events
    if (type === 'subscription_preapproval' || type === 'subscription_authorized_payment') {
      const preapprovalId = data?.id || body.id;
      
      if (!preapprovalId) {
        console.error('No preapproval_id found in webhook payload');
        return new Response(
          JSON.stringify({ error: 'Missing preapproval_id' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Fetching subscription details from Mercado Pago for ID:', preapprovalId);

      // Fetch subscription details from Mercado Pago
      const mpResponse = await fetch(
        `https://api.mercadopago.com/preapproval/${preapprovalId}`,
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
      console.log('Mercado Pago subscription data:', JSON.stringify(subscription, null, 2));

      const { status, payer_email, next_payment_date } = subscription;

      // Only activate if status is 'authorized'
      if (status === 'authorized') {
        console.log('Subscription authorized, activating for email:', payer_email);

        // Find user by email
        const { data: authUser, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.error('Error fetching users:', authError);
          return new Response(
            JSON.stringify({ error: 'Failed to find user' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const user = authUser.users.find(u => u.email === payer_email);
        
        if (!user) {
          console.log('User not found for email:', payer_email);
          return new Response(
            JSON.stringify({ error: 'User not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Find tenant for this user
        const { data: userRole, error: roleError } = await supabase
          .from('user_roles')
          .select('tenant_id')
          .eq('user_id', user.id)
          .single();

        if (roleError || !userRole) {
          console.error('Error fetching user role:', roleError);
          return new Response(
            JSON.stringify({ error: 'Tenant not found for user' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update tenant with subscription info
        const expiresAt = next_payment_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        
        const { error: updateError } = await supabase
          .from('tenants')
          .update({
            plan_status: 'active',
            subscription_id: preapprovalId,
            plan_expires_at: expiresAt,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userRole.tenant_id);

        if (updateError) {
          console.error('Error updating tenant:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to activate subscription' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Subscription activated successfully for tenant:', userRole.tenant_id);
      } else if (status === 'cancelled' || status === 'paused') {
        console.log('Subscription cancelled/paused, deactivating for email:', payer_email);

        // Find user and deactivate subscription
        const { data: authUser } = await supabase.auth.admin.listUsers();
        const user = authUser?.users.find(u => u.email === payer_email);
        
        if (user) {
          const { data: userRole } = await supabase
            .from('user_roles')
            .select('tenant_id')
            .eq('user_id', user.id)
            .single();

          if (userRole) {
            await supabase
              .from('tenants')
              .update({
                plan_status: 'inactive',
                updated_at: new Date().toISOString(),
              })
              .eq('id', userRole.tenant_id);
            
            console.log('Subscription deactivated for tenant:', userRole.tenant_id);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in mercadopago-webhook function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
