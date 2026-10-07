import assert from 'assert/strict';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { start } = require('./mock-server.js');
const worker = (await import('../cloudflare/worker.js')).default;

const store = new Map();
globalThis.caches = { default: {
  async match(req) { const e = store.get(req.url); return e ? new Response(e.body, { headers: e.headers }) : undefined; },
  async put(req, res) { store.set(req.url, { body: await res.text(), headers: Object.fromEntries(res.headers) }); },
} };
const mock = await start();
const env = { EDUPAGE_BASE: mock.base, EDUPAGE: 'https://przykladowa.edupage.org/' };
const call = (path, init) => worker.fetch(new Request('https://plan.example.workers.dev' + path, init), env, { waitUntil() {} });
try {
  const page = await call('/');
  assert.equal(page.status, 200);
  assert.match(await page.text(), /mode: 'proxy'/);
  assert.equal((await call('/icon-180.png')).headers.get('content-type'), 'image/png');
  const sess = await (await call('/ep/session')).json();
  assert.equal(sess.year, 2026);
  assert.equal(sess.school, 'Szkoła Przykładowa nr 1');
  assert.equal(sess.edupage, 'przykladowa');
  const none = await worker.fetch(new Request('https://x.workers.dev/ep/session'), {}, { waitUntil() {} });
  assert.equal(none.status, 503);
  assert.equal((await none.json()).code, 'NOT_CONFIGURED', 'missing EDUPAGE is reported clearly');
  const bad2 = await worker.fetch(new Request('https://x.workers.dev/ep/session'), { EDUPAGE: 'http://example.com' }, { waitUntil() {} });
  assert.equal(bad2.status, 503, 'non-EduPage address is refused');
  assert.equal((await worker.fetch(new Request('https://x.workers.dev/'), {}, { waitUntil() {} })).status, 200, 'page still opens without a school');
  const r = await call('/ep/timetable/server/regulartt.js?__func=regularttGetData', { method: 'POST', body: JSON.stringify({ __args: [null, '346'], __gsh: 'proxy' }) });
  assert.equal(r.status, 200);
  assert.ok((await r.json()).r.dbiAccessorRes);
  const g = await call('/ep/timetable/server/regulartt.js?__func=regularttGetData&args=' + encodeURIComponent('[null,"346"]'));
  assert.equal(g.status, 200);
  assert.match(g.headers.get('cache-control'), /max-age=1800/);
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Warsaw' }).format(new Date());
  const sub = await call('/ep/substitution/server/viewer.js?__func=getSubstViewerDayDataHtml&args=' + encodeURIComponent(JSON.stringify([null, { date: today, mode: 'classes' }])));
  assert.match(sub.headers.get('cache-control'), /max-age=180/);

  const before = mock.seen.filter((x) => x.url.includes('regularttGetData')).length;
  const g2 = await call('/ep/timetable/server/regulartt.js?__func=regularttGetData&args=' + encodeURIComponent('[null,"346"]'));
  assert.equal(g2.status, 200);
  assert.equal(mock.seen.filter((x) => x.url.includes('regularttGetData')).length, before, 'served from cache');

  const tvUrl = '/ep/timetable/server/ttviewer.js?__func=getTTViewerData&args=' + encodeURIComponent('[null,2026]');
  assert.equal((await call(tvUrl)).status, 200);
  for (const k of [...store.keys()]) if (!k.includes('_stale=1')) store.delete(k);
  mock.srv.close();
  const down = await call(tvUrl);
  assert.equal(down.status, 200);
  assert.equal(down.headers.get('x-plan-stale'), '1');
  const bad = await call('/ep/some/other.js?__func=x', { method: 'POST', body: '{"__args":[]}' });
  assert.equal(bad.status, 403, 'only EduPage plan/substitution addresses are forwarded');
  console.log('  ✓ Cloudflare Worker: page, icons, session, school setting, forwarding, shared cache, last copy when EduPage is down, blocked addresses');
} catch (e) {
  console.error('  ✗ Cloudflare Worker:', e.message); process.exitCode = 1;
} finally { try { mock.srv.close(); } catch (_) {} }
