# Sistema de Assinaturas - Documentação Completa

## ✅ Implementação Concluída

Sistema completo de assinaturas mensais de R$ 50/mês com controle de acesso automático.

---

## 📦 1. Estrutura no Banco de Dados

### Tabela `tenants` - Novos Campos Adicionados:

| Campo | Tipo | Padrão | Descrição |
|-------|------|---------|-----------|
| `plan_status` | text | 'inactive' | Status da assinatura: 'inactive' ou 'active' |
| `subscription_id` | text | null | ID da assinatura no provedor de pagamento |
| `plan_expires_at` | timestamp | null | Data de expiração da assinatura |
| `trial_until` | timestamp | null | Data de término do período de teste (opcional) |

**Arquivo de migração**: `supabase/migrations/[timestamp]_add_subscription_fields.sql`

---

## 🛡️ 2. Sistema de Verificação de Assinatura

### Hook Criado: `useSubscription`
**Arquivo**: `src/hooks/useSubscription.tsx`

**Funcionalidades**:
- `isSubscriptionActive()` - Verifica se assinatura está ativa e não expirou
- `isInTrial()` - Verifica se usuário está em período de teste
- `needsSubscription()` - Verifica se usuário precisa assinar
- `getTrialEndDate()` - Retorna data de fim do trial

### Componente: `SubscriptionProtectedRoute`
**Arquivo**: `src/components/SubscriptionProtectedRoute.tsx`

**Funcionalidade**:
- Protege rotas que requerem assinatura ativa
- Redireciona para `/assinatura-necessaria` se necessário
- Verifica autenticação + assinatura antes de renderizar conteúdo

---

## 📄 3. Página de Assinatura Necessária

**Rota**: `/assinatura-necessaria`  
**Arquivo**: `src/pages/SubscriptionRequired.tsx`

### Comportamento:
1. **Usuário SEM assinatura ativa**:
   - Mostra mensagem: "Sua assinatura não está ativa"
   - Exibe plano mensal de R$ 50
   - Botão "Assinar agora R$ 50/mês" que abre checkout externo

2. **Usuário EM período de teste**:
   - Mostra: "Você está no período de teste até [data]"
   - Permite continuar usando o sistema
   - Oferece opção de assinar antes do fim do trial

### Como alterar o link do checkout:

Edite o arquivo `src/pages/SubscriptionRequired.tsx` na linha 13:

```typescript
const [checkoutUrl, setCheckoutUrl] = useState("https://seu-checkout-aqui.com");
```

Substitua `"https://seu-checkout-aqui.com"` pelo link do seu checkout (Stripe, Mercado Pago, etc.).

---

## 🔌 4. Endpoints API (Edge Functions)

### A. Ativar Assinatura

**Endpoint**: `/functions/v1/activate-subscription`  
**Método**: `POST`  
**Arquivo**: `supabase/functions/activate-subscription/index.ts`

**Body esperado**:
```json
{
  "email": "usuario@exemplo.com",
  "subscription_id": "sub_123456789",
  "paid_until": "2025-12-31T23:59:59Z"
}
```

**Resposta de sucesso**:
```json
{
  "success": true
}
```

**O que faz**:
1. Busca usuário pelo email
2. Encontra o tenant do usuário
3. Atualiza:
   - `plan_status` → 'active'
   - `subscription_id` → ID recebido
   - `plan_expires_at` → data recebida

**Uso**: Webhook do provedor de pagamento deve chamar este endpoint após pagamento confirmado.

---

### B. Desativar Assinatura

**Endpoint**: `/functions/v1/deactivate-subscription`  
**Método**: `POST`  
**Arquivo**: `supabase/functions/deactivate-subscription/index.ts`

**Body esperado**:
```json
{
  "email": "usuario@exemplo.com"
}
```

**Resposta de sucesso**:
```json
{
  "success": true
}
```

**O que faz**:
1. Busca usuário pelo email
2. Encontra o tenant do usuário
3. Atualiza:
   - `plan_status` → 'inactive'
   - `plan_expires_at` → null

**Uso**: Webhook do provedor deve chamar ao cancelar/expirar assinatura.

---

## 🔐 5. Fluxo de Criação de Conta

**Arquivo modificado**: `src/contexts/AuthContext.tsx`

### Comportamento atualizado:
1. Usuário cria conta (email + senha)
2. Sistema cria tenant com `plan_status = 'inactive'`
3. **Redirecionamento automático para `/assinatura-necessaria`**
4. Usuário não consegue acessar dashboard até:
   - Pagar assinatura OU
   - Ter período de teste ativo

---

## 🛣️ 6. Rotas Protegidas

**Arquivo modificado**: `src/App.tsx`

### Rotas que exigem assinatura ativa:
- `/` (Dashboard)
- `/produtos`
- `/categorias`
- `/movimentacoes`
- `/estoque`
- `/relatorios`

### Rotas públicas:
- `/auth` (Login/Registro)
- `/assinatura-necessaria` (Página de assinatura)

### Estrutura de proteção (dupla camada):
```tsx
<ProtectedRoute>           {/* Verifica autenticação */}
  <SubscriptionProtectedRoute>  {/* Verifica assinatura */}
    <Dashboard />
  </SubscriptionProtectedRoute>
</ProtectedRoute>
```

---

## 📋 Lista de Arquivos Criados

### Novos arquivos:
1. `src/hooks/useSubscription.tsx` - Hook de verificação de assinatura
2. `src/hooks/useUserRole.tsx` - Hook de verificação de role
3. `src/components/SubscriptionProtectedRoute.tsx` - Componente de proteção
4. `src/pages/SubscriptionRequired.tsx` - Página de assinatura necessária
5. `supabase/functions/activate-subscription/index.ts` - Endpoint de ativação
6. `supabase/functions/deactivate-subscription/index.ts` - Endpoint de desativação

### Arquivos modificados:
1. `src/hooks/useTenant.tsx` - Adicionados campos de assinatura
2. `src/contexts/AuthContext.tsx` - Redirecionamento após signup
3. `src/App.tsx` - Rotas protegidas por assinatura
4. Migration SQL - Campos adicionados ao banco

---

## 🧪 Como Testar

### 1. Criar nova conta:
1. Acesse `/auth`
2. Crie uma nova conta
3. Será redirecionado para `/assinatura-necessaria`

### 2. Simular pagamento (teste):
Use ferramenta como Postman/Insomnia para chamar:

```bash
POST https://[seu-projeto].supabase.co/functions/v1/activate-subscription
Content-Type: application/json

{
  "email": "teste@exemplo.com",
  "subscription_id": "test_sub_123",
  "paid_until": "2025-12-31T23:59:59Z"
}
```

### 3. Verificar acesso:
1. Faça login novamente
2. Deve ser redirecionado para dashboard
3. Terá acesso a todas as páginas internas

### 4. Testar expiração:
```bash
POST https://[seu-projeto].supabase.co/functions/v1/deactivate-subscription
Content-Type: application/json

{
  "email": "teste@exemplo.com"
}
```

Ao recarregar página, será redirecionado para `/assinatura-necessaria`.

---

## 🔗 Integração com Provedor de Pagamento

### Stripe / Mercado Pago / Outros:

1. **No checkout**: Redirecione usuário para URL do provedor
2. **Após pagamento confirmado**: Configure webhook para chamar:
   - `POST /functions/v1/activate-subscription`
3. **Ao cancelar/expirar**: Configure webhook para chamar:
   - `POST /functions/v1/deactivate-subscription`

### URLs dos endpoints:
- Ativar: `https://zarhvqsyvrizwikoyuyi.supabase.co/functions/v1/activate-subscription`
- Desativar: `https://zarhvqsyvrizwikoyuyi.supabase.co/functions/v1/deactivate-subscription`

---

## ⚙️ Configurações Adicionais

### Para adicionar período de teste:

Execute SQL direto no banco:

```sql
UPDATE tenants 
SET trial_until = NOW() + INTERVAL '7 days'
WHERE id = 'tenant_id_aqui';
```

### Para verificar status de um tenant:

```sql
SELECT 
  id,
  name,
  plan_status,
  subscription_id,
  plan_expires_at,
  trial_until
FROM tenants
WHERE id = 'tenant_id_aqui';
```

---

## 🎯 Resumo Executivo

✅ **Banco estruturado** com campos de assinatura  
✅ **Middleware de verificação** automático  
✅ **Página de assinatura** com informações claras  
✅ **Endpoints API** prontos para webhooks  
✅ **Proteção de rotas** em todas páginas internas  
✅ **Fluxo de signup** redirecionando corretamente  
✅ **Sistema de trial** opcional implementado  

**O sistema está 100% funcional e pronto para integração com provedor de pagamento!**
