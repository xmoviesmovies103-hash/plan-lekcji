'use strict';

const { decodeEntities, parseAttrs } = require('./html');

const DAY_LABELS = [
  ['pn', 'pon', 'po', 'poniedziałek', 'poniedzialek', 'mo', 'mon', 'monday'],
  ['wt', 'wto', 'wtorek', 'tu', 'tue', 'tuesday'],
  ['śr', 'sr', 'śro', 'środa', 'sroda', 'we', 'wed', 'wednesday'],
  ['cz', 'czw', 'czwartek', 'th', 'thu', 'thursday'],
  ['pi', 'pt', 'pią', 'pia', 'piątek', 'piatek', 'fr', 'fri', 'friday'],
  ['so', 'sob', 'sobota', 'sa', 'sat', 'saturday'],
  ['nd', 'ni', 'nie', 'niedz', 'niedziela', 'su', 'sun', 'sunday'],
];

function dayIndex(label) {
  const l = label.trim().toLowerCase().replace(/\.$/, '');
  return DAY_LABELS.findIndex((set) => set.includes(l));
}

const pad = (t) => t.replace(/^(\d):/, '0$1:');

function parseRenderedTimetable(html) {
  const texts = [];
  const textRe = /<text\b([^>]*)>([\s\S]*?)<\/text>/gi;
  let m;
  while ((m = textRe.exec(html))) {
    const a = parseAttrs(m[1]);
    const parts = [];
    const inner = m[2];
    const tspans = [...inner.matchAll(/<tspan\b[^>]*>([\s\S]*?)<\/tspan>/gi)].map((x) => x[1]);
    if (tspans.length) parts.push(...tspans); else parts.push(inner);
    const lines = parts.map((p) => decodeEntities(p.replace(/<[^>]+>/g, '')).trim());
    let x = parseFloat(a.x);
    if (!Number.isFinite(x)) {
      const tx = /<tspan\b[^>]*\bx="([\d.]+)"/.exec(inner);
      x = tx ? parseFloat(tx[1]) : NaN;
    }
    texts.push({ x, y: parseFloat(a.y), size: parseFloat(a['font-size']) || 0, text: lines.join(''), lines });
  }

  const cols = texts
    .map((t) => ({ t, m: /^(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})$/.exec(t.text) }))
    .filter((c) => c.m && Number.isFinite(c.t.x))
    .map((c) => ({ x: c.t.x, start: pad(c.m[1]), end: pad(c.m[2]) }))
    .sort((a, b) => a.x - b.x);
  if (!cols.length) throw new Error('Nie znaleziono godzin lekcji na obrazku planu');
  cols.forEach((c, i) => {
    const num = texts.find((t) => /^\d{1,2}$/.test(t.text) && Math.abs(t.x - c.x) < 1 && t.size > 0);
    c.n = num ? Number(num.text) : i + 1;
  });
  const colWidth = cols.length > 1 ? (cols[cols.length - 1].x - cols[0].x) / (cols.length - 1) : 100;

  const rows = texts
    .filter((t) => Number.isFinite(t.y) && Number.isFinite(t.x) && t.x < cols[0].x - colWidth * 0.5 && dayIndex(t.text) >= 0)
    .map((t) => ({ y: t.y, day: dayIndex(t.text), x: t.x }));

  const dayRows = [];
  for (const r of rows.sort((a, b) => a.x - b.x)) if (!dayRows.some((d) => d.day === r.day)) dayRows.push(r);
  if (!dayRows.length) throw new Error('Nie znaleziono dni tygodnia na obrazku planu');

  const big = texts.filter((t) => t.size > 0 && dayIndex(t.text) < 0 && !/^\d+$/.test(t.text) && /\d/.test(t.text))
    .sort((a, b) => b.size - a.size)[0];
  const validity = (texts.find((t) => /wa[żz]no[śs][ćc]/i.test(t.text)) || {}).text || null;

  const lessons = [];
  const rectRe = /<rect\b([^>]*?)>\s*<title>([\s\S]*?)<\/title>\s*<\/rect>/gi;
  while ((m = rectRe.exec(html))) {
    const a = parseAttrs(m[1]);
    const x = parseFloat(a.x); const y = parseFloat(a.y); const w = parseFloat(a.width); const h = parseFloat(a.height);
    if (![x, y, w, h].every(Number.isFinite)) continue;
    const lines = decodeEntities(m[2]).split('\n').map((s) => s.trim()).filter(Boolean);
    if (!lines.length) continue;
    const covered = cols.filter((c) => c.x > x + colWidth * 0.1 && c.x < x + w - colWidth * 0.1);
    if (!covered.length) continue;
    const cy = y + h / 2;
    const row = dayRows.reduce((best, r) => (Math.abs(r.y - cy) < Math.abs(best.y - cy) ? r : best), dayRows[0]);

    let subject = lines[0]; let teacher = null; let room = null; let groupsL = [];
    if (lines.length >= 3) {
      room = lines[lines.length - 1];
      teacher = lines[lines.length - 2];
      groupsL = lines.slice(1, -2);
    } else if (lines.length === 2) {
      if (/\d/.test(lines[1]) && lines[1].length <= 6) room = lines[1]; else teacher = lines[1];
    }

    const inside = texts.filter((t) => t.x >= x && t.x <= x + w && t.y >= y && t.y <= y + h && t.size > 0)
      .sort((p, q) => q.size - p.size);
    const short = inside[0] ? inside[0].text : subject;
    lessons.push({
      id: `svg-${row.day}-${covered[0].n}-${lessons.length}`,
      day: row.day,
      from: covered[0].n,
      to: covered[covered.length - 1].n,
      start: covered[0].start,
      end: covered[covered.length - 1].end,
      subject: { name: subject, short },
      teachers: teacher ? [{ name: teacher, short: null }] : [],
      rooms: room ? [room] : [],
      groups: groupsL,
      weeks: null,
    });
  }
  lessons.sort((a, b) => a.day - b.day || a.from - b.from || a.groups.join().localeCompare(b.groups.join()));

  const groupSet = new Set(lessons.flatMap((l) => l.groups));
  const name = big ? big.text : null;
  const result = {
    class: name ? { id: null, name, short: name.split(/\s+/)[0] } : null,
    timetable: validity,
    validFrom: null,
    periods: cols.map((c) => ({ n: c.n, label: String(c.n), start: c.start, end: c.end })),
    days: ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek'].map((n, i) => ({ index: i, name: n, short: ['Pn', 'Wt', 'Śr', 'Cz', 'Pt'][i] })),

    divisions: groupSet.size ? splitDivisions([...groupSet]) : [],
    lessons,
  };
  result.hash = fnv(JSON.stringify({ p: result.periods, l: lessons }));
  return result;
}

function splitDivisions(groups) {
  const numeric = groups.filter((g) => /^\d+$/.test(g)).sort();
  const other = groups.filter((g) => !/^\d+$/.test(g));
  const out = [];
  if (numeric.length) out.push({ id: 'num', groups: numeric });
  for (const g of other) out.push({ id: 'g-' + g, groups: [g] });
  return out;
}

function fnv(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0') + str.length.toString(16);
}

module.exports = { parseRenderedTimetable };
