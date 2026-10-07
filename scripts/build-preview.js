const fs = require('fs');
const path = require('path');
const { buildTimetable, listClasses } = require('../lib/timetable');
const { parseSubstitutions, entriesForClass } = require('../lib/substitutions');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const raw = JSON.parse(read('test/fixtures/regulartt-sample.json'));
const tt = buildTimetable(raw, '1F Technikum', { ttName: 'Plan 2026/27 (14.09.2026 - 25.06.2027)', validFrom: '2026-09-14' });
tt.fetchedAt = Date.parse('2026-10-06T08:20:00+02:00');
tt.source = 'api';
const cls = { name: '1F Technikum', short: '1F' };
const s06 = parseSubstitutions(read('test/fixtures/substitution-page-2026-10-06.html'));

const days = {
  '2026-10-05': { entries: [], empty: false },
  '2026-10-06': { entries: entriesForClass(s06, cls), empty: false, updatedAt: s06.updatedAt },
  '2026-10-07': { entries: [], empty: true },
  '2026-10-08': { entries: [], empty: false },
  '2026-10-09': { entries: [], empty: false },
};
const classes = listClasses(raw).filter((c) => c.short === '1F');

const demo = `window.PLAN_DEMO = (function () {
  var tt = ${JSON.stringify(tt)};
  var days = ${JSON.stringify(days)};
  var classes = ${JSON.stringify(classes)};
  return {
    date: '2026-10-06',
    note: 'Podgląd na przykładowych danych (wymyślona szkoła, 06.10.2026). Prawdziwa strona pobiera plan z EduPage.',
    api: function (p) {
      return new Promise(function (resolve) {
        setTimeout(function () {
          if (p.indexOf('/api/school') === 0) return resolve({ name: 'Szkoła Przykładowa nr 1', edupage: 'przykladowa' });
          if (p.indexOf('/api/classes') === 0) return resolve({ classes: classes });
          if (p.indexOf('/api/timetable') === 0) return resolve(tt);
          var q = /dates=([^&]+)/.exec(p); var out = {};
          (q ? decodeURIComponent(q[1]).split(',') : []).forEach(function (d) {
            out[d] = days[d] ? Object.assign({ fetchedAt: tt.fetchedAt }, days[d]) : { entries: [], empty: false, fetchedAt: tt.fetchedAt };
          });
          resolve({ class: tt.class, days: out });
        }, 120);
      });
    }
  };
})();`;

let html = read('public/index.html');
html = html
  .replace(/<!doctype html>\s*<html[^>]*>\s*<head>\s*/i, '')
  .replace(/<meta charset[^>]*>\s*/i, '')
  .replace(/<meta name="viewport"[^>]*>\s*/i, '')
  .replace(/<link rel="(icon|apple-touch-icon|manifest)"[^>]*>\s*/gi, '')
  .replace(/<meta name="(apple-mobile-web-app-[a-z-]+|mobile-web-app-capable)"[^>]*>\s*/gi, '')
  .replace('<script src="plan-lib.js"></script>', '')
  .replace(/<title>[^<]*<\/title>/, '<title>Plan lekcji</title>')
  .replace('<link rel="stylesheet" href="style.css">', `<style>\n${read('public/style.css')}\n</style>`)
  .replace(/<\/head>\s*<body>/i, '')
  .replace(/<\/body>\s*<\/html>\s*$/i, '')
  .replace('<script src="core.js"></script>', `<script>${demo}</script>\n<script>\n${read('public/core.js')}\n</script>`)
  .replace('<script src="app.js"></script>', `<script>\n${read('public/app.js')}\n</script>`);

html = html.replace(/(<title>[^<]*<\/title>)/, '').replace(/^/, '<title>Plan lekcji</title>\n');
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', 'preview.html'), html);
console.log('dist/preview.html', (html.length / 1024).toFixed(0) + ' KB');
