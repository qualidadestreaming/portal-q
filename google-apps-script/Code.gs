/**
 * Portal Q — backend de dados (Google Apps Script)
 *
 * Este script é "bound" (vinculado) à planilha do Portal Q e publicado como
 * Web App. Ele é a ÚNICA porta de entrada para ler e escrever na planilha.
 *
 * SEGURANÇA
 * - O Web App é publicado com acesso "Qualquer pessoa", porque o servidor do
 *   Next.js precisa chamá-lo sem login Google. Por isso, TODA operação exige um
 *   token compartilhado enviado no corpo do POST.
 * - O token NÃO fica neste arquivo. Ele é lido das Propriedades do Script
 *   (Configurações do projeto > Propriedades do script > PORTAL_Q_TOKEN).
 * - O token só existe no servidor (Apps Script + variável de ambiente na
 *   Vercel). Nunca vai para o navegador do usuário.
 * - O token vai no CORPO do POST, não em cabeçalho: o Apps Script responde com
 *   um redirect e cabeçalhos de autorização são descartados no caminho.
 *
 * OBSERVAÇÃO SOBRE STATUS HTTP
 * O ContentService do Apps Script sempre responde HTTP 200. Erros são
 * sinalizados no corpo: { ok: false, error: "..." }. Quem consome deve checar
 * o campo `ok`, não o status HTTP.
 */

const API_VERSION = '1.0.0';

const SHEET_APPS = 'apps';
const SHEET_CONFIG = 'config';

const APPS_HEADERS = [
  'id',
  'name',
  'url',
  'icon',
  'description_pt',
  'description_en',
  'category',
  'order',
  'active',
  'updated_at',
];

const CONFIG_HEADERS = ['key', 'value'];

const LIMITS = {
  name: 60,
  url: 500,
  icon: 40,
  description: 120,
  category: 40,
};

/* ------------------------------------------------------------------ *
 * Setup — rodar UMA VEZ pelo editor do Apps Script
 * ------------------------------------------------------------------ */

/**
 * Cria as abas `apps` e `config` com os cabeçalhos corretos, caso não existam.
 * Não apaga nem sobrescreve dados já existentes.
 */
function setup() {
  const ss = SpreadsheetApp.getActive();

  const apps = ensureSheet_(ss, SHEET_APPS, APPS_HEADERS);
  // updated_at como texto puro, para o Sheets não converter a string ISO em data.
  apps.getRange(1, APPS_HEADERS.indexOf('updated_at') + 1, apps.getMaxRows(), 1)
    .setNumberFormat('@');

  const config = ensureSheet_(ss, SHEET_CONFIG, CONFIG_HEADERS);
  config.getRange(1, 1, config.getMaxRows(), 2).setNumberFormat('@');

  seedConfigKey_(config, 'admin_password_hash', '');
  seedConfigKey_(config, 'schema_version', API_VERSION);

  // Remove a aba padrão vazia, se ainda existir.
  const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('Página1');
  if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() === 0) {
    ss.deleteSheet(defaultSheet);
  }

  Logger.log('Setup concluído. Abas: %s', ss.getSheets().map(function (s) {
    return s.getName();
  }).join(', '));
}

function ensureSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const isEmpty = firstRow.join('') === '';
  if (isEmpty) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function seedConfigKey_(configSheet, key, value) {
  if (findConfigRow_(configSheet, key) === -1) {
    configSheet.appendRow([key, value]);
  }
}

/* ------------------------------------------------------------------ *
 * Roteamento HTTP
 * ------------------------------------------------------------------ */

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || '';
  if (action === 'health') {
    return json_({ ok: true, data: { service: 'portal-q', version: API_VERSION } });
  }
  return json_({
    ok: false,
    error: 'Este endpoint usa POST com { token, action, payload }. Teste de vida: ?action=health',
  });
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json_({ ok: false, error: 'Corpo da requisição não é JSON válido' });
  }

  try {
    if (!verifyToken_(body.token)) {
      return json_({ ok: false, error: 'Não autorizado' });
    }
  } catch (err) {
    // Token não configurado no script: erro de instalação, não de quem chamou.
    return json_({ ok: false, error: String((err && err.message) || err) });
  }

  const action = String(body.action || '');
  const payload = body.payload || {};

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) {
    return json_({ ok: false, error: 'Planilha ocupada, tente novamente' });
  }

  try {
    return json_(dispatch_(action, payload));
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  } finally {
    lock.releaseLock();
  }
}

function dispatch_(action, payload) {
  switch (action) {
    case 'health':
      return { ok: true, data: { service: 'portal-q', version: API_VERSION } };
    case 'listApps':
      return { ok: true, data: { apps: listApps_(payload) } };
    case 'createApp':
      return { ok: true, data: { app: createApp_(payload) } };
    case 'updateApp':
      return { ok: true, data: { app: updateApp_(payload) } };
    case 'deleteApp':
      return { ok: true, data: { id: deleteApp_(payload) } };
    case 'reorderApps':
      return { ok: true, data: { apps: reorderApps_(payload) } };
    case 'getConfig':
      return { ok: true, data: { value: getConfig_(payload) } };
    case 'setConfig':
      return { ok: true, data: { key: setConfig_(payload) } };
    default:
      return { ok: false, error: 'Ação desconhecida: ' + action };
  }
}

/* ------------------------------------------------------------------ *
 * Ações — aplicativos
 * ------------------------------------------------------------------ */

function listApps_(payload) {
  const includeInactive = payload && payload.includeInactive === true;
  const rows = readAppRows_();

  return rows
    .filter(function (row) {
      return includeInactive || row.active;
    })
    .sort(function (a, b) {
      return a.order - b.order;
    })
    .map(function (row) {
      const app = {};
      APPS_HEADERS.forEach(function (header) {
        app[header] = row[header];
      });
      return app; // sem o campo interno _row
    });
}

function createApp_(payload) {
  const sheet = getSheet_(SHEET_APPS);
  const app = {
    id: Utilities.getUuid(),
    name: requireText_(payload.name, 'name', LIMITS.name),
    url: requireUrl_(payload.url),
    icon: normalizeIcon_(payload.icon),
    description_pt: optionalText_(payload.description_pt, 'description_pt', LIMITS.description),
    description_en: optionalText_(payload.description_en, 'description_en', LIMITS.description),
    category: optionalText_(payload.category, 'category', LIMITS.category),
    order: nextOrder_(),
    active: payload.active === undefined ? true : Boolean(payload.active),
    updated_at: new Date().toISOString(),
  };

  sheet.appendRow(APPS_HEADERS.map(function (header) {
    return app[header];
  }));

  return app;
}

function updateApp_(payload) {
  const id = requireText_(payload.id, 'id', 60);
  const sheet = getSheet_(SHEET_APPS);
  const rowIndex = findAppRow_(sheet, id);
  if (rowIndex === -1) {
    throw new Error('Aplicativo não encontrado: ' + id);
  }

  const current = rowToApp_(sheet.getRange(rowIndex, 1, 1, APPS_HEADERS.length).getValues()[0]);
  const updated = {
    id: current.id,
    name: payload.name === undefined
      ? current.name
      : requireText_(payload.name, 'name', LIMITS.name),
    url: payload.url === undefined ? current.url : requireUrl_(payload.url),
    icon: payload.icon === undefined ? current.icon : normalizeIcon_(payload.icon),
    description_pt: payload.description_pt === undefined
      ? current.description_pt
      : optionalText_(payload.description_pt, 'description_pt', LIMITS.description),
    description_en: payload.description_en === undefined
      ? current.description_en
      : optionalText_(payload.description_en, 'description_en', LIMITS.description),
    category: payload.category === undefined
      ? current.category
      : optionalText_(payload.category, 'category', LIMITS.category),
    order: payload.order === undefined ? current.order : requireNumber_(payload.order, 'order'),
    active: payload.active === undefined ? current.active : Boolean(payload.active),
    updated_at: new Date().toISOString(),
  };

  sheet.getRange(rowIndex, 1, 1, APPS_HEADERS.length).setValues([
    APPS_HEADERS.map(function (header) {
      return updated[header];
    }),
  ]);

  return updated;
}

function deleteApp_(payload) {
  const id = requireText_(payload.id, 'id', 60);
  const sheet = getSheet_(SHEET_APPS);
  const rowIndex = findAppRow_(sheet, id);
  if (rowIndex === -1) {
    throw new Error('Aplicativo não encontrado: ' + id);
  }
  sheet.deleteRow(rowIndex);
  return id;
}

/**
 * Redefine a ordem de exibição. Recebe { ids: [...] } na ordem desejada;
 * a posição no array vira o valor da coluna `order` (base 1).
 * Ids não citados mantêm sua ordem relativa, depois dos citados.
 */
function reorderApps_(payload) {
  const ids = payload && payload.ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error('reorderApps exige { ids: [...] }');
  }

  const sheet = getSheet_(SHEET_APPS);
  const rows = readAppRows_();
  const known = {};
  rows.forEach(function (row) {
    known[row.id] = true;
  });

  ids.forEach(function (id) {
    if (!known[id]) {
      throw new Error('Aplicativo não encontrado: ' + id);
    }
  });

  const position = {};
  ids.forEach(function (id, index) {
    position[id] = index + 1;
  });

  let tail = ids.length;
  rows
    .slice()
    .sort(function (a, b) {
      return a.order - b.order;
    })
    .forEach(function (row) {
      if (position[row.id] === undefined) {
        tail += 1;
        position[row.id] = tail;
      }
    });

  const orderColumn = APPS_HEADERS.indexOf('order') + 1;
  const stampColumn = APPS_HEADERS.indexOf('updated_at') + 1;
  const now = new Date().toISOString();

  rows.forEach(function (row) {
    sheet.getRange(row._row, orderColumn).setValue(position[row.id]);
    sheet.getRange(row._row, stampColumn).setValue(now);
  });

  return listApps_({ includeInactive: true });
}

/* ------------------------------------------------------------------ *
 * Ações — configuração
 * ------------------------------------------------------------------ */

function getConfig_(payload) {
  const key = requireText_(payload.key, 'key', 60);
  const sheet = getSheet_(SHEET_CONFIG);
  const rowIndex = findConfigRow_(sheet, key);
  if (rowIndex === -1) {
    return '';
  }
  return String(sheet.getRange(rowIndex, 2).getValue() || '');
}

function setConfig_(payload) {
  const key = requireText_(payload.key, 'key', 60);
  const value = payload.value === undefined ? '' : String(payload.value);
  const sheet = getSheet_(SHEET_CONFIG);
  const rowIndex = findConfigRow_(sheet, key);
  if (rowIndex === -1) {
    sheet.appendRow([key, value]);
  } else {
    sheet.getRange(rowIndex, 2).setValue(value);
  }
  return key;
}

/* ------------------------------------------------------------------ *
 * Leitura da planilha
 * ------------------------------------------------------------------ */

function getSheet_(name) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(name);
  if (!sheet) {
    throw new Error('Aba "' + name + '" não encontrada. Rode a função setup() uma vez.');
  }
  return sheet;
}

function readAppRows_() {
  const sheet = getSheet_(SHEET_APPS);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }
  const values = sheet.getRange(2, 1, lastRow - 1, APPS_HEADERS.length).getValues();
  const apps = [];
  values.forEach(function (row, index) {
    if (String(row[0] || '') === '') {
      return; // linha vazia
    }
    const app = rowToApp_(row);
    app._row = index + 2;
    apps.push(app);
  });
  return apps;
}

function rowToApp_(row) {
  const app = {};
  APPS_HEADERS.forEach(function (header, index) {
    app[header] = row[index];
  });
  app.id = String(app.id || '');
  app.name = String(app.name || '');
  app.url = String(app.url || '');
  app.icon = String(app.icon || '');
  app.description_pt = String(app.description_pt || '');
  app.description_en = String(app.description_en || '');
  app.category = String(app.category || '');
  app.order = Number(app.order) || 0;
  app.active = app.active === true || String(app.active).toUpperCase() === 'TRUE';
  app.updated_at = String(app.updated_at || '');
  return app;
}

function findAppRow_(sheet, id) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return -1;
  }
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i += 1) {
    if (String(ids[i][0]) === id) {
      return i + 2;
    }
  }
  return -1;
}

function findConfigRow_(sheet, key) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return -1;
  }
  const keys = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < keys.length; i += 1) {
    if (String(keys[i][0]) === key) {
      return i + 2;
    }
  }
  return -1;
}

function nextOrder_() {
  const rows = readAppRows_();
  let max = 0;
  rows.forEach(function (row) {
    if (row.order > max) {
      max = row.order;
    }
  });
  return max + 1;
}

/* ------------------------------------------------------------------ *
 * Validação
 * ------------------------------------------------------------------ */

function verifyToken_(token) {
  const expected = PropertiesService.getScriptProperties().getProperty('PORTAL_Q_TOKEN');
  if (!expected) {
    throw new Error('PORTAL_Q_TOKEN não configurado nas Propriedades do script');
  }
  return typeof token === 'string' && token.length === expected.length && token === expected;
}

function requireText_(value, field, maxLength) {
  const text = String(value === undefined || value === null ? '' : value).trim();
  if (text === '') {
    throw new Error('Campo obrigatório: ' + field);
  }
  if (text.length > maxLength) {
    throw new Error('Campo ' + field + ' excede ' + maxLength + ' caracteres');
  }
  return text;
}

function optionalText_(value, field, maxLength) {
  const text = String(value === undefined || value === null ? '' : value).trim();
  if (text.length > maxLength) {
    throw new Error('Campo ' + field + ' excede ' + maxLength + ' caracteres');
  }
  return text;
}

function requireNumber_(value, field) {
  const num = Number(value);
  if (!isFinite(num)) {
    throw new Error('Campo ' + field + ' deve ser numérico');
  }
  return num;
}

/**
 * Só aceita http/https. Bloqueia javascript:, data:, vbscript: — que virariam
 * execução de código no navegador quando o link fosse renderizado no cartão.
 */
function requireUrl_(value) {
  const url = requireText_(value, 'url', LIMITS.url);
  if (!/^https?:\/\/[^\s]+$/i.test(url)) {
    throw new Error('URL inválida: use http:// ou https://');
  }
  return url;
}

/**
 * Nome de ícone da biblioteca Lucide, em kebab-case (ex.: "layout-dashboard").
 * Restringir o formato evita que o valor seja usado para injetar algo na UI.
 */
function normalizeIcon_(value) {
  const icon = String(value === undefined || value === null ? '' : value).trim().toLowerCase();
  if (icon === '') {
    return 'app-window';
  }
  if (!/^[a-z0-9-]{1,40}$/.test(icon)) {
    throw new Error('Ícone inválido: use apenas letras minúsculas, números e hífen');
  }
  return icon;
}

/* ------------------------------------------------------------------ *
 * Utilidades
 * ------------------------------------------------------------------ */

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
