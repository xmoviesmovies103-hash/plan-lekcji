const fs = require('fs');
const path = require('path');
const { parseSubstitutions } = require('../lib/substitutions');

const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const dir = path.join(dataDir, 'przykladowa');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dataDir, 'config.json'), JSON.stringify({ edupage: 'przykladowa' }, null, 2));
fs.writeFileSync(path.join(dir, 'school.json'), JSON.stringify({ fetchedAt: Date.now(), value: { name: 'Szkoła Przykładowa nr 1', edupage: 'przykladowa', url: 'https://przykladowa.edupage.org' } }));
const fx = (f) => fs.readFileSync(path.join(__dirname, '..', 'test', 'fixtures', f), 'utf8');
const now = Date.now();

const raw = JSON.parse(fx('regulartt-sample.json'));
fs.writeFileSync(path.join(dir, 'timetable.json'), JSON.stringify({
  fetchedAt: now,
  value: { raw, ttNum: '346', name: 'Plan 2026/27 (14.09.2026 - 25.06.2027)', validFrom: '2026-09-14', source: 'api' },
}));
const s06 = parseSubstitutions(fx('substitution-page-2026-10-06.html'));
fs.writeFileSync(path.join(dir, 'subst-2026-10-06.json'), JSON.stringify({ fetchedAt: now, value: { ...s06, via: 'fixture' } }));
const empty = (date) => ({ fetchedAt: now, value: { date, updatedAt: null, info: {}, absentClasses: [], empty: true, classes: {}, via: 'fixture' } });
for (const d of ['2026-10-05', '2026-10-07', '2026-10-08', '2026-10-09']) {
  fs.writeFileSync(path.join(dir, `subst-${d}.json`), JSON.stringify(empty(d)));
}
console.log('seeded', dir);
