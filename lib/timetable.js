'use strict';

const DAY_NAMES = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];
const DAY_SHORT = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];

function pad(t) {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(t || '').trim());
  return m ? m[1].padStart(2, '0') + ':' + m[2] : null;
}

function getTables(resp) {
  const candidates = [
    resp && resp.r && resp.r.dbiAccessorRes && resp.r.dbiAccessorRes.tables,
    resp && resp.dbiAccessorRes && resp.dbiAccessorRes.tables,
    resp && resp.r && resp.r.tables,
    resp && resp.tables,
  ];
  let list = candidates.find(Array.isArray);
  if (!list) {
    const seen = new Set();
    const walk = (o, d) => {
      if (!o || typeof o !== 'object' || seen.has(o) || d > 6) return null;
      seen.add(o);
      if (Array.isArray(o) && o.length && o.every((x) => x && typeof x.id === 'string' && Array.isArray(x.data_rows))) return o;
      for (const v of Object.values(o)) { const r = walk(v, d + 1); if (r) return r; }
      return null;
    };
    list = walk(resp, 0);
  }
  if (!list) throw new Error('Nie znaleziono tabel planu w odpowiedzi EduPage');
  const T = {};
  for (const t of list) T[t.id] = Array.isArray(t.data_rows) ? t.data_rows : [];
  return T;
}

function byId(rows) {
  const m = new Map();
  for (const r of rows || []) m.set(String(r.id), r);
  return m;
}

function listClasses(resp) {
  const T = getTables(resp);
  return (T.classes || [])
    .map((c) => ({ id: String(c.id), name: String(c.name || c.short || '').trim(), short: String(c.short || c.name || '').trim() }))
    .filter((c) => c.name)
    .sort((a, b) => a.name.localeCompare(b.name, 'pl', { numeric: true }));
}

function findClass(classes, query) {
  const q = String(query || '').trim().toLowerCase().replace(/[\s-]+/g, '');
  if (!q) return null;
  const norm = (s) => String(s || '').toLowerCase().replace(/[\s-]+/g, '');
  return classes.find((c) => c.id === query)
    || classes.find((c) => norm(c.name) === q)
    || classes.find((c) => norm(c.short) === q)
    || classes.find((c) => norm(c.name).startsWith(q))
    || null;
}

function teacherName(t) {
  if (!t) return null;
  const full = [t.lastname, t.firstname].filter(Boolean).join(' ').trim();
  return String(t.name || full || t.short || '').trim() || null;
}

function dayIndexes(card, lesson, daysdefs) {
  let s = card && typeof card.days === 'string' ? card.days : '';
  if (!/1/.test(s) && lesson && lesson.daysdefid && daysdefs.get(String(lesson.daysdefid))) {
    const vals = daysdefs.get(String(lesson.daysdefid)).vals || [];
    if (vals.length === 1) s = vals[0];
  }
  const out = [];
  for (let i = 0; i < s.length; i++) if (s[i] === '1') out.push(i);
  return out;
}

function buildTimetable(resp, classQuery, meta = {}) {
  const T = getTables(resp);
  const classes = listClasses(resp);
  const cls = findClass(classes, classQuery);
  if (!cls) {
    const e = new Error(`Nie znaleziono klasy „${classQuery}” w planie`);
    e.code = 'CLASS_NOT_FOUND';
    throw e;
  }

  const periodsRaw = (T.periods || [])
    .map((p) => ({ key: String(p.period ?? p.id), id: String(p.id), n: Number(p.period ?? p.short ?? p.name), label: String(p.short || p.name || p.period), start: pad(p.starttime), end: pad(p.endtime) }))
    .filter((p) => Number.isFinite(p.n) && p.start && p.end)
    .sort((a, b) => a.n - b.n);
  const periodIndex = new Map();
  periodsRaw.forEach((p, i) => { periodIndex.set(p.key, i); periodIndex.set(p.id, i); });

  const subjects = byId(T.subjects);
  const teachers = byId(T.teachers);
  const rooms = byId(T.classrooms);
  const groups = byId(T.groups);
  const daysdefs = byId(T.daysdefs);
  const lessonsById = new Map();
  for (const l of T.lessons || []) {
    const cids = (l.classids || []).map(String);
    if (cids.includes(cls.id)) lessonsById.set(String(l.id), l);
  }

  const days = (T.days && T.days.length ? T.days : DAY_NAMES.slice(0, 5).map((n, i) => ({ id: String(i), name: n })))
    .map((d, i) => ({ index: i, name: d.name || DAY_NAMES[i], short: DAY_SHORT[i] || d.short }));

  const divisions = new Map();
  const lessons = [];
  const seen = new Set();
  for (const card of T.cards || []) {
    const lesson = lessonsById.get(String(card.lessonid));
    if (!lesson) continue;
    const pi = periodIndex.get(String(card.period));
    if (pi === undefined) continue;
    const dur = Math.max(1, Number(lesson.durationperiods) || 1);
    const pFrom = periodsRaw[pi];
    const pTo = periodsRaw[Math.min(periodsRaw.length - 1, pi + dur - 1)];
    const subj = subjects.get(String(lesson.subjectid)) || {};
    const groupObjs = (lesson.groupids || []).map((g) => groups.get(String(g))).filter(Boolean)
      .filter((g) => String(g.classid) === cls.id || !g.classid);
    const partial = groupObjs.filter((g) => !g.entireclass);
    for (const g of partial) {
      const div = String(g.divisionid || 'div');
      if (!divisions.has(div)) divisions.set(div, new Set());
      divisions.get(div).add(String(g.name));
    }
    const roomList = (card.classroomids || []).map((r) => rooms.get(String(r))).filter(Boolean).map((r) => String(r.short || r.name));
    for (const day of dayIndexes(card, lesson, daysdefs)) {
      const item = {
        id: `${card.id || card.lessonid}-${day}`,
        day,
        from: pFrom.n,
        to: pTo.n,
        start: pFrom.start,
        end: pTo.end,
        subject: { name: String(subj.name || subj.short || '?'), short: String(subj.short || subj.name || '?') },
        teachers: (lesson.teacherids || []).map((t) => teachers.get(String(t))).filter(Boolean)
          .map((t) => ({ name: teacherName(t), short: t.short || null })),
        rooms: roomList,
        groups: partial.map((g) => String(g.name)),
        weeks: typeof card.weeks === 'string' && /0/.test(card.weeks) ? card.weeks : null,
      };
      const key = [item.day, item.from, item.subject.short, item.groups.join(','), item.rooms.join(',')].join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      lessons.push(item);
    }
  }
  lessons.sort((a, b) => a.day - b.day || a.from - b.from || a.groups.join().localeCompare(b.groups.join()));

  const result = {
    class: cls,
    timetable: meta.ttName || null,
    validFrom: meta.validFrom || null,
    periods: periodsRaw.map((p) => ({ n: p.n, label: p.label, start: p.start, end: p.end })),
    days,
    divisions: [...divisions.entries()].map(([id, set]) => ({ id, groups: [...set].sort((a, b) => a.localeCompare(b, 'pl', { numeric: true })) })),
    lessons,
  };
  result.hash = hashOf(result);
  return result;
}

function hashOf(tt) {
  return fnv(JSON.stringify({ p: tt.periods, l: tt.lessons }));
}

function subjectDictionary(...responses) {
  const dict = {};
  for (const resp of responses) {
    if (!resp) continue;
    let T;
    try { T = getTables(resp); } catch (_) { continue; }
    for (const s of T.subjects || []) {
      if (s.short && s.name && !dict[s.short]) dict[s.short] = s.name;
    }
  }
  return dict;
}

function fnv(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0') + str.length.toString(16);
}

const KEEP = {
  periods: ['id', 'period', 'name', 'short', 'starttime', 'endtime'],
  days: ['id', 'name', 'short'],
  daysdefs: ['id', 'vals'],
  classes: ['id', 'name', 'short'],
  subjects: ['id', 'name', 'short'],
  teachers: ['id', 'name', 'short', 'firstname', 'lastname'],
  classrooms: ['id', 'name', 'short'],
  groups: ['id', 'name', 'classid', 'entireclass', 'divisionid'],
  lessons: ['id', 'subjectid', 'teacherids', 'groupids', 'classids', 'durationperiods', 'daysdefid'],
  cards: ['id', 'lessonid', 'period', 'days', 'weeks', 'classroomids'],
};
function slimRaw(resp) {
  const T = getTables(resp);
  const tables = Object.entries(KEEP).map(([id, fields]) => ({
    id,
    data_rows: (T[id] || []).map((row) => {
      const o = {};
      for (const f of fields) if (row[f] !== undefined) o[f] = row[f];
      return o;
    }),
  }));
  return { r: { dbiAccessorRes: { tables } } };
}

module.exports = { slimRaw, getTables, listClasses, findClass, buildTimetable, subjectDictionary, hashOf, pad };
