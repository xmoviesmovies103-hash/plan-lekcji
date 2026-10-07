(function () {
  var defs = {};
  defs['./html'] = function (module, exports, require) {
'use strict';

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—',
  rarr: '→', larr: '←', hellip: '…', oacute: 'ó', Oacute: 'Ó',
};

function decodeEntities(s) {
  return String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return Object.prototype.hasOwnProperty.call(ENTITIES, e) ? ENTITIES[e] : m;
  });
}

function parseAttrs(src) {
  const attrs = {};
  const re = /([^\s=/>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let m;
  while ((m = re.exec(src))) attrs[m[1].toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? '');
  return attrs;
}

const BLOCK = new Set([
  'div', 'p', 'li', 'ul', 'ol', 'tr', 'td', 'th', 'table', 'tbody', 'thead', 'section', 'header', 'footer',
  'article', 'main', 'nav', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'hr', 'dd', 'dt', 'dl', 'caption',
]);
const SKIP_CONTENT = new Set(['script', 'style', 'noscript', 'template']);

function htmlToLines(html) {
  const lines = [];
  let buf = '';
  const stack = [];
  const flush = () => {
    const text = decodeEntities(buf).replace(/\s+/g, ' ').trim();
    if (text) {
      const hints = stack.map((s) => s.cls).filter(Boolean).join(' ').split(/\s+/).filter(Boolean);
      lines.push({ text, hints, depth: stack.length });
    }
    buf = '';
  };
  const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][a-zA-Z0-9:-]*)([^>]*?)(\/?)>|([^<]+)|</g;
  let m;
  while ((m = re.exec(html))) {
    if (m[5] !== undefined) { buf += m[5]; continue; }
    if (!m[2]) { if (m[0] === '<') buf += '<'; continue; }
    const closing = m[1] === '/';
    const tag = m[2].toLowerCase();
    const selfClose = m[4] === '/' || tag === 'br' || tag === 'img' || tag === 'hr' || tag === 'input' || tag === 'meta' || tag === 'link';
    if (!closing && SKIP_CONTENT.has(tag)) {
      const end = html.toLowerCase().indexOf('</' + tag, re.lastIndex);
      re.lastIndex = end < 0 ? html.length : end;
      continue;
    }
    if (BLOCK.has(tag)) flush();
    if (closing) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tag === tag) { stack.length = i; break; }
      }
    } else if (!selfClose) {
      const cls = BLOCK.has(tag) ? (parseAttrs(m[3]).class || '') : '';
      if (BLOCK.has(tag)) stack.push({ tag, cls });
    }
  }
  flush();
  return lines;
}

module.exports = { decodeEntities, parseAttrs, htmlToLines };

};
  defs['./substitutions'] = function (module, exports, require) {
'use strict';

const { htmlToLines, decodeEntities } = require('./html');

const ARROW = /\s*(?:➔|→|⇒|->|=>)\s*/;
const TIME_RANGE = /^(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})\s*,?\s*/;
const PERIOD_RE = /^\(?\s*(\d{1,2})(?:\s*[-–]\s*(\d{1,2}))?\s*\)?$/;
const ALL_DAY_RE = /^\(?\s*ca[łl]y\s+dzie[ńn]\s*\)?$/i;
const NO_SUBST_RE = /nie\s+ma\s+(?:żadnych\s+)?zast[ęe]pstw/i;
const CANCEL_RE = /^(anulowan|odwo[łl]an|lekcja\s+odwo[łl]ana|cancel)/i;
const ABSENT_RE = /nieobecno[śs][ćc]/i;

const NAME_RE = /^[A-ZĄĆĘŁŃÓŚŹŻ][\p{L}'’.-]+(?:\s+[A-ZĄĆĘŁŃÓŚŹŻ][\p{L}'’.-]+){1,3}$/u;

function pad(t) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t || '');
  return m ? m[1].padStart(2, '0') + ':' + m[2] : t;
}

function splitTopLevel(s) {
  const out = [];
  let depth = 0;
  let cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if (ch === ',' && depth === 0) { out.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out.filter(Boolean);
}

function splitChange(value) {
  const m = /^\((.*)\)\s*(?:➔|→|⇒|->|=>)\s*(.*)$/.exec(value.trim());
  if (m) return { from: m[1].trim(), to: m[2].trim() };
  const parts = value.split(ARROW);
  if (parts.length === 2) return { from: parts[0].replace(/^\(|\)$/g, '').trim(), to: parts[1].trim() };
  return { to: value.trim() };
}

function labelKind(label) {
  const l = label.toLowerCase();
  if (/zast|nauczyc|prowadz|teacher/.test(l)) return 'teacher';
  if (/sal[aęi]|room|klasar|pomieszcz/.test(l)) return 'room';
  if (/przedmiot|subject/.test(l)) return 'subject';
  if (/grup|group/.test(l)) return 'group';
  return 'note';
}

function parsePeriodText(text) {
  const t = text.trim();
  if (ALL_DAY_RE.test(t)) return { allDay: true, cancelledHint: t.startsWith('(') };
  const m = PERIOD_RE.exec(t);
  if (!m) return null;
  const from = Number(m[1]);
  const to = m[2] ? Number(m[2]) : from;
  return { from: Math.min(from, to), to: Math.max(from, to), cancelledHint: t.startsWith('(') };
}

function parseInfo(text, period, hints, subjectNames) {
  const e = {
    periodFrom: period && !period.allDay ? period.from : null,
    periodTo: period && !period.allDay ? period.to : null,
    allDay: !!(period && period.allDay),
    start: null, end: null,
    groups: [],
    subject: null, subjectFrom: null,
    teachers: [], teacherFrom: [], teacherTo: [], teachersAdded: [],
    room: null, roomFrom: null, roomTo: null,
    cancelled: false, absent: false,
    notes: [],
    raw: text,
  };
  let rest = text.trim();
  const tm = TIME_RANGE.exec(rest);
  if (tm) { e.start = pad(tm[1]); e.end = pad(tm[2]); rest = rest.slice(tm[0].length); }

  if (hints.includes('absent') || (ABSENT_RE.test(rest) && !/ - /.test(rest))) {
    e.absent = true;
    e.notes.push(rest.trim() || 'Nieobecność');
    return e;
  }

  const dash = rest.search(/\s[-–]\s/);
  let head = dash >= 0 ? rest.slice(0, dash) : rest;
  const tail = dash >= 0 ? rest.slice(dash).replace(/^\s[-–]\s/, '') : '';

  const gm = /^([^():]{1,30}):\s+(.+)$/.exec(head.trim());
  if (gm) { e.groups = gm[1].split(/\s*,\s*/).filter(Boolean); head = gm[2]; }
  const sc = splitChange(head);
  const subj = (s) => (s ? { short: s, name: (subjectNames && (subjectNames[s] || subjectNames[s.toLowerCase()])) || null } : null);
  if (sc.from !== undefined) { e.subjectFrom = subj(sc.from); e.subject = subj(sc.to); } else { e.subject = subj(sc.to); }

  let last = 'start';
  for (const seg of splitTopLevel(tail)) {
    if (CANCEL_RE.test(seg)) { e.cancelled = true; last = 'cancel'; continue; }

    const plus = /^\+\s*(.+)$/.exec(seg);
    if (plus && NAME_RE.test(plus[1].trim())) { e.teachersAdded.push(plus[1].trim()); last = 'added'; continue; }

    const gone = /^\((.+)\)$/.exec(seg);
    if (gone && splitTopLevel(gone[1]).every((n) => NAME_RE.test(n))) { e.teacherFrom.push(...splitTopLevel(gone[1])); last = 'gone'; continue; }
    const lm = /^([\p{L} ]{3,40}?)\s*:\s*(.*)$/u.exec(seg);
    if (lm) {
      const kind = labelKind(lm[1]);
      const v = splitChange(lm[2].replace(/^[-–]\s+/, ''));
      if (kind === 'teacher') {
        if (v.from !== undefined) {
          e.teacherFrom.push(...splitTopLevel(v.from));
          e.teacherTo.push(v.to);
          last = 'teacherTo';
        } else { e.teachers.push(v.to); last = 'teachers'; }
      } else if (kind === 'room') {
        if (v.from !== undefined) { e.roomFrom = v.from; e.roomTo = v.to; } else e.room = v.to;
        last = 'room';
      } else if (kind === 'subject') {
        if (v.from !== undefined) e.subjectFrom = subj(v.from);
        e.subject = subj(v.to);
        last = 'subject';
      } else if (kind === 'group') {
        e.groups.push(...v.to.split(/\s*,\s*/)); last = 'group';
      } else { e.notes.push(seg); last = 'note'; }
      continue;
    }
    if (NAME_RE.test(seg) && (last === 'start' || last === 'teachers' || last === 'teacherTo')) {
      if (last === 'teacherTo') e.teacherTo.push(seg); else { e.teachers.push(seg); last = 'teachers'; }
      continue;
    }
    if (last === 'note' && /^[a-ząćęłńóśźż0-9]/.test(seg)) {
      e.notes[e.notes.length - 1] += ', ' + seg;
      continue;
    }
    e.notes.push(seg);
    last = 'note';
  }
  if (period && period.cancelledHint) e.cancelled = true;
  if (hints.includes('remove')) e.cancelled = true;
  return e;
}

function extractReportHtml(input) {
  let s = String(input || '');
  const rm = /"report_html"\s*:\s*("(?:[^"\\]|\\.)*")/.exec(s);
  if (rm) {
    try { return JSON.parse(rm[1]); } catch (_) {}
  }
  const i = s.search(/<[^>]+data-date\s*=/);
  if (i >= 0) s = s.slice(i);
  return s;
}

function parseClassList(value) {
  return splitTopLevel(value).map((item) => {
    const m = /^(.*?)\s*(?:\(\s*(\d{1,2})(?:\s*[-–]\s*(\d{1,2}))?\s*\))?$/.exec(item.trim());
    const name = (m ? m[1] : item).trim();
    const from = m && m[2] ? Number(m[2]) : null;
    const to = m && m[3] ? Number(m[3]) : from;
    return { name, from, to };
  }).filter((x) => x.name);
}

function parseSubstitutions(input, opts = {}) {
  const html = extractReportHtml(input);
  const dm = /data-date\s*=\s*["'](\d{4}-\d{2}-\d{2})["']/.exec(html);
  const out = {
    date: dm ? dm[1] : opts.date || null,
    updatedAt: null,
    info: {},
    absentClasses: [],
    empty: false,
    classes: {},
  };
  const lines = htmlToLines(html);
  let current = null;
  let pending = null;
  let inSections = false;

  for (const line of lines) {
    const t = decodeEntities(line.text).trim();
    if (!t) continue;
    if (/asctimetables|edupage\.org/i.test(t)) {
      const um = /(\d{2})\.(\d{2})\.(\d{4})\s+(\d{1,2}:\d{2})/.exec(t);
      if (um) out.updatedAt = `${um[3]}-${um[2]}-${um[1]}T${pad(um[4])}`;
      continue;
    }
    if (NO_SUBST_RE.test(t)) { out.empty = true; pending = null; continue; }

    const period = parsePeriodText(t);
    if (period && current) { pending = { ...period, hints: line.hints }; continue; }

    if (pending || (current && TIME_RANGE.test(t))) {
      const hints = [...new Set([...(pending ? pending.hints : []), ...line.hints])];
      const entry = parseInfo(t, pending, hints, opts.subjectNames);
      (out.classes[current] = out.classes[current] || []).push(entry);
      pending = null;
      continue;
    }

    const lab = /^([^:]{3,45}):\s*(.*)$/.exec(t);
    if (!inSections && lab && !TIME_RANGE.test(t)) {
      out.info[lab[1].trim()] = lab[2].trim();
      if (/klasy|oddzia/i.test(lab[1]) && /nieobec/i.test(lab[1])) out.absentClasses = parseClassList(lab[2]);
      continue;
    }

    if (t.length <= 30) { current = t; inSections = true; pending = null; continue; }
  }
  if (!Object.keys(out.classes).length && !out.empty && !lines.some((l) => /\d:\d\d/.test(l.text))) out.empty = true;
  return out;
}

function normKey(s) { return String(s || '').toLowerCase().replace(/\s+/g, ''); }

function entriesForClass(parsed, cls) {
  const keys = new Set([normKey(cls.short), normKey(cls.name), normKey(String(cls.name || '').split(/\s+/)[0])].filter(Boolean));
  const entries = [];
  for (const [header, list] of Object.entries(parsed.classes || {})) {
    if (keys.has(normKey(header))) entries.push(...list);
  }
  for (const a of parsed.absentClasses || []) {
    if (!keys.has(normKey(a.name))) continue;
    const covered = entries.some((e) => e.absent && (e.allDay || (a.from != null && e.periodFrom <= a.from && e.periodTo >= a.to)));
    if (!covered) {
      entries.push({
        periodFrom: a.from, periodTo: a.to, allDay: a.from == null, start: null, end: null, groups: [],
        subject: null, subjectFrom: null, teachers: [], teacherFrom: [], teacherTo: [], room: null, roomFrom: null, roomTo: null,
        cancelled: false, absent: true, notes: ['Nieobecność klasy'], raw: '',
      });
    }
  }
  return entries;
}

module.exports = { parseSubstitutions, entriesForClass, parseInfo, splitTopLevel, extractReportHtml };

};
  defs['./timetable'] = function (module, exports, require) {
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

};
  defs['./edupage'] = function (module, exports, require) {
'use strict';

const USER_AGENT = 'Mozilla/5.0 (PlanLekcji) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

function normalizeEdupage(input) {
  let s = String(input || '').trim().toLowerCase();
  s = s.replace(/^[a-z]+:\/\//, '').split(/[/?#]/)[0].replace(/:\d+$/, '').replace(/\.$/, '');
  s = s.replace(/\.edupage\.org$/, '');
  return /^[a-z0-9][a-z0-9-]{0,62}$/.test(s) ? s : null;
}

function schoolNameFromHtml(html) {
  const m = /"school_name"\s*:\s*("(?:[^"\\]|\\.)*")/.exec(html || '');
  let name = null;
  if (m) { try { name = JSON.parse(m[1]); } catch (_) { name = null; } }
  if (!name) {
    const t = /<title>([^<]*)<\/title>/i.exec(html || '');
    if (t && t[1].includes('|')) name = t[1].split('|').slice(1).join('|');
  }
  if (!name) return null;
  name = name.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  name = name.split(/,\s*(?:ul\.|ulica|al\.|aleja|os\.|pl\.)\s/i)[0].trim();
  return name || null;
}

function notConfigured() {
  const e = new Error('Nie ustawiono adresu EduPage szkoły.');
  e.code = 'NOT_CONFIGURED';
  return e;
}

function warsawToday(date = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Warsaw' }).format(date);
}

function schoolYear(dateStr = warsawToday()) {
  const [y, m] = dateStr.split('-').map(Number);
  return m >= 8 ? y : y - 1;
}

class EduPageClient {
  constructor({ subdomain = null, base = null, timeoutMs = 20000, log = () => {} } = {}) {
    this.edupage = normalizeEdupage(subdomain);
    this.base = base || (this.edupage ? `https://${this.edupage}.edupage.org` : null);
    this.timeoutMs = timeoutMs;
    this.log = log;
    this._session = null;
  }

  async _fetch(url, opts = {}) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);
    try {
      const res = await fetch(url, {
        ...opts,
        signal: ctrl.signal,
        headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'pl,en;q=0.8', ...(opts.headers || {}) },
      });
      if (!res.ok) throw new Error(`EduPage odpowiedział ${res.status} dla ${url.replace(this.base, '')}`);
      return res;
    } catch (e) {
      if (e.name === 'AbortError') throw new Error(`Przekroczono czas oczekiwania na EduPage (${url.replace(this.base, '')})`);
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }

  async session(force = false) {
    if (!force && this._session && Date.now() - this._session.at < 20 * 60 * 1000) return this._session;
    if (!this.base) throw notConfigured();
    const res = await this._fetch(this.base + '/timetable/');
    const html = await res.text();
    const setCookies = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [res.headers.get('set-cookie')].filter(Boolean);
    const cookie = setCookies.map((c) => c.split(';')[0]).filter(Boolean).join('; ');
    const gsh = (/gsechash\s*=\s*["']([0-9a-fA-F]+)["']/.exec(html) || [])[1] || '00000000';
    const year = Number((/"year_auto"\s*:\s*(\d{4})/.exec(html) || [])[1]) || schoolYear();
    if (!/ASC\.|edupage/i.test(html)) throw new Error('Pod tym adresem nie ma strony EduPage.');
    this._session = { cookie, gsh, year, school: schoolNameFromHtml(html), at: Date.now() };
    return this._session;
  }

  async call(path, args, { retry = true } = {}) {
    const s = await this.session();
    try {
      const res = await this._fetch(this.base + path, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          Accept: 'application/json, text/javascript, */*',
          Referer: this.base + '/timetable/',
          'X-Requested-With': 'XMLHttpRequest',
          ...(s.cookie ? { Cookie: s.cookie } : {}),
        },
        body: JSON.stringify({ __args: args, __gsh: s.gsh }),
      });
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch (_) { throw new Error(`EduPage zwrócił nie-JSON dla ${path}`); }
      if (json && json.r === undefined && json.err) throw new Error(`EduPage: ${JSON.stringify(json.err).slice(0, 200)}`);
      return json;
    } catch (e) {
      if (!retry) throw e;
      this.log(`retrying ${path} with a fresh session: ${e.message}`);
      await this.session(true);
      return this.call(path, args, { retry: false });
    }
  }

  async currentTimetable(today = warsawToday()) {
    const s = await this.session();
    const v = await this.call('/timetable/server/ttviewer.js?__func=getTTViewerData', [null, s.year]);
    const reg = (v && v.r && v.r.regular) || {};
    const list = Array.isArray(reg.timetables) ? reg.timetables : [];
    const visible = list.filter((t) => !t.hidden);
    const started = visible.filter((t) => !t.datefrom || t.datefrom <= today).sort((a, b) => String(b.datefrom).localeCompare(String(a.datefrom)));
    const pick = started[0] || visible.find((t) => String(t.tt_num) === String(reg.default_num)) || visible[0] || list.find((t) => String(t.tt_num) === String(reg.default_num));
    const ttNum = pick ? String(pick.tt_num) : reg.default_num ? String(reg.default_num) : null;
    if (!ttNum) throw new Error('EduPage nie podał żadnego opublikowanego planu');
    return { ttNum, name: pick ? pick.text : null, validFrom: pick ? pick.datefrom : null, year: s.year };
  }

  async regularTimetable(ttNum) {
    return this.call('/timetable/server/regulartt.js?__func=regularttGetData', [null, String(ttNum)]);
  }

  async dictionary() {
    const s = await this.session();
    return this.call('/rpr/server/maindbi.js?__func=mainDBIAccessor', [null, s.year, {}, {
      op: 'fetch',
      needed_part: { teachers: ['short', 'name', 'firstname', 'lastname'], subjects: ['short', 'name'], classes: ['short', 'name'], classrooms: ['short', 'name'] },
      needed_combos: {},
    }]);
  }

  async substitutionHtml(date) {
    const errors = [];
    try {
      const j = await this.call('/substitution/server/viewer.js?__func=getSubstViewerDayDataHtml', [null, { date, mode: 'classes' }]);
      if (j && typeof j.r === 'string') return { html: j.r, via: 'api' };
      errors.push('API zastępstw zwróciło nieoczekiwany format');
    } catch (e) { errors.push(e.message); }

    try {
      const res = await this._fetch(`${this.base}/substitution/?date=${encodeURIComponent(date)}`);
      const html = await res.text();
      const dm = /data-date\\?["']?\s*[:=]\s*\\?["'](\d{4}-\d{2}-\d{2})/.exec(html) || /"date"\s*:\s*"(\d{4}-\d{2}-\d{2})"/.exec(html);
      if (dm && dm[1] !== date) throw new Error(`strona zastępstw pokazała ${dm[1]} zamiast ${date}`);
      return { html, via: 'page' };
    } catch (e) { errors.push(e.message); }
    throw new Error('Nie udało się pobrać zastępstw: ' + errors.join(' / '));
  }
}

module.exports = { EduPageClient, warsawToday, schoolYear, normalizeEdupage, schoolNameFromHtml, notConfigured };

};
  defs['./api'] = function (module, exports, require) {
'use strict';

const { warsawToday } = require('./edupage');
const { listClasses, buildTimetable, subjectDictionary, findClass, slimRaw } = require('./timetable');
const { parseSubstitutions, entriesForClass } = require('./substitutions');

const MIN = 60 * 1000;

function createApi({ client, store, offline = false, timetableTtlMin = 30, substTtlMin = 5, fallback = null, log = () => {} }) {
  const built = new Map();

  function offlineGuard() {
    if (offline) throw new Error('Tryb offline: używam tylko zapisanych danych');
  }

  async function timetableBundle({ force = false } = {}) {
    return store.get('timetable', timetableTtlMin * MIN, async () => {
      offlineGuard();
      const tt = await client.currentTimetable();
      const raw = slimRaw(await client.regularTimetable(tt.ttNum));
      const classes = listClasses(raw);
      if (!classes.length) throw new Error('Plan z EduPage nie zawiera żadnych klas');
      log(`timetable ${tt.ttNum} „${tt.name}” loaded (${classes.length} classes)`);
      return { raw, ttNum: tt.ttNum, name: tt.name, validFrom: tt.validFrom, source: 'api' };
    }, { force });
  }

  async function dictionary() {
    try {
      const rec = await store.get('dictionary', 12 * 60 * MIN, async () => { offlineGuard(); return client.dictionary(); });
      return rec.value;
    } catch (e) {
      log('dictionary unavailable:', e.message);
      return null;
    }
  }

  async function timetableForClass(classQuery, { force = false } = {}) {
    let bundle = null;
    let firstError = null;
    try { bundle = await timetableBundle({ force }); } catch (e) { firstError = e; }
    if (bundle) {
      const key = `${classQuery}|${bundle.fetchedAt}`;
      let tt = built.get(key);
      if (!tt) {
        tt = buildTimetable(bundle.value.raw, classQuery, { ttName: bundle.value.name, validFrom: bundle.value.validFrom });
        if (built.size > 60) built.clear();
        built.set(key, tt);
      }
      return { ...tt, source: bundle.value.source, fetchedAt: bundle.fetchedAt, stale: bundle.stale, error: bundle.error };
    }
    if (!offline && fallback) {
      log(`JSON route failed (${firstError.message}); trying fallback for ${classQuery}`);
      const tt = await fallback(classQuery, store);
      return { ...tt, error: firstError.message };
    }
    throw firstError;
  }

  async function substitutionsForDate(date) {
    const ttl = date < warsawToday() ? 6 * 60 * MIN : substTtlMin * MIN;
    return store.get(`subst-${date}`, ttl, async () => {
      offlineGuard();
      const { html, via } = await client.substitutionHtml(date);
      const parsed = parseSubstitutions(html, { date });
      if (parsed.date && parsed.date !== date) throw new Error(`EduPage zwrócił zastępstwa na ${parsed.date} zamiast ${date}`);
      return { ...parsed, via };
    });
  }

  function nameSubjects(entries, dict) {
    if (!dict) return entries;
    const fill = (s) => (s && !s.name ? { ...s, name: dict[s.short] || dict[String(s.short).toLowerCase()] || null } : s);
    return entries.map((e) => ({ ...e, subject: fill(e.subject), subjectFrom: fill(e.subjectFrom) }));
  }

  async function check(cls) {
    const out = [];
    const ok = (m) => out.push('✓ ' + m);
    const bad = (m) => out.push('✗ ' + m);
    try {
      const s = await client.session(true);
      ok(`strona EduPage odpowiada: ${s.school || client.base} (rok ${s.year})`);
      const tt = await client.currentTimetable();
      ok(`aktualny plan: ${tt.name || tt.ttNum}`);
      const raw = await client.regularTimetable(tt.ttNum);
      const classes = listClasses(raw);
      ok(`liczba klas w planie: ${classes.length}`);
      const pick = cls || (classes[0] && classes[0].name);
      if (pick) {
        const t = buildTimetable(raw, pick);
        ok(`${t.class.name}: ${t.lessons.length} lekcji w tygodniu`);
      }
    } catch (e) { bad((e.code === 'NOT_CONFIGURED' ? '' : 'plan: ') + e.message); return out.join('\n') + '\n'; }
    try {
      const date = warsawToday();
      const { html, via } = await client.substitutionHtml(date);
      const p = parseSubstitutions(html, { date });
      ok(`zastępstwa ${date} (${via}): ${p.empty ? 'brak zastępstw w szkole' : Object.keys(p.classes).length + ' klas ze zmianami'}`);
    } catch (e) { bad('zastępstwa: ' + e.message); }
    return out.join('\n') + '\n';
  }

  async function handle(url) {
    const p = url.pathname;
    const force = url.searchParams.get('refresh') === '1';
    try {
      if (p === '/api/health') {
        const tt = await store.peek('timetable');
        return { status: 200, body: { ok: true, edupage: client.base, today: warsawToday(), timetableCachedAt: tt ? new Date(tt.fetchedAt).toISOString() : null, offline } };
      }
      if (p === '/api/school') {
        const rec = await store.get('school', 12 * 60 * MIN, async () => {
          offlineGuard();
          const s = await client.session();
          return { name: s.school || null, edupage: client.edupage || null, url: client.base };
        }, { force });
        return { status: 200, body: { ...rec.value, stale: rec.stale } };
      }
      if (p === '/api/check') {
        return { status: 200, body: await check(url.searchParams.get('class') || '') };
      }
      if (p === '/api/classes') {
        const b = await timetableBundle({ force });
        return { status: 200, body: { classes: listClasses(b.value.raw), timetable: b.value.name, fetchedAt: b.fetchedAt, stale: b.stale, error: b.error } };
      }
      if (p === '/api/timetable') {
        const cls = url.searchParams.get('class');
        if (!cls) return { status: 400, body: { error: 'Brak parametru class' } };
        try {
          return { status: 200, body: await timetableForClass(cls, { force }) };
        } catch (e) {
          if (e.code === 'CLASS_NOT_FOUND') return { status: 404, body: { error: e.message, code: e.code } };
          throw e;
        }
      }
      if (p === '/api/substitutions') {
        const clsQuery = url.searchParams.get('class') || '';
        const dates = (url.searchParams.get('dates') || warsawToday()).split(',').map((d) => d.trim())
          .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).slice(0, 7);
        if (!clsQuery) return { status: 400, body: { error: 'Brak parametru class' } };
        let cls = { name: clsQuery, short: clsQuery.split(/\s+/)[0] };
        const b = await store.peek('timetable');
        if (b) { const found = findClass(listClasses(b.value.raw), clsQuery); if (found) cls = found; }
        const dict = subjectDictionary(await dictionary(), b && b.value.raw);
        const days = {};
        await Promise.all(dates.map(async (date) => {
          try {
            const rec = await substitutionsForDate(date);
            const v = rec.value;
            days[date] = { entries: nameSubjects(entriesForClass(v, cls), dict), empty: v.empty, updatedAt: v.updatedAt, fetchedAt: rec.fetchedAt, stale: rec.stale, error: rec.error };
          } catch (e) {
            days[date] = { entries: [], error: e.message, unavailable: true };
          }
        }));
        return { status: 200, body: { class: cls, days } };
      }
      return { status: 404, body: { error: 'Nieznany adres API' } };
    } catch (e) {
      log('API error', p, e.message);
      return { status: 503, body: { error: e.message, code: e.code || null } };
    }
  }

  return { handle, timetableBundle };
}

module.exports = { createApi };

};
  defs['./proxyClient'] = function (module, exports, require) {
'use strict';

const { EduPageClient } = require('./edupage');

class ProxyEduPageClient extends EduPageClient {
  constructor({ proxyBase = '', timeoutMs = 25000, log } = {}) {
    super({ base: proxyBase.replace(/\/$/, '') + '/ep', timeoutMs, log });
    this.proxyBase = proxyBase.replace(/\/$/, '');
  }

  async call(path, args) {
    await this.session();
    const sep = path.includes('?') ? '&' : '?';
    const res = await this._fetch(this.base + path + sep + 'args=' + encodeURIComponent(JSON.stringify(args)));
    const text = await res.text();
    try { return JSON.parse(text); } catch (_) { throw new Error(`Pośrednik zwrócił nie-JSON dla ${path}`); }
  }

  async session(force = false) {
    if (!force && this._session && Date.now() - this._session.at < 20 * 60 * 1000) return this._session;
    const res = await fetch(this.proxyBase + '/ep/session' + (force ? '?refresh=1' : ''), { cache: force ? 'no-store' : 'default' });
    let j = {};
    try { j = await res.json(); } catch (_) { j = {}; }
    if (!res.ok) {
      const e = new Error(j.error || `Serwer odpowiedział ${res.status}`);
      e.code = j.code || null;
      throw e;
    }
    this.edupage = j.edupage || null;
    this._session = { cookie: '', gsh: 'proxy', year: Number(j.year) || new Date().getFullYear(), school: j.school || null, at: Date.now() };
    return this._session;
  }
}

module.exports = { ProxyEduPageClient };

};
  var cache = {};
  function req(name) {
    var key = './' + name.replace(/^\.\//, '').replace(/\.js$/, '');
    if (cache[key]) return cache[key].exports;
    if (!defs[key]) throw new Error('plan-lib: missing module ' + name);
    var m = { exports: {} }; cache[key] = m; defs[key](m, m.exports, req); return m.exports;
  }
  self.PlanLib = { createApi: req('./api').createApi, ProxyEduPageClient: req('./proxyClient').ProxyEduPageClient, EduPageClient: req('./edupage').EduPageClient, normalizeEdupage: req('./edupage').normalizeEdupage };
})();
