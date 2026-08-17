/**
 * Portal Q — teste dos endpoints do Apps Script.
 *
 * Uso:
 *   npm run test:endpoint          -> testes de leitura (não escreve nada)
 *   npm run test:endpoint -- --write -> ciclo completo de escrita (cria, edita,
 *                                       reordena e apaga um app de teste)
 *
 * Lê PORTAL_Q_SHEETS_ENDPOINT e PORTAL_Q_SHEETS_TOKEN de .env.local.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnvLocal() {
  let raw;
  try {
    raw = readFileSync(resolve(root, '.env.local'), 'utf8');
  } catch {
    fail('Arquivo .env.local não encontrado. Copie .env.example e preencha os valores.');
  }
  for (const line of raw.split(/\r?\n/)) {
    const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    const value = match[2].trim().replace(/^["']|["']$/g, '');
    if (!process.env[match[1]]) process.env[match[1]] = value;
  }
}

function fail(message) {
  console.error(`\n  FALHOU: ${message}\n`);
  process.exit(1);
}

let passed = 0;
function ok(label, extra = '') {
  passed += 1;
  console.log(`  ok   ${label}${extra ? ` — ${extra}` : ''}`);
}

async function call(action, payload = {}) {
  const response = await fetch(process.env.PORTAL_Q_SHEETS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ token: process.env.PORTAL_Q_SHEETS_TOKEN, action, payload }),
    redirect: 'follow',
  });

  const text = await response.text();
  if (text.trimStart().startsWith('<')) {
    fail(
      `${action}: a resposta veio em HTML, não JSON.\n` +
        '  Causa provável: a implantação não está com acesso "Qualquer pessoa",\n' +
        '  ou a URL não é a de /exec. Primeiros 200 caracteres:\n  ' +
        text.slice(0, 200).replace(/\s+/g, ' ')
    );
  }

  let body;
  try {
    body = JSON.parse(text);
  } catch {
    fail(`${action}: resposta não é JSON: ${text.slice(0, 200)}`);
  }
  return body;
}

async function expectOk(action, payload) {
  const body = await call(action, payload);
  if (!body.ok) fail(`${action}: ${body.error}`);
  return body.data;
}

async function expectError(label, action, payload, tokenOverride) {
  const response = await fetch(process.env.PORTAL_Q_SHEETS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      token: tokenOverride === undefined ? process.env.PORTAL_Q_SHEETS_TOKEN : tokenOverride,
      action,
      payload,
    }),
    redirect: 'follow',
  });
  const body = JSON.parse(await response.text());
  if (body.ok) fail(`${label}: era esperado um erro, mas a chamada foi aceita`);
  ok(label, body.error);
}

async function main() {
  loadEnvLocal();

  const { PORTAL_Q_SHEETS_ENDPOINT: endpoint, PORTAL_Q_SHEETS_TOKEN: token } = process.env;
  if (!endpoint) fail('PORTAL_Q_SHEETS_ENDPOINT não definido em .env.local');
  if (!token) fail('PORTAL_Q_SHEETS_TOKEN não definido em .env.local');
  if (!endpoint.endsWith('/exec')) {
    fail(`A URL deve terminar em /exec (recebido: ${endpoint})`);
  }

  const write = process.argv.includes('--write');
  console.log(`\nEndpoint: ${endpoint}`);
  console.log(`Modo: ${write ? 'leitura + escrita' : 'somente leitura'}\n`);

  // --- Leitura e segurança -------------------------------------------------
  const healthResponse = await fetch(`${endpoint}?action=health`, { redirect: 'follow' });
  const health = JSON.parse(await healthResponse.text());
  if (!health.ok) fail(`GET ?action=health: ${health.error}`);
  ok('GET health (sem token)', `versão ${health.data.version}`);

  const list = await expectOk('listApps');
  if (!Array.isArray(list.apps)) fail('listApps não retornou um array');
  ok('POST listApps', `${list.apps.length} app(s)`);

  await expectError('POST com token errado é recusado', 'listApps', {}, 'token-invalido');
  await expectError('POST sem token é recusado', 'listApps', {}, null);
  await expectError('ação inexistente é recusada', 'acaoQueNaoExiste', {});

  if (!write) {
    console.log(`\n${passed} verificações ok. Rode com --write para testar escrita.\n`);
    return;
  }

  // --- Escrita -------------------------------------------------------------
  await expectError('URL javascript: é bloqueada', 'createApp', {
    name: 'XSS',
    url: 'javascript:alert(1)',
  });
  await expectError('app sem nome é recusado', 'createApp', { url: 'https://exemplo.com' });
  await expectError('ícone com formato inválido é recusado', 'createApp', {
    name: 'Ícone ruim',
    url: 'https://exemplo.com',
    icon: '../../etc/passwd',
  });

  const created = await expectOk('createApp', {
    name: '[TESTE] Portal Q',
    url: 'https://exemplo.com/teste',
    icon: 'flask-conical',
    description_pt: 'Registro temporário de teste',
    description_en: 'Temporary test record',
  });
  ok('POST createApp', `id ${created.app.id}, ordem ${created.app.order}`);

  const updated = await expectOk('updateApp', {
    id: created.app.id,
    name: '[TESTE] Portal Q (editado)',
    icon: 'wrench',
  });
  if (updated.app.name !== '[TESTE] Portal Q (editado)') fail('updateApp não alterou o nome');
  if (updated.app.url !== created.app.url) fail('updateApp apagou um campo não enviado');
  ok('POST updateApp', 'campos não enviados foram preservados');

  const all = await expectOk('listApps', { includeInactive: true });
  const ids = all.apps.map((app) => app.id);
  const reordered = await expectOk('reorderApps', { ids: [created.app.id, ...ids.filter((id) => id !== created.app.id)] });
  if (reordered.apps[0].id !== created.app.id) fail('reorderApps não colocou o app na primeira posição');
  ok('POST reorderApps', 'app de teste foi para a posição 1');

  await expectOk('setConfig', { key: 'test_key', value: 'valor-temporario' });
  const config = await expectOk('getConfig', { key: 'test_key' });
  if (config.value !== 'valor-temporario') fail('getConfig não devolveu o valor gravado');
  ok('POST setConfig + getConfig');
  await expectOk('setConfig', { key: 'test_key', value: '' });

  await expectOk('deleteApp', { id: created.app.id });
  const afterDelete = await expectOk('listApps', { includeInactive: true });
  if (afterDelete.apps.some((app) => app.id === created.app.id)) {
    fail('deleteApp não removeu o registro');
  }
  ok('POST deleteApp', 'planilha ficou limpa');

  // Restaura a ordem original dos apps que já existiam.
  const original = ids.filter((id) => id !== created.app.id);
  if (original.length > 0) {
    await expectOk('reorderApps', { ids: original });
    ok('ordem original restaurada');
  }

  console.log(`\n${passed} verificações ok.\n`);
}

main().catch((error) => fail(error.stack || String(error)));
