// Popula uma empresa de demonstração pela própria API (útil antes da apresentação).
// Uso: node scripts/seed-demo.mjs   (com o backend rodando)

const API = process.env.API_URL || 'http://localhost:3001/api/v1';

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
  if (!res.ok && res.status !== 409) throw new Error(`${method} ${path} -> ${res.status} ${JSON.stringify(data)}`);
  return data;
}

const ADMIN = { name: 'Papelaria e Informática Franca', email: 'admin@stockpro.com', password: 'Stock@2026' };
const MEMBER = { name: 'Joana Estoquista', email: 'joana@stockpro.com', password: 'Estoque@2026' };

await call('/users', { method: 'POST', body: ADMIN });
const { token } = await call('/auth/login', { method: 'POST', body: { email: ADMIN.email, password: ADMIN.password } });
await call('/users/members', { method: 'POST', token, body: MEMBER });

const categories = {};
for (const [name, description] of [
  ['Informática', 'Notebooks, computadores e componentes'],
  ['Periféricos', 'Mouses, teclados, headsets e acessórios'],
  ['Papelaria', 'Cadernos, canetas e materiais escolares'],
  ['Escritório', 'Móveis e suprimentos de escritório'],
]) {
  categories[name] = (await call('/categories', { method: 'POST', token, body: { name, description } })).id;
}

const products = {};
for (const [name, sku, category, salePrice, costPrice, currentStock, minStock, description] of [
  ['Notebook Dell Inspiron 15', 'NB-DELL-15', 'Informática', 3499.9, 2800, 12, 5, 'Notebook 15,6" i5 16GB 512GB SSD'],
  ['SSD Kingston A400 480GB', 'SSD-KING-480', 'Informática', 289.9, 180, 40, 10, 'SSD SATA 480GB 2,5"'],
  ['Mouse Logitech M170', 'MOU-LOG-M170', 'Periféricos', 59.9, 32, 8, 10, 'Mouse sem fio 1000 dpi'],
  ['Teclado Mecânico Redragon K552', 'TEC-RED-K552', 'Periféricos', 219.9, 140, 25, 8, 'Teclado mecânico switch blue'],
  ['Headset HyperX Cloud Stinger', 'HEA-HX-STING', 'Periféricos', 349.9, 240, 4, 6, 'Headset gamer com microfone'],
  ['Caderno Universitário 200f', 'CAD-UNI-200', 'Papelaria', 24.9, 12, 150, 30, 'Caderno 10 matérias capa dura'],
  ['Caneta Esferográfica Azul cx/50', 'CAN-ESF-AZ', 'Papelaria', 39.9, 22, 60, 20, 'Caixa com 50 canetas azuis'],
  ['Cadeira Ergonômica Presidente', 'CAD-ERG-01', 'Escritório', 899.9, 600, 6, 3, 'Cadeira giratória com apoio lombar'],
  ['Papel A4 Chamex resma 500f', 'PAP-A4-CHX', 'Escritório', 28.9, 19, 3, 15, 'Resma 500 folhas 75 g/m²'],
]) {
  const product = await call('/products', {
    method: 'POST',
    token,
    body: { name, sku, categoryId: categories[category], salePrice, costPrice, currentStock, minStock, description },
  });
  products[sku] = product.id;
}

for (const [sku, movementType, quantity, notes] of [
  ['SSD-KING-480', 'entrada', 20, 'Reposição do fornecedor'],
  ['NB-DELL-15', 'saida', 5, 'Venda balcão - lote corporativo'],
  ['TEC-RED-K552', 'saida', 8, 'Venda e-commerce'],
  ['CAD-UNI-200', 'saida', 12, 'Venda volta às aulas'],
  ['CAN-ESF-AZ', 'entrada', 10, 'Compra de reposição'],
  ['CAD-ERG-01', 'saida', 2, 'Venda para escritório contábil'],
  ['MOU-LOG-M170', 'saida', 1, 'Venda avulsa'],
  ['HEA-HX-STING', 'saida', 1, 'Venda loja física'],
  ['NB-DELL-15', 'entrada', 5, 'Reposição de estoque'],
  ['CAD-UNI-200', 'saida', 20, 'Venda escola municipal'],
  ['SSD-KING-480', 'saida', 6, 'Venda assistência técnica'],
  ['CAN-ESF-AZ', 'saida', 15, 'Venda atacado'],
]) {
  await call('/movements', { method: 'POST', token, body: { productId: products[sku], movementType, quantity, notes } });
}

console.log('Empresa de demonstração criada.');
console.log(`  Administrador: ${ADMIN.email} / ${ADMIN.password}`);
console.log(`  Usuário da equipe: ${MEMBER.email} / ${MEMBER.password}`);
