# Correções de Segurança Implementadas

## ✅ Correções Aplicadas

### 1. **Validação de Assinatura do Webhook Mercado Pago**
- **Arquivo:** `supabase/functions/mercadopago-webhook/index.ts`
- **Implementado:** Validação HMAC-SHA256 usando `MP_WEBHOOK_SECRET`
- **Como funciona:**
  - Extrai headers `x-signature` e `x-request-id` do webhook
  - Constrói manifest string: `id:{data.id};request-id:{requestId};ts:{timestamp};`
  - Calcula HMAC-SHA256 do manifest usando o secret
  - Compara hash calculado com o hash recebido
  - Rejeita requisições com assinatura inválida (HTTP 401)
- **Proteção:** Impede que atacantes forjem eventos de pagamento falsos

### 2. **Remoção de Endpoints Inseguros**
- **Removido:** `supabase/functions/activate-subscription/index.ts`
- **Removido:** `supabase/functions/deactivate-subscription/index.ts`
- **Motivo:** Esses endpoints não tinham autenticação e permitiam que qualquer pessoa ativasse/desativasse assinaturas
- **Solução:** O webhook do Mercado Pago (agora com validação de assinatura) é a única forma de ativar/desativar assinaturas

### 3. **Validação Robusta de Entrada na Autenticação**
- **Arquivo:** `src/pages/Auth.tsx`
- **Implementado:** Schema zod com validações:
  - Email: formato válido, máximo 255 caracteres
  - Senha: mínimo 8 caracteres (era 6), deve conter:
    - Pelo menos uma letra maiúscula
    - Pelo menos uma letra minúscula
    - Pelo menos um número
  - Nome da empresa: 2-100 caracteres
- **Mensagens de erro:** Feedback claro para o usuário sobre o que está incorreto
- **Validação:** Ocorre antes de chamar Supabase Auth

---

## 🔒 Estado de Segurança Atual

### Vulnerabilidades Corrigidas
✅ Webhook aceita eventos falsificados → **CORRIGIDO** (validação de assinatura)  
✅ Qualquer um pode ativar assinaturas → **CORRIGIDO** (endpoint removido)  
✅ Qualquer um pode desativar assinaturas → **CORRIGIDO** (endpoint removido)  
✅ Senhas fracas aceitas → **CORRIGIDO** (validação zod + requisitos)

### Proteções Existentes (já implementadas)
✅ RLS policies em todas as tabelas principais  
✅ Isolamento multi-tenant via `tenant_id`  
✅ Controle de acesso baseado em roles (admin/user)  
✅ Preços de custo visíveis apenas para admins  
✅ Verificação de assinatura server-side em rotas protegidas

---

## 🧪 Como Testar as Correções

### Testar Validação de Webhook
```bash
# Deve falhar com signature inválida
curl -X POST https://zarhvqsyvrizwikoyuyi.supabase.co/functions/v1/mercadopago-webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "subscription_preapproval", "data": {"id": "fake123"}}'

# Resposta esperada: {"error": "Invalid signature"} (401)
```

### Testar Endpoints Removidos
```bash
# Deve retornar 404 (não existe mais)
curl -X POST https://zarhvqsyvrizwikoyuyi.supabase.co/functions/v1/activate-subscription

curl -X POST https://zarhvqsyvrizwikoyuyi.supabase.co/functions/v1/deactivate-subscription
```

### Testar Validação de Senha
1. Acesse `/auth`
2. Tente criar conta com senha fraca: `abc123`
3. Deve mostrar erro: "A senha deve conter pelo menos uma letra maiúscula"
4. Tente senha forte: `SenhaForte123`
5. Deve aceitar

---

## 📋 Próximos Passos Recomendados

### Opcionais (Melhorias Adicionais)
1. **Rate Limiting:** Adicionar limite de tentativas de login (previne brute force)
2. **CAPTCHA:** Após 3 tentativas falhas de login
3. **Leaked Password Protection:** Habilitar no Supabase (Settings → Auth)
4. **2FA:** Autenticação de dois fatores para admins
5. **Auditoria de Logs:** Registrar tentativas de acesso suspeitas

---

## 🔐 Configuração do Webhook no Mercado Pago

Para que a validação de assinatura funcione, configure o webhook no painel do Mercado Pago:

1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Vá em **Webhooks**
3. Configure:
   - **URL:** `https://zarhvqsyvrizwikoyuyi.supabase.co/functions/v1/mercadopago-webhook`
   - **Eventos:**
     - ✅ `subscription_preapproval`
     - ✅ `subscription_authorized_payment`
4. Salve e teste enviando uma notificação de teste

O Mercado Pago incluirá automaticamente os headers `x-signature` e `x-request-id` nas requisições.

---

## 📞 Suporte

Em caso de dúvidas sobre as correções:
- Documentação Mercado Pago Webhooks: https://www.mercadopago.com.br/developers/pt/docs/webhooks
- Documentação Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security
- Lovable Security Docs: https://docs.lovable.dev/features/security
