// CT008 - Concorrência de saída: dispara N baixas simultâneas do mesmo produto
// e verifica que o saldo nunca fica negativo nem perde atualização.
// Uso: node tests/concorrencia-baixa.mjs [email] [senha] [estoqueInicial] [requisicoes]

const API = process.env.API_URL || 'http://localhost:3001/api/v1';
const [email = 'admin@stockpro.com', password = 'Stock@2026', stockArg = '5', requestsArg = '20'] = process.argv.slice(2);
const initialStock = Number(stockArg);
const requests = Number(requestsArg);

async function call(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

const login = await call('/auth/login', { method: 'POST', body: { email, password } });
if (login.status !== 200) throw new Error(`Falha no login: ${JSON.stringify(login.data)}`);
const token = login.data.token;

const categories = await call('/categories', { token });
const categoryId = categories.data[0]?.id
  ?? (await call('/categories', { method: 'POST', token, body: { name: 'Teste de concorrência' } })).data.id;

const product = await call('/products', {
  method: 'POST',
  token,
  body: {
    name: `Produto CT008 ${Date.now()}`,
    sku: `CT008-${Date.now()}`,
    categoryId,
    salePrice: 10,
    costPrice: 5,
    currentStock: initialStock,
    minStock: 1,
  },
});
const productId = product.data.id;

console.log(`Produto ${productId} criado com estoque ${initialStock}. Disparando ${requests} saídas de 1 unidade ao mesmo tempo...`);

const results = await Promise.all(
  Array.from({ length: requests }, (_, i) => call('/movements', {
    method: 'POST',
    token,
    body: { productId, movementType: 'saida', quantity: 1, notes: `CT008 requisição ${i + 1}` },
  })),
);

const accepted = results.filter((r) => r.status === 201).length;
const rejected = results.filter((r) => r.status === 409).length;
const others = results.filter((r) => r.status !== 201 && r.status !== 409);

const finalProduct = (await call(`/products/${productId}`, { token })).data;
const movements = (await call('/movements', { token })).data.filter((m) => m.productId === productId);

console.log(`Aceitas (201): ${accepted} | Recusadas por saldo (409): ${rejected} | Outras: ${others.length}`);
console.log(`Saldo final: ${finalProduct.currentStock} | Movimentações gravadas: ${movements.length}`);

const ok = accepted === Math.min(initialStock, requests)
  && finalProduct.currentStock === initialStock - accepted
  && finalProduct.currentStock >= 0
  && movements.length === accepted
  && others.length === 0;

console.log(ok
  ? 'RESULTADO: APROVADO - saldo consistente, sem estoque negativo e sem perda de atualização.'
  : 'RESULTADO: REPROVADO - inconsistência detectada.');
process.exit(ok ? 0 : 1);
