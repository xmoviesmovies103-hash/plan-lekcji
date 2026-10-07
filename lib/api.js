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
