'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { extractReportHtml } = require('../lib/substitutions');

const fx = (f) => fs.readFileSync(path.join(__dirname, 'fixtures', f), 'utf8');

function start(port = 0) {
  const seen = [];
  const srv = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      seen.push({ method: req.method, url: req.url, cookie: req.headers.cookie, body });
      const json = (o, st = 200) => { res.statusCode = st; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); };
      if (req.method === 'GET' && req.url.startsWith('/timetable/')) {
        res.setHeader('Set-Cookie', ['PHPSESSID=abc123; path=/', 'edu=1; path=/']);
        return res.end('<html><head><title>Plan lekcji | Szkoła Przykładowa nr 1, ul. Szkolna 1</title></head><script>ASC.gsechash="1a2b3c4d";ASC.req_props={"edupage":"przykladowa","school_name":"Szkoła Przykładowa nr 1, ul. Szkolna 1 ","year_auto":2026}</script></html>');
      }
      if (req.method === 'POST') {
        let b; try { b = JSON.parse(body); } catch (_) { return json({ err: 'bad json' }, 400); }
        if (b.__gsh !== '1a2b3c4d' || !/PHPSESSID=abc123/.test(req.headers.cookie || '')) return json({ err: 'no session' }, 403);
        if (req.url.includes('getTTViewerData')) return json({ r: { regular: { default_num: '346', timetables: [
          { tt_num: '346', text: 'Plan 2026/27 (14.09.2026 - 25.06.2027)', datefrom: '2026-09-14', hidden: false },
        ] } } });
        if (req.url.includes('regularttGetData')) return res.end(fx('regulartt-sample.json'));
        if (req.url.includes('mainDBIAccessor')) return json({ r: { tables: [{ id: 'subjects', data_rows: [{ id: '-28', short: 'mat', name: 'Matematyka' }, { id: '-31', short: 're', name: 'Religia' }, { id: '-9', short: 'wf', name: 'Wychowanie fizyczne' }] }] } });
        if (req.url.includes('getSubstViewerDayDataHtml')) {
          const date = b.__args[1].date;
          if (date === '2026-10-06') return json({ r: extractReportHtml(fx('substitution-page-2026-10-06.html')) });
          return json({ r: fx('subst-api-empty.html').replace('2026-10-07', date) });
        }
      }
      if (req.url.startsWith('/substitution/')) return res.end(fx('substitution-page-2026-10-06.html'));
      res.statusCode = 404; res.end('no');
    });
  });
  return new Promise((resolve) => srv.listen(port, () => resolve({ srv, seen, base: `http://127.0.0.1:${srv.address().port}` })));
}

module.exports = { start };
if (require.main === module) start(Number(process.argv[2]) || 8098).then((m) => console.log('mock EduPage at', m.base));
