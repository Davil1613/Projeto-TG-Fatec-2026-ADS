// Popula uma empresa de demonstração pela própria API (útil antes da apresentação).
// Uso: node scripts/seed-demo.mjs   (com o backend rodando e o banco vazio)
// Depois de criar, distribui as datas das movimentações pelos últimos 60 dias
// direto no banco (container Docker), para os filtros de período terem o que mostrar.

import { execFileSync } from 'node:child_process';

const API = process.env.API_URL || 'http://localhost:3001/api/v1';
const DB_CONTAINER = process.env.DB_CONTAINER || 'stockpro-db';
const DB_NAME = process.env.DB_NAME || 'stock_pro_db';

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

const login = async ({ email, password }) => (await call('/auth/login', { method: 'POST', body: { email, password } })).token;

const ADMIN = { name: 'Papelaria e Informática Franca', email: 'admin@stockpro.com', password: 'Stock@2026' };
const MEMBER = { name: 'Joana Estoquista', email: 'joana@stockpro.com', password: 'Estoque@2026' };

const CATEGORIES = [
  ['Informática', 'Notebooks, computadores e componentes'],
  ['Periféricos', 'Mouses, teclados, headsets e acessórios'],
  ['Papelaria', 'Cadernos, canetas e materiais escolares'],
  ['Escritório', 'Móveis e suprimentos de escritório'],
];

// finalStock = saldo que o produto deve ter hoje, depois de todo o histórico abaixo.
const PRODUCTS = [
  ['Notebook Dell Inspiron 15', 'NB-DELL-15', 'Informática', 3499.9, 2800, 12, 5, 'Notebook 15,6" i5 16GB 512GB SSD'],
  ['Monitor LG 24" Full HD', 'MON-LG-24', 'Informática', 799.9, 560, 9, 4, 'Monitor IPS 24" 75 Hz HDMI'],
  ['SSD Kingston A400 480GB', 'SSD-KING-480', 'Informática', 289.9, 180, 54, 10, 'SSD SATA 480GB 2,5"'],
  ['Pen Drive SanDisk 64GB', 'PEN-SAN-64', 'Informática', 49.9, 26, 38, 15, 'Pen drive USB 3.0 64GB'],
  ['Mouse Logitech M170', 'MOU-LOG-M170', 'Periféricos', 59.9, 32, 7, 10, 'Mouse sem fio 1000 dpi'],
  ['Teclado Mecânico Redragon K552', 'TEC-RED-K552', 'Periféricos', 219.9, 140, 17, 8, 'Teclado mecânico switch blue'],
  ['Headset HyperX Cloud Stinger', 'HEA-HX-STING', 'Periféricos', 349.9, 240, 3, 6, 'Headset gamer com microfone'],
  ['Caderno Universitário 200f', 'CAD-UNI-200', 'Papelaria', 24.9, 12, 118, 30, 'Caderno 10 matérias capa dura'],
  ['Caneta Esferográfica Azul cx/50', 'CAN-ESF-AZ', 'Papelaria', 39.9, 22, 55, 20, 'Caixa com 50 canetas azuis'],
  ['Cadeira Ergonômica Presidente', 'CAD-ERG-01', 'Escritório', 899.9, 600, 4, 3, 'Cadeira giratória com apoio lombar'],
  ['Papel A4 Chamex resma 500f', 'PAP-A4-CHX', 'Escritório', 28.9, 19, 3, 15, 'Resma 500 folhas 75 g/m²'],
  ['Toner HP 85A Compatível', 'TON-HP-85A', 'Escritório', 89.9, 45, 0, 4, 'Toner para LaserJet P1102/M1132'],
];

// [diasAtrás, hora, sku, tipo, quantidade, observação, quem lançou]
const HISTORY = [
  [58, 9, 'SSD-KING-480', 'entrada', 30, 'Compra Kingston - NF 1182', 'admin'],
  [57, 10, 'CAD-UNI-200', 'entrada', 100, 'Compra para volta às aulas - NF 1190', 'admin'],
  [55, 14, 'TON-HP-85A', 'entrada', 6, 'Compra fornecedor regional', 'admin'],
  [53, 11, 'NB-DELL-15', 'saida', 3, 'Venda para escritório de contabilidade', 'admin'],
  [50, 16, 'CAD-UNI-200', 'saida', 35, 'Venda escola estadual', 'joana'],
  [48, 9, 'PAP-A4-CHX', 'entrada', 20, 'Compra Chamex - NF 1235', 'admin'],
  [46, 15, 'TON-HP-85A', 'saida', 2, 'Venda balcão', 'joana'],
  [44, 10, 'SSD-KING-480', 'saida', 8, 'Venda assistência técnica', 'joana'],
  [41, 13, 'MON-LG-24', 'entrada', 6, 'Compra LG - NF 1301', 'admin'],
  [39, 17, 'CAN-ESF-AZ', 'saida', 10, 'Venda atacado', 'joana'],
  [37, 11, 'PEN-SAN-64', 'entrada', 40, 'Compra SanDisk - NF 1322', 'admin'],
  [35, 14, 'PAP-A4-CHX', 'saida', 12, 'Venda prefeitura', 'admin'],
  [33, 9, 'TEC-RED-K552', 'saida', 4, 'Venda e-commerce', 'joana'],
  [31, 16, 'TON-HP-85A', 'saida', 2, 'Venda escritório de advocacia', 'joana'],
  [29, 10, 'NB-DELL-15', 'entrada', 5, 'Reposição Dell - NF 1377', 'admin'],
  [27, 15, 'HEA-HX-STING', 'saida', 2, 'Venda loja física', 'joana'],
  [25, 11, 'CAD-UNI-200', 'saida', 22, 'Venda papelaria parceira', 'joana'],
  [23, 13, 'PEN-SAN-64', 'saida', 12, 'Venda evento universitário', 'joana'],
  [21, 9, 'MOU-LOG-M170', 'saida', 4, 'Venda balcão', 'joana'],
  [19, 14, 'SSD-KING-480', 'entrada', 20, 'Reposição Kingston - NF 1420', 'admin'],
  [17, 10, 'CAD-ERG-01', 'saida', 2, 'Venda escritório contábil', 'admin'],
  [15, 16, 'TON-HP-85A', 'saida', 2, 'Venda balcão', 'joana'],
  [13, 11, 'CAN-ESF-AZ', 'entrada', 15, 'Compra BIC - NF 1466', 'admin'],
  [12, 15, 'PAP-A4-CHX', 'saida', 10, 'Venda clínica odontológica', 'joana'],
  [10, 9, 'MON-LG-24', 'saida', 3, 'Venda home office', 'joana'],
  [9, 14, 'TEC-RED-K552', 'saida', 4, 'Venda e-commerce', 'joana'],
  [8, 10, 'PEN-SAN-64', 'entrada', 20, 'Reposição SanDisk - NF 1490', 'admin'],
  [7, 13, 'NB-DELL-15', 'saida', 2, 'Venda pessoa física', 'admin'],
  [6, 11, 'SSD-KING-480', 'saida', 6, 'Venda assistência técnica', 'joana'],
  [5, 16, 'CAD-UNI-200', 'saida', 15, 'Venda balcão', 'joana'],
  [4, 9, 'HEA-HX-STING', 'saida', 1, 'Venda loja física', 'joana'],
  [4, 15, 'PEN-SAN-64', 'saida', 10, 'Venda empresa de TI', 'joana'],
  [3, 10, 'MOU-LOG-M170', 'saida', 3, 'Venda balcão', 'joana'],
  [3, 14, 'CAN-ESF-AZ', 'saida', 8, 'Venda escola municipal', 'joana'],
  [2, 11, 'PAP-A4-CHX', 'saida', 5, 'Venda escritório', 'joana'],
  [2, 16, 'CAD-UNI-200', 'entrada', 10, 'Devolução de cliente', 'admin'],
  [1, 10, 'SSD-KING-480', 'saida', 2, 'Venda balcão', 'joana'],
  [1, 15, 'TEC-RED-K552', 'entrada', 4, 'Reposição Redragon - NF 1533', 'admin'],
];

function openingStock(sku, finalStock) {
  const moves = HISTORY.filter((h) => h[2] === sku);
  const net = moves.reduce((sum, [, , , type, qty]) => sum + (type === 'entrada' ? qty : -qty), 0);
  const opening = finalStock - net;
  let running = opening;
  for (const [, , , type, qty] of moves) {
    running += type === 'entrada' ? qty : -qty;
    if (running < 0) throw new Error(`Histórico deixa ${sku} negativo; ajuste HISTORY.`);
  }
  if (opening < 0) throw new Error(`Saldo inicial negativo para ${sku}; ajuste HISTORY.`);
  return opening;
}

await call('/users', { method: 'POST', body: ADMIN });
const tokens = { admin: await login(ADMIN) };
await call('/users/members', { method: 'POST', token: tokens.admin, body: MEMBER });
tokens.joana = await login(MEMBER);

const categories = {};
for (const [name, description] of CATEGORIES) {
  categories[name] = (await call('/categories', { method: 'POST', token: tokens.admin, body: { name, description } })).id;
}

const products = {};
for (const [name, sku, category, salePrice, costPrice, finalStock, minStock, description] of PRODUCTS) {
  const product = await call('/products', {
    method: 'POST',
    token: tokens.admin,
    body: {
      name, sku, categoryId: categories[category], salePrice, costPrice,
      currentStock: openingStock(sku, finalStock), minStock, description,
    },
  });
  products[sku] = product.id;
}

const dated = [];
for (const [daysAgo, hour, sku, movementType, quantity, notes, actor] of HISTORY) {
  const movement = await call('/movements', {
    method: 'POST',
    token: tokens[actor],
    body: { productId: products[sku], movementType, quantity, notes },
  });
  dated.push([movement.id, daysAgo, hour]);
}

const at = (daysAgo, hour) => `(date_trunc('day', now() AT TIME ZONE 'America/Sao_Paulo') - interval '${daysAgo} days' + interval '${hour} hours') AT TIME ZONE 'America/Sao_Paulo'`;
const sql = [
  ...dated.map(([id, daysAgo, hour]) => `UPDATE stock_movements SET created_at = ${at(daysAgo, hour)}, updated_at = ${at(daysAgo, hour)} WHERE id = ${id};`),
  ...dated.map(([id, daysAgo, hour]) => `UPDATE audit_logs SET created_at = ${at(daysAgo, hour)}, updated_at = ${at(daysAgo, hour)} WHERE entity = 'movement' AND entity_id = ${id};`),
  `UPDATE audit_logs SET created_at = ${at(60, 8)}, updated_at = ${at(60, 8)} WHERE entity IN ('category', 'product', 'user');`,
  `UPDATE categories SET created_at = ${at(60, 8)}, updated_at = ${at(60, 8)};`,
  `UPDATE products SET created_at = ${at(60, 8)};`,
].join('\n');

try {
  execFileSync('docker', ['exec', '-i', DB_CONTAINER, 'psql', '-U', 'postgres', '-d', DB_NAME, '-v', 'ON_ERROR_STOP=1', '-q'], { input: sql, stdio: ['pipe', 'ignore', 'inherit'] });
  console.log(`Histórico de ${dated.length} movimentações distribuído pelos últimos 60 dias.`);
} catch {
  console.log(`Aviso: não consegui ajustar as datas no container "${DB_CONTAINER}". As movimentações ficaram com a data de hoje.`);
}

console.log('Empresa de demonstração criada.');
console.log(`  Administrador: ${ADMIN.email} / ${ADMIN.password}`);
console.log(`  Usuário da equipe: ${MEMBER.email} / ${MEMBER.password}`);
