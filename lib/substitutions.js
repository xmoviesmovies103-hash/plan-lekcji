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
