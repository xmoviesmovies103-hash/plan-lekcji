'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const { EduPageClient, normalizeEdupage } = require('./lib/edupage');
const { Store } = require('./lib/store');
const { createApi } = require('./lib/api');
const { buildTimetable } = require('./lib/timetable');
const { parseRenderedTimetable } = require('./lib/svgTimetable');
const browserFallback = require('./lib/browserFallback');

const CONFIG = {
  port: Number(process.env.PORT) || 8080,
  host: process.env.HOST || '0.0.0.0',
  dataDir: process.env.DATA_DIR || path.join(__dirname, 'data'),
  timetableTtlMin: Number(process.env.TIMETABLE_TTL_MIN) || 30,
  substTtlMin: Number(process.env.SUBST_TTL_MIN) || 5,
  offline: process.env.OFFLINE === '1' || process.argv.includes('--offline'),
};
const CONFIG_FILE = path.join(CONFIG.dataDir, 'config.json');
const FROM_ENV = normalizeEdupage(process.env.EDUPAGE);

const log = (...a) => console.log(new Date().toISOString().replace('T', ' ').slice(0, 19), ...a);

function readConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); } catch (_) { return {}; }
}

function currentSchool() {
  return FROM_ENV || normalizeEdupage(readConfig().edupage);
}

let api = null;
let client = null;

function start(edupage) {
  client = new EduPageClient({ subdomain: edupage, base: edupage ? process.env.EDUPAGE_BASE || null : null, log });
  const store = new Store(path.join(CONFIG.dataDir, edupage || '_brak'), log);
  const fallback = edupage && browserFallback.available() ? async (classQuery, st) => {
    const rec = await st.get(`svg-${classQuery}`, CONFIG.timetableTtlMin * 60000, async () => {
      const r = await browserFallback.renderTimetable(client.base, classQuery);
      if (r.raw) return { kind: 'raw', raw: r.raw };
      return { kind: 'svg', tt: parseRenderedTimetable(r.svg) };
    });
    const tt = rec.value.kind === 'raw' ? buildTimetable(rec.value.raw, classQuery) : rec.value.tt;
    return { ...tt, source: rec.value.kind === 'raw' ? 'browser-json' : 'browser-svg', fetchedAt: rec.fetchedAt, stale: rec.stale };
  } : null;
  api = createApi({ client, store, offline: CONFIG.offline, timetableTtlMin: CONFIG.timetableTtlMin, substTtlMin: CONFIG.substTtlMin, fallback, log });
  return api;
}

async function setup(req) {
  if (FROM_ENV) return { status: 409, body: { error: 'Adres szkoły jest ustawiony w zmiennej EDUPAGE. Zmień go tam.' } };
  const local = /^(::1|127\.|::ffff:127\.)/.test(req.socket.remoteAddress || '');
  if (currentSchool() && !local) return { status: 403, body: { error: 'Szkołę można zmienić tylko na komputerze, na którym działa serwer (http://localhost).' } };
  let body = '';
  for await (const chunk of req) { body += chunk; if (body.length > 2000) return { status: 413, body: { error: 'Za długie zapytanie' } }; }
  let edupage = null;
  try { edupage = normalizeEdupage(JSON.parse(body).edupage); } catch (_) { edupage = null; }
  if (!edupage) return { status: 400, body: { error: 'To nie wygląda na adres EduPage. Wpisz np. mojaszkola.edupage.org' } };
  const test = new EduPageClient({ subdomain: edupage, base: process.env.EDUPAGE_BASE || null, log });
  let s;
  try { s = await test.session(true); } catch (e) {
    return { status: 400, body: { error: `Nie udało się otworzyć ${edupage}.edupage.org (${e.message}). Sprawdź adres.` } };
  }
  fs.mkdirSync(CONFIG.dataDir, { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify({ edupage }, null, 2));
  start(edupage);
  log(`ustawiono szkołę: ${edupage}.edupage.org (${s.school || 'bez nazwy'})`);
  return { status: 200, body: { edupage, name: s.school || null } };
}

start(currentSchool());

function send(res, status, body, headers = {}) {
  const isJson = typeof body !== 'string' && !Buffer.isBuffer(body);
  res.writeHead(status, {
    'Content-Type': isJson ? 'application/json; charset=utf-8' : headers['Content-Type'] || 'text/plain; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    ...headers,
  });
  res.end(isJson ? JSON.stringify(body) : body);
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};
const PUBLIC = path.join(__dirname, 'public');

function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.normalize(path.join(PUBLIC, rel));
  if (!file.startsWith(PUBLIC)) return send(res, 403, 'Forbidden');
  fs.readFile(file, (err, data) => {
    if (err) {
      if (!path.extname(rel)) return serveStatic(req, res, '/');
      return send(res, 404, 'Nie znaleziono');
    }
    const ext = path.extname(file);
    const noCache = ext === '.html' || rel.endsWith('sw.js');
    send(res, 200, data, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': noCache ? 'no-cache' : 'public, max-age=300' });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'OPTIONS') return send(res, 204, '', { 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Allow-Headers': '*' });
  if (url.pathname.startsWith('/push/')) return send(res, 404, { error: 'Powiadomienia działają tylko w wersji na Cloudflare.', off: true });
  if (url.pathname === '/api/setup' && req.method === 'POST') {
    const r = await setup(req);
    return send(res, r.status, r.body);
  }
  if (url.pathname.startsWith('/api/')) {
    const r = await api.handle(url);
    return send(res, r.status, r.body);
  }
  serveStatic(req, res, url.pathname);
});

if (require.main === module) {
  server.listen(CONFIG.port, CONFIG.host, () => {
    log(`Plan lekcji działa: http://localhost:${CONFIG.port}`);
    if (!client.base) log('Nie ustawiono szkoły. Otwórz powyższy adres w przeglądarce i wpisz adres EduPage szkoły.');
    else {
      log(`Szkoła: ${client.base}${CONFIG.offline ? ' (offline)' : ''}`);
      if (!CONFIG.offline) api.timetableBundle().catch((e) => log('pierwsze pobranie planu nie udało się:', e.message));
    }
  });
}

module.exports = { server, CONFIG };
