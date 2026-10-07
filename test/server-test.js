const assert = require('assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { start } = require('./mock-server.js');

(async () => {
  const mock = await start();
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plan-test-'));
  const port = 18000 + Math.floor(Math.random() * 1000);
  const child = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], {
    env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', DATA_DIR: dataDir, EDUPAGE: '', EDUPAGE_BASE: mock.base },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let out = '';
  child.stdout.on('data', (d) => { out += d; });
  child.stderr.on('data', (d) => { out += d; });
  const base = `http://127.0.0.1:${port}`;
  const get = async (p) => { const r = await fetch(base + p); return { status: r.status, body: await r.json().catch(() => null) }; };
  const post = async (p, b) => { const r = await fetch(base + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }); return { status: r.status, body: await r.json() }; };
  try {
    for (let i = 0; i < 50 && !/działa/.test(out); i++) await new Promise((r) => setTimeout(r, 100));
    assert.match(out, /Nie ustawiono szkoły/);
    const page = await fetch(base + '/');
    assert.equal(page.status, 200);
    const a = await get('/api/school');
    assert.equal(a.status, 503);
    assert.equal(a.body.code, 'NOT_CONFIGURED');
    assert.equal((await post('/api/setup', { edupage: 'to nie jest adres' })).status, 400);
    const s = await post('/api/setup', { edupage: 'https://przykladowa.edupage.org/timetable/' });
    assert.equal(s.status, 200, JSON.stringify(s.body));
    assert.equal(s.body.edupage, 'przykladowa');
    assert.equal(s.body.name, 'Szkoła Przykładowa nr 1');
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dataDir, 'config.json'), 'utf8')), { edupage: 'przykladowa' });
    const b = await get('/api/school');
    assert.equal(b.body.name, 'Szkoła Przykładowa nr 1');
    const c = await get('/api/classes');
    assert.deepEqual(c.body.classes.map((x) => x.short), ['1F', '1G']);
    const t = await get('/api/timetable?class=1F');
    assert.equal(t.body.lessons.length, 46);
    const missing = await get('/api/timetable?class=9Z');
    assert.equal(missing.status, 404);
    assert.equal(missing.body.code, 'CLASS_NOT_FOUND');
    console.log('  ✓ Serwer Node: ekran ustawiania, zapis szkoły, nazwa szkoły, plan, brak klasy');
  } catch (e) {
    console.error('  ✗ Serwer Node:', e.message, '\n', out.slice(-500)); process.exitCode = 1;
  } finally {
    child.kill(); mock.srv.close(); fs.rmSync(dataDir, { recursive: true, force: true });
  }
})();
