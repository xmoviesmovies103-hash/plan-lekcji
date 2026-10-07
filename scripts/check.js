const fs = require('fs');
const path = require('path');
const { EduPageClient, normalizeEdupage, warsawToday } = require('../lib/edupage');
const { listClasses, buildTimetable } = require('../lib/timetable');
const { parseSubstitutions, entriesForClass } = require('../lib/substitutions');

function fromConfig() {
  try { return JSON.parse(fs.readFileSync(path.join(process.env.DATA_DIR || path.join(__dirname, '..', 'data'), 'config.json'), 'utf8')).edupage; } catch (_) { return null; }
}

const edupage = normalizeEdupage(process.argv[2] || process.env.EDUPAGE || fromConfig());
const wantClass = process.argv[3] || '';
const ok = (m) => console.log('  ✓ ' + m);
const bad = (m) => { console.log('  ✗ ' + m); process.exitCode = 1; };

if (!edupage) {
  console.log('Podaj adres EduPage szkoły, np.:  node scripts/check.js mojaszkola.edupage.org');
  process.exit(1);
}
const client = new EduPageClient({ subdomain: edupage });

(async () => {
  console.log(`Sprawdzam ${client.base} …\n`);
  let raw = null;
  let cls = null;
  try {
    const s = await client.session();
    ok(`strona EduPage odpowiada: ${s.school || '(bez nazwy szkoły)'}, rok szkolny ${s.year}`);
  } catch (e) { bad('nie mogę otworzyć strony EduPage: ' + e.message); return; }
  try {
    const tt = await client.currentTimetable();
    ok(`aktualny plan: „${tt.name || tt.ttNum}”`);
    raw = await client.regularTimetable(tt.ttNum);
    const classes = listClasses(raw);
    ok(`pobrano plan: ${classes.length} klas (${classes.slice(0, 8).map((c) => c.short).join(', ')}${classes.length > 8 ? ', …' : ''})`);
    const t = buildTimetable(raw, wantClass || classes[0].name);
    cls = t.class;
    ok(`${t.class.name}: ${t.lessons.length} lekcji w tygodniu, grupy: ${t.divisions.map((d) => d.groups.join('/')).join(', ') || 'brak'}`);
  } catch (e) { bad('plan: ' + e.message); }
  try {
    const date = warsawToday();
    const { html, via } = await client.substitutionHtml(date);
    const p = parseSubstitutions(html, { date });
    const mine = cls ? entriesForClass(p, cls) : [];
    ok(`zastępstwa na ${date} (${via === 'api' ? 'API' : 'strona'}): ${p.empty ? 'brak zastępstw' : Object.keys(p.classes).length + ' klas ze zmianami'}${cls ? `, dla ${cls.short}: ${mine.length}` : ''}`);
  } catch (e) { bad('zastępstwa: ' + e.message); }
  console.log(process.exitCode ? '\nCoś nie działa. Opis błędu jest wyżej.' : '\nWszystko działa.');
})();
