'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const { EduPageClient } = require('../lib/edupage');

const fx = (f) => fs.readFileSync(path.join(__dirname, 'fixtures', f), 'utf8');
const seen = [];
const srv = http.createServer((req, res) => {
  let body = '';
  req.on('data', (c) => { body += c; });
  req.on('end', () => {
    seen.push({ url: req.url, cookie: req.headers.cookie, body });
    if (req.method === 'GET' && req.url.startsWith('/timetable/')) {
      res.setHeader('Set-Cookie', ['PHPSESSID=abc123; path=/', 'edu=1; path=/']);
      return res.end('<script>ASC.gsechash="1a2b3c4d";ASC.req_props={"school_name":"Szkoła Przykładowa nr 1","year_auto":2026}</script>');
    }
    const json = (o) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); };
    if (req.url.includes('getTTViewerData')) return json({ r: { regular: { default_num: '346', timetables: [
      { tt_num: '179', text: 'stary', datefrom: '2023-05-22', hidden: true },
      { tt_num: '346', text: 'Plan 2026/27', datefrom: '2026-09-14', hidden: false },
      { tt_num: '400', text: 'przyszły', datefrom: '2099-01-01', hidden: false },
    ] } } });
    if (req.url.includes('regularttGetData')) return json(JSON.parse(fx('regulartt-sample.json')));
    if (req.url.includes('getSubstViewerDayDataHtml')) return json({ r: fx('subst-api-2026-10-05.html') });
    if (req.url.startsWith('/substitution/')) return res.end(fx('substitution-page-2026-10-06.html'));
    res.statusCode = 404; res.end('no');
  });
});

srv.listen(0, async () => {
  const base = `http://127.0.0.1:${srv.address().port}`;
  const c = new EduPageClient({ base });
  try {
    const tt = await c.currentTimetable('2026-10-06');
    assert.equal(tt.ttNum, '346', 'picks the plan in force today, not a future one');
    const raw = await c.regularTimetable(tt.ttNum);
    assert.ok(raw.r.dbiAccessorRes.tables.length > 5);
    const post = seen.find((s) => s.url.includes('regularttGetData'));
    assert.match(post.cookie, /PHPSESSID=abc123/);
    assert.deepEqual(JSON.parse(post.body), { __args: [null, '346'], __gsh: '1a2b3c4d' });
    const sub = await c.substitutionHtml('2026-10-05');
    assert.equal(sub.via, 'api');
    console.log('  ✓ EduPage client: session, hash, cookie, plan choice, substitutions');
  } catch (e) {
    console.error('  ✗ EduPage client:', e.message); process.exitCode = 1;
  } finally { srv.close(); }
});
