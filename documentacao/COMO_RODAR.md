# Como rodar o StockPro (e preparar a demonstração)

## 1. Banco de dados (Docker)

```bash
docker compose up -d db
```

> Se já existir um container antigo chamado `stockpro-db` criado com `docker run`, remova-o antes com `docker rm -f stockpro-db`.

## 2. Backend

O `tg-backend/.env` precisa de `JWT_SECRET` com pelo menos 32 caracteres. Sem isso, a API não sobe. Veja `.env.example`.

```bash
cd tg-backend
npm install
npm run build
npx sequelize-cli db:migrate
npm run dev
```

A documentação da API fica em http://localhost:3001/api/v1/documentation.

## 3. Frontend

```bash
cd tg-frontend
npm install
npm run dev
```

Acesse http://localhost:8080.

## 4. Dados de demonstração (com o backend rodando, banco vazio)

```bash
node tg-backend/scripts/seed-demo.mjs
```

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | admin@stockpro.com | Stock@2026 |
| Usuário (estoquista) | joana@stockpro.com | Estoque@2026 |

> **Atenção:** a empresa de demonstração ganha 7 dias de teste grátis a partir do dia em que o script roda. Depois disso o sistema bloqueia o acesso, como deve fazer. Rode o script **no próprio dia da apresentação**.

## 5. Testes automatizados (com o backend rodando)

```bash
node tg-backend/tests/perfis-assinatura.mjs
node tg-backend/tests/concorrencia-baixa.mjs admin@stockpro.com Stock@2026 5 20
```

- `perfis-assinatura.mjs`: 15 verificações de login, perfis, equipe, regras de movimentação e assinatura. Limpa o que cria.
- `concorrencia-baixa.mjs` (CT008): dispara 20 saídas simultâneas sobre 5 unidades. Esperado: 5 aceitas, 15 recusadas e saldo final 0. Cria um "Produto CT008", que fica na lista de produtos.

## 6. No dia da apresentação (12/11)

1. Recrie o banco e os dados de demonstração, para o teste grátis valer até 19/11 e não aparecerem produtos de teste:

   ```bash
   docker exec stockpro-db psql -U postgres -c "DROP DATABASE IF EXISTS stock_pro_db WITH (FORCE)"
   docker exec stockpro-db psql -U postgres -c "CREATE DATABASE stock_pro_db"
   cd tg-backend && npx sequelize-cli db:migrate && cd ..
   node tg-backend/scripts/seed-demo.mjs
   ```

2. Rode os dois testes do passo 5 uma vez antes de abrir o estande.
3. Deixe abertos: o Dashboard do administrador numa janela e o da Joana (estoquista) em outra janela anônima, para mostrar a diferença de perfis.
4. Não dependa do Wi-Fi do evento: tudo roda localmente no notebook.

## 7. Assinatura (Mercado Pago, modo de teste)

1. Crie uma aplicação em https://www.mercadopago.com.br/developers/panel/app e gere as **credenciais de teste**.
2. Crie usuários de teste (vendedor e comprador) no painel.
3. No `tg-backend/.env`, preencha:
   - `MP_ACCESS_TOKEN=TEST-...`
   - `MP_TEST_PAYER_EMAIL=<e-mail do comprador de teste>`
   - `MP_BACK_URL=<URL pública>/assinatura`
4. O Mercado Pago pode recusar `localhost` como `back_url`. Nesse caso, use o domínio publicado ou um túnel (ngrok, por exemplo).
5. Para receber webhooks, cadastre `<URL pública>/api/v1/billing/webhook` no painel, com o tópico de assinaturas. Sem webhook, o botão "Verificar pagamento" consulta o status direto na API.
