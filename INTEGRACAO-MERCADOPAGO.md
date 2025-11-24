# Integração Mercado Pago - Assinaturas Recorrentes

## ✅ O que foi implementado

### 1. **Atualização do Botão de Compra**
- **Arquivo:** `src/pages/SubscriptionRequired.tsx`
- **Mudança:** O botão "Assinar agora" redireciona para o link do Mercado Pago
- **Link:** https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=3e61f1af5985402f89e1ddb1a13c5da9

### 2. **Validação de Acesso no Login**
- **Sistema:** O middleware `SubscriptionProtectedRoute` já existente verifica automaticamente
- **Tabela:** `tenants` com campo `plan_status` ("active" ou "inactive")
- **Fluxo:** 
  - Ao acessar qualquer rota protegida, verifica se `plan_status === "active"`
  - Se não estiver ativo, redireciona para `/assinatura-necessaria`

### 3. **Endpoint de Webhook**
- **Edge Function:** `supabase/functions/mercadopago-webhook/index.ts`
- **Rota:** `POST https://zarhvqsyvrizwikoyuyi.supabase.co/functions/v1/mercadopago-webhook`
- **Funcionalidade:**
  - Recebe eventos do Mercado Pago (`subscription_preapproval`, `subscription_authorized_payment`)
  - Consulta API do Mercado Pago para verificar status da assinatura
  - Atualiza `tenants.plan_status` para "active" quando status é "authorized"
  - Atualiza `tenants.plan_status` para "inactive" quando status é "cancelled" ou "paused"
  - Registra `subscription_id` e `plan_expires_at` (próxima data de cobrança)

### 4. **Endpoint de Verificação Manual**
- **Edge Function:** `supabase/functions/check-subscription/index.ts`
- **Rota:** `POST https://zarhvqsyvrizwikoyuyi.supabase.co/functions/v1/check-subscription`
- **Body:** `{ "user_id": "uuid-do-usuario" }`
- **Funcionalidade:**
  - Busca o tenant do usuário
  - Consulta API do Mercado Pago usando o `subscription_id` armazenado
  - Atualiza status no banco de acordo com resposta do MP
  - Retorna: `{ "status": "active|inactive", "subscription_status": "authorized|cancelled|...", "next_payment_date": "..." }`

### 5. **Middleware de Proteção**
- **Componente:** `src/components/SubscriptionProtectedRoute.tsx` (já existente, reutilizado)
- **Hook:** `src/hooks/useSubscription.tsx`
- **Funcionalidade:**
  - Bloqueia acesso se `plan_status !== "active"`
  - Redireciona para `/assinatura-necessaria`
  - Permite acesso durante período de trial (se `trial_until` estiver definido)

### 6. **Campos no Banco de Dados**
- **Tabela:** `tenants`
- **Campos existentes utilizados:**
  - `subscription_id` (string) - ID da assinatura no Mercado Pago (preapproval_id)
  - `plan_status` (string) - "active" ou "inactive"
  - `plan_expires_at` (datetime) - Próxima data de cobrança
  - `trial_until` (datetime) - Data de fim do período de teste (opcional)

### 7. **Variáveis de Ambiente (Secrets)**
- **Secrets adicionados no Supabase:**
  - `MP_ACCESS_TOKEN` - Token de acesso do Mercado Pago (PRODUÇÃO)
  - `MP_WEBHOOK_SECRET` - Secret para validação de webhooks (opcional)

---

## 🔧 Como Configurar o Webhook no Mercado Pago

### Passo 1: Acessar Painel do Mercado Pago
1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Vá em **"Suas integrações"** → **"Webhooks"**

### Passo 2: Criar Novo Webhook
1. Clique em **"Criar webhook"**
2. Preencha:
   - **URL de produção:** `https://zarhvqsyvrizwikoyuyi.supabase.co/functions/v1/mercadopago-webhook`
   - **Eventos selecionados:**
     - ✅ `subscription_preapproval`
     - ✅ `subscription_authorized_payment`
3. Clique em **"Salvar"**

### Passo 3: Testar Webhook
1. No painel de Webhooks, clique em **"Simular notificação"**
2. Escolha o evento `subscription_preapproval`
3. Verifique nos logs da edge function se o webhook foi recebido

---

## 📊 Fluxo Completo de Assinatura

### 1. Usuário Cria Conta
```
Signup → Tenant criado com plan_status = "inactive" 
       → Redireciona para /assinatura-necessaria
```

### 2. Usuário Clica em "Assinar Agora"
```
Abre link do MP → Realiza pagamento → MP processa assinatura
```

### 3. Mercado Pago Envia Webhook
```
MP → POST /mercadopago-webhook → Verifica status "authorized" 
   → Atualiza plan_status = "active" no tenant
```

### 4. Usuário Acessa Dashboard
```
Middleware verifica plan_status === "active" 
  → Se sim: permite acesso
  → Se não: redireciona para /assinatura-necessaria
```

### 5. Assinatura Cancelada/Pausada
```
MP → POST /mercadopago-webhook → Detecta status "cancelled"/"paused"
   → Atualiza plan_status = "inactive"
   → Próximo login: usuário é bloqueado e redirecionado
```

---

## 🧪 Como Testar

### Testar Verificação Manual
```bash
curl -X POST https://zarhvqsyvrizwikoyuyi.supabase.co/functions/v1/check-subscription \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_SUPABASE_ANON_KEY" \
  -d '{"user_id": "uuid-do-usuario"}'
```

### Testar Webhook (localmente)
```bash
curl -X POST https://zarhvqsyvrizwikoyuyi.supabase.co/functions/v1/mercadopago-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "subscription_preapproval",
    "data": {
      "id": "seu-preapproval-id-de-teste"
    }
  }'
```

---

## 📝 Arquivos Modificados/Criados

### ✨ Novos Arquivos
- `supabase/functions/mercadopago-webhook/index.ts` - Webhook do Mercado Pago
- `supabase/functions/check-subscription/index.ts` - Verificação manual
- `INTEGRACAO-MERCADOPAGO.md` - Esta documentação

### 📝 Arquivos Modificados
- `src/pages/SubscriptionRequired.tsx` - Link do botão atualizado
- `supabase/config.toml` - Configuração das edge functions

### 🔄 Arquivos Reutilizados (já existentes)
- `src/components/SubscriptionProtectedRoute.tsx` - Middleware de proteção
- `src/hooks/useSubscription.tsx` - Hook de verificação de assinatura
- `src/contexts/AuthContext.tsx` - Redirecionamento após signup
- Tabela `tenants` - Armazenamento de dados de assinatura

---

## 🚀 Próximos Passos

1. **Configurar webhook no painel do Mercado Pago** (veja seção "Como Configurar o Webhook")
2. **Testar fluxo completo:**
   - Criar nova conta
   - Ser redirecionado para página de assinatura
   - Clicar em "Assinar agora" e completar pagamento no MP
   - Aguardar webhook ser recebido
   - Verificar se `plan_status` foi atualizado para "active"
   - Fazer login e confirmar acesso liberado
3. **Monitorar logs:**
   - Logs do webhook: verificar se eventos estão sendo recebidos
   - Logs do check-subscription: testar verificação manual
4. **Configurar notificações:** Adicionar alertas quando assinatura for cancelada

---

## 🔐 Segurança

- ✅ Webhook é público (não requer autenticação) mas valida dados com API do MP
- ✅ Check-subscription requer autenticação JWT
- ✅ Tokens do MP armazenados como secrets no Supabase
- ✅ RLS policies protegem acesso aos dados dos tenants
- ✅ Middleware verifica status antes de cada acesso

---

## 📞 Suporte

Em caso de dúvidas sobre a API do Mercado Pago:
- Documentação: https://www.mercadopago.com.br/developers/pt/docs
- Webhooks: https://www.mercadopago.com.br/developers/pt/docs/webhooks
- Assinaturas: https://www.mercadopago.com.br/developers/pt/docs/subscriptions
