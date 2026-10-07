(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PlanCore = factory();
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DAY_NAMES = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];
  const DAY_SHORT = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];

  function toMin(hhmm) {
    const m = /^(\d{1,2}):(\d{2})/.exec(hhmm || '');
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  }
  function fmtMin(min) {
    return String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0');
  }
  function isoDate(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function parseIso(s) {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  }

  function weekdayIndex(date) { return (date.getDay() + 6) % 7; }

  function weekDates(date, offset) {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
    d.setDate(d.getDate() - weekdayIndex(d) + 7 * (offset || 0));
    const out = [];
    for (let i = 0; i < 5; i++) { out.push(isoDate(d)); d.setDate(d.getDate() + 1); }
    return out;
  }

  function normGroup(g) {
    return String(g || '').toLowerCase().replace(/^(grupa|gr\.?|g)\s*(?=\d)/, '').trim();
  }
  function normName(n) {
    return String(n || '').toLowerCase().split(/\s+/).filter(Boolean).sort().join(' ');
  }
  function sameSubject(a, b) {
    if (!a || !b) return false;
    const n = (s) => String(s || '').toLowerCase().trim();
    return (a.name && b.name && n(a.name) === n(b.name)) || (a.short && b.short && n(a.short) === n(b.short));
  }

  function groupVisible(groups, divisions, prefs) {
    if (!groups || !groups.length) return true;
    const sel = (prefs && prefs.groups) || {};
    return groups.some((g) => {
      const div = (divisions || []).find((d) => d.groups.some((x) => normGroup(x) === normGroup(g)));
      if (!div) return true;
      const choice = sel[div.id];
      if (!choice || choice === '*') return true;
      if (choice === 'none') return false;
      return normGroup(choice) === normGroup(g);
    });
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function periodRange(entry, periods) {
    if (entry.allDay) return [periods[0] ? periods[0].n : 1, periods.length ? periods[periods.length - 1].n : 20];
    let from = entry.periodFrom;
    let to = entry.periodTo;
    if (from == null && entry.start) {
      const p = periods.find((x) => x.start === entry.start);
      if (p) from = p.n;
    }
    if (to == null && entry.end) {
      const p = periods.find((x) => x.end === entry.end);
      if (p) to = p.n;
    }
    if (from == null) return null;
    return [from, to == null ? from : to];
  }

  function teacherNames(list) { return (list || []).map((t) => (typeof t === 'string' ? t : t.name)).filter(Boolean); }

  function mergeDay(tt, day, entries, prefs) {
    const periods = tt.periods || [];
    const byN = new Map(periods.map((p) => [p.n, p]));
    const items = (tt.lessons || []).filter((l) => l.day === day).map((l) => ({
      ...clone(l), teachers: teacherNames(l.teachers), status: 'normal', changes: {}, notes: [], sources: [],
    }));

    for (const e of entries || []) {
      const range = periodRange(e, periods);
      if (!range) continue;
      const [from, to] = range;
      let targets = items.filter((l) => l.status !== 'added' && l.from <= to && l.to >= from);
      if (e.groups && e.groups.length) {
        const eg = e.groups.map(normGroup);
        targets = targets.filter((l) => !l.groups.length || l.groups.some((g) => eg.includes(normGroup(g))));
      }
      if (targets.length > 1) {
        const subj = e.subjectFrom || e.subject;
        const bySubj = targets.filter((l) => sameSubject(l.subject, subj));
        if (bySubj.length) targets = bySubj;
      }

      if (e.absent) {
        targets.forEach((l) => { l.status = 'absent'; l.notes.push(...(e.notes || [])); l.sources.push(e); });
        continue;
      }

      if (!targets.length) {
        const pf = byN.get(from); const pt = byN.get(to);
        const subj = e.subject || e.subjectFrom || { name: null, short: '?' };
        items.push({
          id: `sub-${from}-${items.length}`,
          day, from, to,
          start: e.start || (pf && pf.start), end: e.end || (pt && pt.end),
          subject: { name: subj.name || subj.short, short: subj.short },
          teachers: e.teacherTo.length ? e.teacherTo.slice() : e.teachers.slice(),
          rooms: [e.roomTo || e.room].filter(Boolean),
          groups: (e.groups || []).slice(),
          status: e.cancelled ? 'cancelled' : 'added',
          changes: {}, notes: (e.notes || []).slice(), sources: [e],
        });
        continue;
      }

      for (const l of targets) {
        l.sources.push(e);
        l.notes.push(...(e.notes || []).filter((n) => !l.notes.includes(n)));
        if (e.cancelled) { l.status = 'cancelled'; continue; }
        if (e.subjectFrom && e.subject && !sameSubject(l.subject, e.subject)) {
          l.changes.subject = { from: l.subject, to: { name: e.subject.name || e.subject.short, short: e.subject.short } };
        }
        const added = e.teachersAdded || [];
        if (e.teacherTo && e.teacherTo.length) {
          l.changes.teacher = { from: e.teacherFrom.length ? e.teacherFrom.slice() : l.teachers.slice(), to: e.teacherTo.concat(added) };
        } else if (e.teachers && e.teachers.length) {
          const same = e.teachers.map(normName).sort().join('|') === l.teachers.map(normName).sort().join('|');
          if (!same || added.length) l.changes.teacher = { from: e.teacherFrom.length ? e.teacherFrom.slice() : (same ? [] : l.teachers.slice()), to: e.teachers.concat(added) };
        } else if (added.length) {
          l.changes.teacher = { from: [], to: l.teachers.concat(added) };
        } else if (e.teacherFrom && e.teacherFrom.length) {
          l.changes.teacher = { from: e.teacherFrom.slice(), to: [] };
        }
        const newRoom = e.roomTo || e.room;
        if (newRoom && !l.rooms.includes(newRoom)) {
          l.changes.room = { from: e.roomFrom || l.rooms.join(', ') || null, to: newRoom };
        }
        if (Object.keys(l.changes).length && l.status === 'normal') l.status = 'changed';
      }
    }

    return items
      .filter((l) => groupVisible(l.groups, tt.divisions, prefs))
      .sort((a, b) => a.from - b.from || (a.groups.join() || '').localeCompare(b.groups.join() || '', 'pl', { numeric: true }));
  }

  function effective(l) {
    return {
      subject: (l.changes.subject && l.changes.subject.to) || l.subject,
      teachers: (l.changes.teacher && l.changes.teacher.to) || l.teachers,
      rooms: l.changes.room ? [l.changes.room.to] : l.rooms,
    };
  }

  function isActive(l) { return l.status !== 'cancelled' && l.status !== 'absent'; }

  function buildTimeline(items) {
    const slots = [];
    for (const l of items) {
      const last = slots[slots.length - 1];
      if (last && l.from <= last.to) {
        last.items.push(l);
        last.to = Math.max(last.to, l.to);
        if (toMin(l.end) > toMin(last.end)) last.end = l.end;
      } else {
        slots.push({ type: 'slot', key: 's' + l.from, from: l.from, to: l.to, start: l.start, end: l.end, items: [l] });
      }
    }
    const rows = [];
    slots.forEach((s, i) => {
      s.active = s.items.some(isActive);
      if (i > 0) {
        const prev = slots[i - 1];
        const gap = toMin(s.start) - toMin(prev.end);
        if (s.from - prev.to > 1) rows.push({ type: 'free', key: 'f' + s.from, start: prev.end, end: s.start, minutes: gap, periods: s.from - prev.to - 1 });
        else if (gap > 0) rows.push({ type: 'break', key: 'b' + s.from, start: prev.end, end: s.start, minutes: gap });
      }
      rows.push(s);
    });
    return rows;
  }

  function nowState(rows, nowMin) {
    const slots = rows.filter((r) => r.type === 'slot');
    const active = slots.filter((s) => s.active);
    if (!active.length) return { type: 'none' };
    const first = active[0];
    const last = active[active.length - 1];
    const nextActive = (min) => active.find((s) => toMin(s.start) > min) || null;

    if (nowMin < toMin(first.start)) return { type: 'before', next: first, minutesLeft: toMin(first.start) - nowMin };
    if (nowMin >= toMin(last.end)) return { type: 'after' };

    const slot = slots.find((s) => nowMin >= toMin(s.start) && nowMin < toMin(s.end));
    if (slot && slot.active) {
      const st = toMin(slot.start); const en = toMin(slot.end);
      const cur = slot.items.filter(isActive);
      return { type: 'lesson', slot, key: slot.key, items: cur, next: nextActive(nowMin), minutesLeft: en - nowMin, progress: (nowMin - st) / Math.max(1, en - st) };
    }
    const next = nextActive(nowMin);
    if (slot) return { type: 'free', reason: 'cancelled', key: slot.key, next, minutesLeft: next ? toMin(next.start) - nowMin : 0 };
    const gapRow = rows.find((r) => r.type !== 'slot' && nowMin >= toMin(r.start) && nowMin < toMin(r.end));
    if (gapRow && gapRow.type === 'break' && next && toMin(next.start) === toMin(gapRow.end)) {
      return { type: 'break', key: gapRow.key, next, minutesLeft: toMin(gapRow.end) - nowMin };
    }
    return { type: 'free', key: gapRow ? gapRow.key : null, next, minutesLeft: next ? toMin(next.start) - nowMin : 0 };
  }

  return {
    DAY_NAMES, DAY_SHORT, toMin, fmtMin, isoDate, parseIso, weekdayIndex, weekDates,
    normGroup, groupVisible, mergeDay, effective, isActive, buildTimeline, nowState,
  };
}));
