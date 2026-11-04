// Perfis de acesso, equipe, regras de movimentação e assinatura (CT001-CT013).
// Uso: node tests/perfis-assinatura.mjs [emailAdmin] [senhaAdmin]   (com a API rodando)

const API = process.env.API_URL || 'http://localhost:3001/api/v1';
const [adminEmail = 'admin@stockpro.com', adminPassword = 'Stock@2026'] = process.argv.slice(2);

async function call(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

const results = [];
function check(id, name, ok, detail = '') {
  results.push(ok);
  console.log(`${ok ? 'OK    ' : 'FALHOU'} ${id} ${name}${detail ? ` (${detail})` : ''}`);
}

const login = await call('/auth/login', { method: 'POST', body: { email: adminEmail, password: adminPassword } });
check('CT001', 'login com credenciais válidas', login.status === 200, `${login.status}`);
const admin = login.data?.token;
if (!admin) process.exit(1);

const wrong = await call('/auth/login', { method: 'POST', body: { email: adminEmail, password: 'Errada@123' } });
check('CT002', 'login com senha incorreta é recusado', wrong.status === 401, `${wrong.status}`);
const noToken = await call('/products');
const forged = await call('/products', { token: 'abc.def.ghi' });
check('CT003', 'requisição sem token ou com token inválido é recusada', noToken.status === 401 && forged.status === 401);

const email = `estoquista.teste.${Date.now()}@stockpro.com`;
const member = await call('/users/members', { method: 'POST', token: admin, body: { name: 'Usuário de Teste', email, password: 'Estoque@2026' } });
check('CT013', 'administrador cria usuário da equipe com perfil user', member.status === 201 && member.data?.role === 'user', `${member.status}`);
const weak = await call('/users/members', { method: 'POST', token: admin, body: { name: 'X', email: `x${Date.now()}@a.com`, password: '123' } });
const dup = await call('/users/members', { method: 'POST', token: admin, body: { name: 'Dup', email, password: 'Estoque@2026' } });
check('CT013', 'senha fraca (400) e e-mail duplicado (409) são recusados', weak.status === 400 && dup.status === 409, `${weak.status}/${dup.status}`);

const user = (await call('/auth/login', { method: 'POST', body: { email, password: 'Estoque@2026' } })).data?.token;
const adminProducts = await call('/products', { token: admin });
const userProducts = await call('/products', { token: user });
check('CT010', 'administrador recebe preço de custo; usuário não', 'costPrice' in adminProducts.data[0] && !('costPrice' in userProducts.data[0]));

const denied = await Promise.all([
  call('/products', { method: 'POST', token: user, body: { name: 'x', sku: 'x', categoryId: 1 } }),
  call('/categories', { method: 'POST', token: user, body: { name: 'x' } }),
  call('/audit-logs', { token: user }),
  call('/users', { token: user }),
  call('/billing/checkout', { method: 'POST', token: user }),
]);
check('CT009', 'usuário não cadastra produto/categoria nem acessa auditoria, equipe e assinatura', denied.every((r) => r.status === 403), denied.map((r) => r.status).join('/'));

const category = (await call('/categories', { method: 'POST', token: admin, body: { name: `Teste ${Date.now()}` } })).data;
const product = (await call('/products', {
  method: 'POST', token: admin,
  body: { name: 'Produto de teste', sku: `TESTE-${Date.now()}`, categoryId: category.id, salePrice: 10, costPrice: 5, currentStock: 3, minStock: 1 },
})).data;
check('CT004', 'cadastro de categoria e produto', !!product?.id);

const entry = await call('/movements', { method: 'POST', token: user, body: { productId: product.id, movementType: 'entrada', quantity: 2, notes: 'teste' } });
const exit = await call('/movements', { method: 'POST', token: user, body: { productId: product.id, movementType: 'saida', quantity: 1, notes: 'teste' } });
const after = (await call(`/products/${product.id}`, { token: admin })).data;
check('CT005', 'usuário registra entrada e saída; saldo atualizado', entry.status === 201 && exit.status === 201 && after.currentStock === 4, `saldo ${after.currentStock}`);

const tooMuch = await call('/movements', { method: 'POST', token: user, body: { productId: product.id, movementType: 'saida', quantity: 999 } });
check('CT006', 'saída maior que o saldo é recusada com o saldo disponível', tooMuch.status === 409, tooMuch.data?.error?.message);
const zero = await call('/movements', { method: 'POST', token: user, body: { productId: product.id, movementType: 'saida', quantity: 0 } });
const missing = await call('/movements', { method: 'POST', token: user, body: { productId: 999999, movementType: 'entrada', quantity: 1 } });
check('CT007', 'quantidade zero (400) e produto inexistente (404)', zero.status === 400 && missing.status === 404, `${zero.status}/${missing.status}`);
const del = await call(`/movements/${exit.data.id}`, { method: 'DELETE', token: admin });
check('RN007', 'movimentação confirmada não pode ser excluída', del.status === 404, `${del.status}`);

const owner = (await call('/users', { token: admin })).data.find((u) => u.role === 'admin');
const delOwner = await call(`/users/${owner.id}`, { method: 'DELETE', token: admin });
check('CT012', 'administrador responsável não pode ser excluído', delOwner.status === 409, `${delOwner.status}`);

const billing = await call('/billing/status', { token: admin });
check('CT011', 'situação da assinatura disponível', billing.status === 200 && typeof billing.data?.hasAccess === 'boolean', billing.data?.subscriptionStatus);

await call(`/products/${product.id}`, { method: 'DELETE', token: admin });
await call(`/categories/${category.id}`, { method: 'DELETE', token: admin });
const removed = await call(`/users/${member.data.id}`, { method: 'DELETE', token: admin });
check('CT013', 'administrador remove usuário da equipe', removed.status === 204, `${removed.status}`);

const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} verificações aprovadas`);
process.exit(passed === results.length ? 0 : 1);
