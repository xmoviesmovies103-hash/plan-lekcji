import assert from 'assert/strict';
import http from 'http';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { start } = require('./mock-server.js');
const worker = (await import('../cloudflare/worker.js')).default;

function fakeKV() {
  const m = new Map();
  return {
    m,
    async get(k, type) { const e = m.get(k); if (!e) return null; return type === 'json' ? JSON.parse(e.v) : e.v; },
    async put(k, v, o = {}) { m.set(k, { v: String(v), meta: o.metadata }); },
    async delete(k) { m.delete(k); },
    async list({ prefix = '', limit = 1000, cursor } = {}) {
      const all = [...m.keys()].filter((k) => k.startsWith(prefix)).sort();
      const from = cursor ? Number(cursor) : 0;
      const page = all.slice(from, from + limit);
      const done = from + limit >= all.length;
      return { keys: page.map((name) => ({ name, metadata: m.get(name).meta })), list_complete: done, cursor: done ? undefined : String(from + limit) };
    },
  };
}

const pushes = [];
const pushSrv = http.createServer(async (req, res) => {
  const auth = req.headers.authorization || '';
  const m = /^vapid t=([^,]+), k=(.+)$/.exec(auth);
  let ok = false;
  if (m) {
    const [h, p, sig] = m[1].split('.');
    const fromB64 = (s) => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
    const key = await crypto.subtle.importKey('raw', fromB64(m[2]), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    ok = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, fromB64(sig), new TextEncoder().encode(`${h}.${p}`));
    const claims = JSON.parse(fromB64(p).toString());
    ok = ok && claims.aud === `http://127.0.0.1:${pushSrv.address().port}` && claims.exp > Date.now() / 1000 && /^https?:/.test(claims.sub);
  }
  pushes.push({ url: req.url, ok });
  res.statusCode = !ok ? 403 : req.url.includes('gone') ? 410 : 201;
  res.end();
});
await new Promise((r) => pushSrv.listen(0, r));
const PUSH_BASE = `http://127.0.0.1:${pushSrv.address().port}`;

const mock = await start();
const env = { EDUPAGE_BASE: mock.base, PUSH: fakeKV(), PUSH_ALLOW_ANY: '1' };
const pending = [];
const ctx = { waitUntil(p) { pending.push(p); } };
const cron = async (ms) => { await worker.scheduled({ scheduledTime: ms }, env, ctx); await Promise.all(pending.splice(0)); };
const call = (path, init) => worker.fetch(new Request('https://plan.example.workers.dev' + path, init), env, ctx);
const post = (path, body) => call(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

const at = (hhmm) => Date.parse(`2026-10-06T${hhmm}:00+02:00`);

try {
  const key = (await (await call('/push/key')).json()).key;
  assert.ok(key && key.length > 80, 'public key');

  const a = await (await post('/push/subscribe', { endpoint: PUSH_BASE + '/push/a', cls: { name: '1F Technikum', short: '1F' }, exclude: [] })).json();
  const b = await (await post('/push/subscribe', { endpoint: PUSH_BASE + '/push/b', cls: { name: '1D', short: '1D' }, exclude: ['1'] })).json();
  await post('/push/subscribe', { endpoint: PUSH_BASE + '/push/gone', cls: { name: '1F Technikum', short: '1F' }, exclude: [] });
  assert.ok(a.id && a.key.startsWith('s:1F:all:'));
  assert.equal(b.msgKey, '1D:1');

  await cron(at('09:00'));
  assert.deepEqual(pushes.map((p) => p.url).sort(), ['/push/a', '/push/b', '/push/gone'], 'one push per device');
  assert.ok(pushes.every((p) => p.ok), 'VAPID signature accepted');
  assert.ok(![...env.PUSH.m.keys()].some((k) => k.endsWith(':' + 'gone')) && ![...env.PUSH.m.values()].some((v) => v.meta && /gone/.test(v.meta.e)), 'unsubscribed device removed');

  const msgA = await (await call(`/push/msg?id=${a.id}&k=1F:all`)).json();
  assert.match(msgA.title, /^Dziś \(06\.10\): zmiana w planie 1F$/);
  assert.match(msgA.body, /3\. lekcja: Matematyka, sala 006 → 207/);
  const msgB = await (await call(`/push/msg?id=${b.id}&k=1D:1`)).json();
  assert.doesNotMatch(msgB.body, /gr\. 1\)/, 'group 1 hidden for someone in group 2');
  assert.match(msgB.body, /Lekcje 4–5 \(gr\. 2\): Wychowanie fizyczne, zastępstwo: Henryk Sosnak/);

  pushes.length = 0;
  await cron(at('09:05'));
  assert.equal(pushes.length, 0, 'nothing new → no second notification');
  await cron(at('23:00'));
  assert.equal(pushes.length, 0, 'quiet at night');

  const t = await (await post('/push/test', { key: a.key })).json();
  assert.equal(t.ok, true);
  assert.equal((await (await call(`/push/msg?id=${a.id}&k=1F:all`)).json()).title, 'Próbne powiadomienie');

  const bad = await (await post('/push/subscribe', { endpoint: 'https://evil.example/x', cls: { short: '1F' } })).status;
  assert.equal(bad, 200, 'test mode allows any address');
  const strictEnv = { ...env, PUSH_ALLOW_ANY: '0' };
  const strict = await worker.fetch(new Request('https://x.workers.dev/push/subscribe', { method: 'POST', body: JSON.stringify({ endpoint: 'https://evil.example/x', cls: { short: '1F' } }) }), strictEnv, ctx);
  assert.equal(strict.status, 400, 'only real push services are accepted');

  const off = await worker.fetch(new Request('https://x.workers.dev/push/key'), { EDUPAGE_BASE: mock.base }, ctx);
  assert.equal(off.status, 404, 'without KV the page is told notifications are off');
  console.log('  ✓ Powiadomienia: zapis, wykrycie zmiany, podpis VAPID, treść, grupy, cisza nocna, próbne');
} catch (e) {
  console.error('  ✗ Powiadomienia:', e.message); process.exitCode = 1;
} finally {
  mock.srv.close(); pushSrv.close();
}
