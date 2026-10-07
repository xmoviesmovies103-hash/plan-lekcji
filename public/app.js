(function () {
  'use strict';
  const C = window.PlanCore;
  const CFG = Object.assign({ apiBase: '' }, window.PLAN_CONFIG || {});
  const DEMO = window.PLAN_DEMO || null;

  const REFRESH_SUBST_MS = 5 * 60 * 1000;
  const REFRESH_TT_MS = 30 * 60 * 1000;
  const TICK_MS = 15 * 1000;

  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} },
    del(k) { try { localStorage.removeItem(k); } catch (_) {} },
  };
  const hhmm = (d) => String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  const ddmm = (iso) => iso.slice(8, 10) + '.' + iso.slice(5, 7);
  const hash = (o) => { const s = JSON.stringify(o); let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; };
  const minutesWord = (n) => (n === 1 ? 'minuta' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? 'minuty' : 'minut');
  const inMinutes = (n) => (n >= 60 ? `${Math.floor(n / 60)} h ${n % 60 ? (n % 60) + ' min' : ''}`.trim() : `${n} ${minutesWord(n)}`);

  const params = new URLSearchParams(location.search);
  let simStart = null;
  const loadedAt = Date.now();
  const simParam = params.get('teraz') || params.get('now');
  if (simParam) { const d = new Date(simParam); if (!isNaN(d)) simStart = d; }
  function now() { return simStart ? new Date(simStart.getTime() + (Date.now() - loadedAt)) : new Date(); }
  function setSim(date) { simStart = date; render(); }

  const state = {
    cls: LS.get('plan.class', null),
    school: LS.get('plan.school', null),
    tt: null,
    ttMeta: { fetchedAt: null, error: null, stale: false },
    subst: {},
    substError: null,
    prefs: {},
    weekOffset: 0,
    selected: null,
    view: LS.get('plan.view', window.innerWidth > 900 ? 'day' : 'day'),
    lastSync: null,
    loading: false,
  };
  const prefsKey = () => 'plan.prefs.' + (state.cls ? state.cls.name : '');
  const ttKey = () => 'plan.tt.' + (state.cls ? state.cls.name : '');
  const substKey = () => 'plan.subst.' + (state.cls ? state.cls.name : '');

  let localApi = null;
  function browserStore() {
    const mem = new Map(); const inflight = new Map();
    const read = (k) => { if (mem.has(k)) return mem.get(k); const r = LS.get('plan.store.' + k, null); if (r) mem.set(k, r); return r; };
    return {
      peek: read,
      async get(k, ttl, loader, opts) {
        const cached = read(k);
        if (!(opts && opts.force) && cached && Date.now() - cached.fetchedAt < ttl) return { ...cached, stale: false, error: null };
        if (!inflight.has(k)) inflight.set(k, (async () => {
          try { const rec = { value: await loader(), fetchedAt: Date.now() }; mem.set(k, rec); LS.set('plan.store.' + k, rec); return { ...rec, stale: false, error: null }; }
          finally { inflight.delete(k); }
        })());
        try { return await inflight.get(k); } catch (e) { if (cached) return { ...cached, stale: true, error: e.message }; throw e; }
      },
    };
  }
  function getLocalApi() {
    if (!localApi) {
      const lib = window.PlanLib;
      const client = new lib.ProxyEduPageClient({ proxyBase: CFG.apiBase || location.origin });
      localApi = lib.createApi({ client, store: browserStore() });
    }
    return localApi;
  }

  async function api(path) {
    if (DEMO) return DEMO.api(path);
    if (CFG.mode === 'proxy' && window.PlanLib) {
      const r = await getLocalApi().handle(new URL(path, location.origin));
      if (r.status >= 400) throw apiError(r.body, r.status);
      return r.body;
    }
    const res = await fetch(CFG.apiBase + path, { cache: 'no-store' });
    let body = null;
    try { body = /json/.test(res.headers.get('content-type') || '') ? await res.json() : await res.text(); } catch (_) {}
    if (!res.ok) throw apiError(body, res.status);
    return body;
  }

  function apiError(body, status) {
    const e = new Error((body && body.error) || `Serwer odpowiedział ${status}`);
    e.code = (body && body.code) || null;
    return e;
  }

  function todayIso() { return C.isoDate(now()); }
  function isWeekend(d) { return C.weekdayIndex(d) >= 5; }
  function visibleWeek() {
    const n = now();
    return C.weekDates(n, state.weekOffset + (isWeekend(n) ? 1 : 0));
  }
  function nextSchoolDay(fromIso) {
    const d = C.parseIso(fromIso);
    do { d.setDate(d.getDate() + 1); } while (isWeekend(d));
    return C.isoDate(d);
  }

  function dayItems(iso) {
    if (!state.tt) return [];
    const idx = C.weekdayIndex(C.parseIso(iso));
    const sub = state.subst[iso];
    return C.mergeDay(state.tt, idx, sub ? sub.entries : [], state.prefs);
  }

  async function loadTimetable(force) {
    try {
      const tt = await api('/api/timetable?class=' + encodeURIComponent(state.cls.name) + (force ? '&refresh=1' : ''));
      const prev = state.tt;
      state.tt = tt;
      state.ttMeta = { fetchedAt: tt.fetchedAt || Date.now(), error: tt.stale ? tt.error : null, stale: !!tt.stale };
      if (tt.class && tt.class.name && tt.class.name !== state.cls.name) {
        state.cls = { ...state.cls, ...tt.class };
        LS.set('plan.class', state.cls);
      }
      LS.set(ttKey(), { tt, savedAt: Date.now() });
      if (prev && prev.hash && tt.hash && prev.hash !== tt.hash) toast('Plan lekcji w EduPage się zmienił. Pokazuję nową wersję.');
      state.lastSync = Date.now();
    } catch (e) {
      if (e.code === 'CLASS_NOT_FOUND') {
        const old = state.cls && state.cls.name;
        state.cls = null; state.tt = null;
        LS.del('plan.class');
        toast(`W planie szkoły nie ma już klasy ${old}. Wybierz klasę.`);
        showPicker(false);
        return;
      }
      state.ttMeta = { ...state.ttMeta, error: e.message, stale: !!state.tt };
    }
  }

  async function loadSubstitutions() {
    const dates = [...new Set([...visibleWeek(), ...(isWeekend(now()) ? [] : [todayIso()])])];
    try {
      const res = await api('/api/substitutions?class=' + encodeURIComponent(state.cls.name) + '&dates=' + dates.join(','));
      let changed = false;
      for (const [date, d] of Object.entries(res.days || {})) {
        const old = state.subst[date];
        if (d.unavailable && old && !old.unavailable) { old.error = d.error; old.stale = true; continue; }
        if (old && !old.unavailable && hash(old.entries) !== hash(d.entries) && date >= todayIso()) changed = true;
        state.subst[date] = d;
      }
      state.substError = Object.values(res.days || {}).some((d) => d.unavailable) ? 'Część zastępstw jest chwilowo niedostępna.' : null;
      const keep = {};
      Object.keys(state.subst).sort().slice(-15).forEach((k) => { keep[k] = state.subst[k]; });
      state.subst = keep;
      LS.set(substKey(), keep);
      if (changed) toast('Są nowe zmiany w zastępstwach.');
      state.lastSync = Date.now();
    } catch (e) {
      state.substError = e.message;
    }
  }

  async function refreshAll(force) {
    if (!state.cls) return;
    state.loading = true;
    render();
    await loadTimetable(force);
    if (!state.cls) { state.loading = false; return; }
    await loadSubstitutions();
    state.loading = false;
    render();
  }

  function describe(item) {
    const eff = C.effective(item);
    return {
      subject: eff.subject.name || eff.subject.short,
      teacher: eff.teachers.join(', '),
      room: eff.rooms.join(', '),
    };
  }

  function nowLine(items) {
    return items.map((it) => {
      const d = describe(it);
      const parts = [`<strong>${esc(d.subject)}</strong>${it.groups.length ? ` <span class="grp">gr. ${esc(it.groups.join(', '))}</span>` : ''}`];
      if (d.teacher) parts.push(it.changes.teacher ? `<span class="chg">${esc(d.teacher)}</span>` : esc(d.teacher));
      if (d.room) parts.push(it.changes.room ? `<span class="chg">sala ${esc(d.room)}</span>` : `sala ${esc(d.room)}`);
      return parts.join(', ');
    }).join('<br>');
  }

  function metaLine(it) {
    const d = describe(it);
    const parts = [];
    if (d.teacher) parts.push(it.changes.teacher ? `<span class="chg">${esc(d.teacher)}</span>` : esc(d.teacher));
    if (d.room) parts.push(it.changes.room ? `<span class="chg">sala ${esc(d.room)}</span>` : `sala ${esc(d.room)}`);
    if (it.groups.length) parts.push(`grupa ${esc(it.groups.join(', '))}`);
    return parts.join(', ');
  }

  function slotSummary(slot) {
    const act = slot.items.filter(C.isActive);
    return act.map((it) => {
      const d = describe(it);
      return `<b>${esc(d.subject)}</b>${d.room ? ', sala ' + esc(d.room) : ''}${it.groups.length ? ' (gr. ' + esc(it.groups.join(', ')) + ')' : ''}`;
    }).join(' / ');
  }

  function renderNow() {
    const el = $('#now');
    if (!state.tt) { el.className = 'now'; el.innerHTML = '<p class="now-title">Wczytuję plan…</p>'; return; }
    const n = now();
    const nowMin = n.getHours() * 60 + n.getMinutes();
    const iso = todayIso();
    const dateLine = `<p class="now-date">${C.DAY_NAMES[C.weekdayIndex(n)]}, ${n.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}, godz. ${hhmm(n)}</p>`;

    if (isWeekend(n)) {
      el.className = 'now';
      el.innerHTML = `${dateLine}<h2 class="now-title">Weekend, dziś nie ma lekcji</h2>${firstLessonLine(nextSchoolDay(iso))}`;
      return;
    }
    const rows = C.buildTimeline(dayItems(iso));
    const st = C.nowState(rows, nowMin);
    let title = ''; let sub = ''; let next = ''; let progress = ''; let cls = 'now';

    if (st.type === 'lesson') {
      cls += ' is-lesson';
      const names = st.items.map((i) => describe(i).subject);
      title = `<span class="lbl">Teraz:</span> ${esc(names.join(' / '))}`;
      sub = st.items.length === 1 ? metaLine(st.items[0]) : nowLine(st.items);
      const pct = Math.round(Math.min(1, Math.max(0, st.progress)) * 100);
      progress = `<div class="progress"><div class="bar"><span style="width:${pct}%"></span></div>
        <div class="progress-text"><span>Lekcja ${st.slot.from}, ${st.slot.start}–${st.slot.end}</span><span>zostało ${inMinutes(st.minutesLeft)}</span></div></div>`;
      if (st.next) next = `Następnie o ${st.next.start}: ${slotSummary(st.next)}`;
    } else if (st.type === 'break') {
      cls += ' is-break';
      title = '<span class="lbl">Teraz:</span> Przerwa';
      sub = `Do ${st.next.start}, jeszcze ${inMinutes(st.minutesLeft)}`;
      next = `Następnie: ${slotSummary(st.next)}`;
    } else if (st.type === 'free') {
      cls += ' is-break';
      title = `<span class="lbl">Teraz:</span> ${st.reason === 'cancelled' ? 'wolne (lekcja odwołana)' : 'okienko'}`;
      sub = st.next ? `Następna lekcja o ${st.next.start}, za ${inMinutes(st.minutesLeft)}` : '';
      if (st.next) next = `Następnie: ${slotSummary(st.next)}`;
    } else if (st.type === 'before') {
      title = `Lekcje zaczynają się o ${st.next.start}`;
      sub = `Za ${inMinutes(st.minutesLeft)}`;
      next = `Pierwsza lekcja: ${slotSummary(st.next)}`;
    } else if (st.type === 'after') {
      title = 'Na dzisiaj koniec lekcji';
      next = firstLessonText(nextSchoolDay(iso));
    } else {
      title = 'Dziś nie masz lekcji';
      sub = rows.length ? 'Wszystkie lekcje są odwołane albo klasa jest nieobecna.' : '';
      next = firstLessonText(nextSchoolDay(iso));
    }
    el.className = cls;
    el.innerHTML = `${dateLine}<h2 class="now-title">${title}</h2>${sub ? `<p class="now-sub">${sub}</p>` : ''}${progress}${next ? `<p class="now-next">${next}</p>` : ''}`;
  }

  function firstLessonText(iso) {
    const rows = C.buildTimeline(dayItems(iso));
    const first = rows.find((r) => r.type === 'slot' && r.active);
    const d = C.parseIso(iso);
    const tomorrow = C.isoDate(new Date(now().getTime() + 86400000)) === iso;
    const name = tomorrow ? 'Jutro' : `W ${['poniedziałek', 'wtorek', 'środę', 'czwartek', 'piątek'][C.weekdayIndex(d)] || ''}`;
    return first ? `${name} pierwsza lekcja o <b>${first.start}</b>: ${slotSummary(first)}` : `${name} nie ma lekcji w planie.`;
  }

  function firstLessonLine(iso) { return `<p class="now-next">${firstLessonText(iso)}</p>`; }

  function renderBanner() {
    const el = $('#banner');
    const msgs = [];
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    const savedAt = state.ttMeta.fetchedAt ? hhmm(new Date(state.ttMeta.fetchedAt)) : null;
    const savedDay = state.ttMeta.fetchedAt ? new Date(state.ttMeta.fetchedAt).toLocaleDateString('pl-PL') : '';
    if (offline) msgs.push(['bad', `Brak internetu. Pokazuję plan zapisany ${savedDay} o ${savedAt || '—'}. Odświeżę, gdy połączenie wróci.`]);
    else if (state.ttMeta.error && state.tt) msgs.push(['', `Nie udało się teraz pobrać planu z EduPage (${esc(state.ttMeta.error)}). Pokazuję ostatnio zapisaną wersję z ${savedDay}, ${savedAt}. Ponowię próbę za kilka minut.`]);
    if (!offline && state.substError) msgs.push(['', `Zastępstwa: ${esc(state.substError)} Pokazuję ostatnio pobrane informacje.`]);
    el.innerHTML = msgs.map(([k, t]) => `<div class="notice ${k}"><p>${t}</p><button class="btn" type="button" data-act="retry">Spróbuj teraz</button></div>`).join('');
  }

  function renderTabs() {
    const week = visibleWeek();
    if (!state.selected || !week.includes(state.selected)) state.selected = week.includes(todayIso()) ? todayIso() : week[0];
    $('#dayTabs').innerHTML = week.map((iso, i) => {
      const sub = state.subst[iso];
      const hasChanges = sub && sub.entries && sub.entries.length && dayItems(iso).some((l) => l.status !== 'normal');
      const isToday = iso === todayIso();
      const tag = isToday ? '<span class="tag today-tag">dzisiaj</span>' : hasChanges ? '<span class="tag chg-tag">zmiany</span>' : '<span class="tag"></span>';
      return `<button class="day-tab${isToday ? ' today' : ''}" role="tab" type="button" data-date="${iso}" aria-selected="${iso === state.selected}">
        <span class="d">${C.DAY_SHORT[i]}</span><span class="n">${ddmm(iso)}</span>${tag}</button>`;
    }).join('');
    document.querySelectorAll('.switch-btn').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === state.view)));
    const d = C.parseIso(state.selected);
    const isToday = state.selected === todayIso();
    $('#dayTitle').innerHTML = state.view === 'week'
      ? `Tydzień ${ddmm(week[0])}–${ddmm(week[4])}`
      : `${C.DAY_NAMES[C.weekdayIndex(d)]}<span class="date">${d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}${isToday ? ', dzisiaj' : ''}</span>`;
  }

  function changeCells(it) {
    const subj = it.changes.subject
      ? `<s>${esc(it.changes.subject.from.name)}</s><span class="arrow">→</span><span class="subj">${esc(it.changes.subject.to.name || it.changes.subject.to.short)}</span>`
      : `<span class="subj">${esc(it.subject.name)}</span>`;
    const teacher = it.changes.teacher
      ? `${it.changes.teacher.from.length ? `<s>${esc(it.changes.teacher.from.join(', '))}</s><span class="arrow">→</span>` : ''}<span class="to">${esc(it.changes.teacher.to.join(', '))}</span>`
      : esc(it.teachers.join(', '));
    const room = it.changes.room
      ? `<span class="room-lbl">Sala </span>${it.changes.room.from ? `<s>${esc(it.changes.room.from)}</s><span class="arrow">→</span>` : ''}<span class="to">${esc(it.changes.room.to)}</span>`
      : (it.rooms.length ? `<span class="room-lbl">Sala </span>${esc(it.rooms.join(', '))}` : '');
    return { subj, teacher, room };
  }

  function changeLabel(it) {
    if (it.changes.teacher) return 'Zastępstwo';
    if (it.changes.subject) return 'Zmiana przedmiotu';
    if (it.changes.room) return 'Zmiana sali';
    return 'Zmiana';
  }

  function badges(it, isNow) {
    const b = [];
    if (isNow) b.push('<span class="label live">Teraz</span>');
    if (it.status === 'cancelled') b.push('<span class="label cancel">ODWOŁANA</span>');
    else if (it.status === 'absent') b.push('<span class="label absent">Klasa nieobecna</span>');
    else if (it.status === 'added') b.push('<span class="label added">Dodatkowa</span>');
    else if (it.status === 'changed') b.push(`<span class="label">${changeLabel(it)}</span>`);
    return b.join('');
  }

  function renderDay() {
    const iso = state.selected;
    const items = dayItems(iso);
    const rows = C.buildTimeline(items);
    const isToday = iso === todayIso();
    const n = now();
    const nowMin = n.getHours() * 60 + n.getMinutes();
    const st = isToday ? C.nowState(rows, nowMin) : { type: 'none' };
    if (!items.length) {
      return `<div class="empty"><strong>Brak lekcji</strong>${state.tt ? 'W planie nie ma lekcji na ten dzień.' : 'Plan jeszcze się nie wczytał.'}</div>`;
    }
    let html = `<table class="day"><thead><tr><th class="c-num">Nr</th><th>Godziny</th><th>Przedmiot</th><th>Nauczyciel</th><th>Sala</th><th>Zmiany</th><th><span class="sr-only">Szczegóły</span></th></tr></thead><tbody>`;
    for (const r of rows) {
      if (r.type !== 'slot') {
        const isNowGap = isToday && st.key === r.key;
        const label = r.type === 'break' ? `Przerwa, ${r.minutes} min` : `Okienko (${r.periods > 1 ? r.periods + ' lekcje' : '1 lekcja'})`;
        html += `<tr class="gap ${r.type}${isNowGap ? ' is-now' : ''}"><td colspan="7"><div class="gap-in"><span class="gap-time">${r.start}–${r.end}</span><span>${isNowGap ? 'Teraz: ' : ''}${label}</span></div></td></tr>`;
        continue;
      }
      r.items.forEach((it, i) => {
        const isNow = isToday && st.type === 'lesson' && st.key === r.key && C.isActive(it);
        const past = isToday && C.toMin(r.end) <= nowMin;
        const c = changeCells(it);
        const k = ['lesson', 'st-' + it.status];
        if (isNow) k.push('is-now');
        if (past) k.push('is-past');
        if (i > 0) k.push('same-slot');
        if (i < r.items.length - 1) k.push('has-next');
        const num = it.from === it.to ? it.from : `${it.from}–${it.to}`;
        const notes = it.notes.filter((x) => !/^nieobecno/i.test(x)).map((x) => `<span class="note">${esc(x)}</span>`).join('');
        html += `<tr class="${k.join(' ')}">
          <td class="c-num">${i > 0 ? '' : num}</td>
          <td class="c-time"><span class="t1">${it.start}</span><span class="sep">–</span><span class="t2">${it.end}</span><span class="mnum">lekcja ${num}</span></td>
          <td class="c-subj">${c.subj}${it.groups.length ? `<span class="grp">gr. ${esc(it.groups.join(', '))}</span>` : ''}${notes}</td>
          <td class="c-teacher">${c.teacher}</td>
          <td class="c-room">${c.room}</td>
          <td class="c-info">${badges(it, isNow)}</td>
          <td class="c-more"><button class="info-btn" type="button" data-detail="${esc(iso)}|${esc(it.id)}" aria-label="Szczegóły: ${esc(it.subject.name)}, lekcja ${num}">?</button></td>
        </tr>`;
      });
    }
    return html + '</tbody></table>';
  }

  function renderWeek() {
    const week = visibleWeek();
    const today = todayIso();
    const perDay = week.map((iso) => dayItems(iso));
    const used = perDay.flat();
    if (!used.length) return '<div class="empty"><strong>Brak lekcji</strong>W tym tygodniu plan jest pusty.</div>';
    const minP = Math.min(...used.map((l) => l.from));
    const maxP = Math.max(...used.map((l) => l.to));
    const periods = state.tt.periods.filter((p) => p.n >= minP && p.n <= maxP);
    const n = now(); const nowMin = n.getHours() * 60 + n.getMinutes();
    const todaySt = week.includes(today) ? C.nowState(C.buildTimeline(perDay[week.indexOf(today)]), nowMin) : null;

    let html = `<div class="week-wrap"><table class="week"><thead><tr><th class="pcol">Lekcja</th>`;
    week.forEach((iso, i) => { html += `<th class="${iso === today ? 'today' : ''}">${C.DAY_NAMES[i]}<br><span style="font-weight:400">${ddmm(iso)}</span></th>`; });
    html += '</tr></thead><tbody>';
    for (const p of periods) {
      html += `<tr><th class="pcol"><b>${p.n}</b>${p.start}</th>`;
      week.forEach((iso, i) => {
        const items = perDay[i].filter((l) => l.from === p.n);
        const cont = perDay[i].some((l) => l.from < p.n && l.to >= p.n);
        const cells = items.map((it) => {
          const eff = C.effective(it);
          const isNow = iso === today && todaySt && todaySt.type === 'lesson' && todaySt.items.includes(it);
          return `<button type="button" class="wcell st-${it.status}${isNow ? ' is-now' : ''}" data-detail="${esc(iso)}|${esc(it.id)}">
            <b>${esc(eff.subject.name || eff.subject.short)}</b><span>${esc(eff.rooms.join(', ') || '')}${it.groups.length ? `, gr. ${esc(it.groups.join(', '))}` : ''}</span></button>`;
        }).join('');
        html += `<td class="${iso === today ? 'today' : 'other'}">${cells || (cont ? '<span class="sr-only">ciąg dalszy</span>' : '')}</td>`;
      });
      html += '</tr>';
    }
    return html + '</tbody></table></div>';
  }

  function renderGroupPrompt() {
    const el = $('#groupPrompt');
    if (!state.tt || state.prefs.asked) { el.innerHTML = ''; return; }
    const div = (state.tt.divisions || []).find((d) => d.groups.length > 1);
    if (!div) { el.innerHTML = ''; return; }
    el.innerHTML = `<div class="notice info"><p>Klasa jest podzielona na grupy ${div.groups.map(esc).join(' i ')}. Wybierz swoją, żeby widzieć tylko swoje lekcje.</p>
      <div class="btns">${div.groups.map((g) => `<button class="btn" type="button" data-group="${esc(div.id)}|${esc(g)}">Grupa ${esc(g)}</button>`).join('')}
      <button class="btn" type="button" data-group="${esc(div.id)}|*">Pokazuj obie</button></div></div>`;
  }

  function renderFoot() {
    const parts = [];
    if (state.loading) parts.push('<span>Pobieram dane z EduPage…</span>');
    else if (state.lastSync) parts.push(`<span${state.ttMeta.error || state.substError ? ' class="warn"' : ''}>Ostatnia aktualizacja: ${hhmm(new Date(state.lastSync))}</span>`);
    else if (state.ttMeta.fetchedAt) parts.push(`<span class="warn">Dane zapisane ${new Date(state.ttMeta.fetchedAt).toLocaleString('pl-PL')}</span>`);
    parts.push('<button class="link-btn" type="button" data-act="retry">Odśwież</button>');
    if (state.tt && state.tt.timetable) parts.push(`<span>Plan: ${esc(state.tt.timetable)}</span>`);
    const sch = state.school;
    if (sch && sch.edupage) parts.push(`<span>Dane: <a href="https://${esc(sch.edupage)}.edupage.org/timetable/" target="_blank" rel="noopener">EduPage${sch.name ? ' ' + esc(sch.name) : ''}</a></span>`);
    parts.push('<span>Strona nieoficjalna, nie jest prowadzona przez szkołę.</span>');
    parts.push('<span>Autor: <a href="https://github.com/xmoviesmovies103-hash/plan-lekcji" target="_blank" rel="noopener">Kacper Studio</a></span>');
    $('#foot').innerHTML = parts.join('');
  }

  function render() {
    if (!state.cls) return;
    $('#classBtn').innerHTML = `<span class="cls-lbl">Klasa: </span><b>${esc(state.cls.short || state.cls.name)}</b>`;
    $('#classBtn').setAttribute('aria-label', `Klasa ${state.cls.name}. Zmień klasę`);
    $('#headNav').hidden = false;
    renderInstallHint();
    renderNow();
    renderPushCard();
    renderBanner();
    renderTabs();
    renderGroupPrompt();
    const plan = $('#plan');
    if (!state.tt) {
      plan.innerHTML = state.ttMeta.error
        ? `<div class="empty"><strong>Nie udało się pobrać planu</strong>${esc(state.ttMeta.error)}<br><br><button class="btn primary" type="button" data-act="retry">Spróbuj ponownie</button></div>`
        : '<div class="empty"><strong>Wczytuję plan z EduPage…</strong>To potrwa kilka sekund.</div>';
    } else {
      const wrapOld = plan.querySelector('.week-wrap');
      const keepScroll = wrapOld ? wrapOld.scrollLeft : null;
      plan.innerHTML = state.view === 'week' ? renderWeek() : renderDay();
      const wrap = plan.querySelector('.week-wrap');
      if (wrap && wrap.scrollWidth > wrap.clientWidth) {
        const th = wrap.querySelector('thead th.today');
        const pcol = wrap.querySelector('th.pcol');
        if (keepScroll != null) wrap.scrollLeft = keepScroll;
        else if (th) wrap.scrollLeft = th.offsetLeft - (pcol ? pcol.offsetWidth : 0);
      }
    }
    renderFoot();
  }

  function openDetail(iso, id) {
    const it = dayItems(iso).find((x) => String(x.id) === id);
    if (!it) return;
    const c = changeCells(it);
    const d = C.parseIso(iso);
    const num = it.from === it.to ? it.from : `${it.from}–${it.to}`;
    const status = { normal: 'Zgodnie z planem', changed: changeLabel(it), cancelled: 'Odwołana', added: 'Dodatkowa lekcja (spoza planu)', absent: 'Klasa nieobecna' }[it.status];
    const raws = it.sources.map((s) => s.raw).filter(Boolean);
    const dlg = $('#detail');
    dlg.innerHTML = `
      <div class="dlg-head"><h2 id="detailTitle">${esc(C.effective(it).subject.name)}<span class="sub">${C.DAY_NAMES[C.weekdayIndex(d)]}, ${ddmm(iso)}, lekcja ${num}</span></h2>
        <button class="close-btn" type="button" data-close>Zamknij</button></div>
      <div class="dlg-body">
        <dl class="facts">
          <dt>Godziny</dt><dd>${it.start}–${it.end}</dd>
          <dt>Przedmiot</dt><dd>${c.subj}${it.subject.short && it.subject.short !== it.subject.name ? ` <span style="color:var(--muted)">(${esc(it.subject.short)})</span>` : ''}</dd>
          <dt>Nauczyciel</dt><dd>${c.teacher || '—'}</dd>
          <dt>Sala</dt><dd>${c.room.replace(/<span class="room-lbl">Sala <\/span>/, '') || '—'}</dd>
          ${it.groups.length ? `<dt>Grupa</dt><dd>${esc(it.groups.join(', '))}</dd>` : ''}
          <dt>Status</dt><dd>${it.status === 'cancelled' ? badges(it, false) : esc(status)}</dd>
          ${it.notes.length ? `<dt>Uwagi</dt><dd>${it.notes.map(esc).join('<br>')}</dd>` : ''}
          ${it.weeks ? `<dt>Tygodnie</dt><dd>Nie co tydzień (wzór ${esc(it.weeks)})</dd>` : ''}
        </dl>
        ${raws.length ? `<div class="raw"><b>Wpis w zastępstwach EduPage:</b><br>${raws.map(esc).join('<br>')}</div>` : ''}
      </div>`;
    dlg.showModal();
  }

  function openSettings() {
    const dlg = $('#settings');
    const divs = (state.tt && state.tt.divisions) || [];
    const sel = state.prefs.groups || {};
    const groupFields = divs.map((dv) => {
      if (dv.groups.length > 1) {
        return `<div class="field"><label for="g-${esc(dv.id)}">Grupa (${dv.groups.map(esc).join(' / ')})</label>
          <select id="g-${esc(dv.id)}" data-div="${esc(dv.id)}"><option value="*">Pokazuj wszystkie grupy</option>
          ${dv.groups.map((g) => `<option value="${esc(g)}"${sel[dv.id] === g ? ' selected' : ''}>Tylko grupa ${esc(g)}</option>`).join('')}</select></div>`;
      }
      const g = dv.groups[0];
      return `<div class="field"><label for="g-${esc(dv.id)}">Zajęcia w grupie „${esc(g)}”${/^rel/i.test(g) ? ' (religia)' : ''}</label>
        <select id="g-${esc(dv.id)}" data-div="${esc(dv.id)}"><option value="*">Pokazuj</option><option value="none"${sel[dv.id] === 'none' ? ' selected' : ''}>Nie chodzę, ukryj</option></select></div>`;
    }).join('');
    dlg.innerHTML = `
      <div class="dlg-head"><h2 id="settingsTitle">Ustawienia</h2><button class="close-btn" type="button" data-close>Zamknij</button></div>
      <div class="dlg-body">
        <div class="field"><span class="lbl">Szkoła</span>
          <div class="row-between"><span>${esc((state.school && (state.school.name || state.school.edupage + '.edupage.org')) || 'nieustawiona')}</span>${CFG.mode === 'proxy' ? '' : '<button class="btn" type="button" data-act="change-school">Zmień szkołę</button>'}</div>
          ${CFG.mode === 'proxy' ? '<p class="hint">Szkołę zmienia właściciel strony w Cloudflare (zmienna EDUPAGE).</p>' : ''}</div>
        <div class="field"><span class="lbl">Klasa</span>
          <div class="row-between"><span>${esc(state.cls.name)}</span><button class="btn" type="button" data-act="change-class">Zmień klasę</button></div></div>
        ${groupFields || '<p class="hint">Twoja klasa nie jest dzielona na grupy.</p>'}
        <div class="field"><label for="defView">Widok po otwarciu</label>
          <select id="defView"><option value="day"${state.view === 'day' ? ' selected' : ''}>Dzień</option><option value="week"${state.view === 'week' ? ' selected' : ''}>Tydzień</option></select></div>
        ${pushSettingsHtml()}
        <div class="field"><span class="lbl">Połączenie z EduPage</span>
          <button class="btn" type="button" data-act="check">Sprawdź połączenie</button>
          <pre class="check-out" id="checkOut" hidden></pre></div>
        <div class="field"><span class="lbl">Na iPhonie jak aplikacja</span>
          <ol class="steps hint"><li>Otwórz tę stronę w Safari.</li><li>Stuknij przycisk Udostępnij (kwadrat ze strzałką).</li><li>Wybierz „Do ekranu początkowego” i „Dodaj”.</li></ol></div>
        <div class="field"><span class="lbl">Dane na tym urządzeniu</span>
          <div class="hint">Plan i zastępstwa są zapisywane w przeglądarce, żeby działały bez internetu.</div>
          <button class="link-btn" type="button" data-act="reset" style="margin-top:8px">Usuń zapisane dane i wybierz klasę od nowa</button></div>
      </div>`;
    dlg.showModal();
  }

  const YEAR_NAMES = { 1: 'Klasy pierwsze', 2: 'Klasy drugie', 3: 'Klasy trzecie', 4: 'Klasy czwarte', 5: 'Klasy piąte' };
  let classList = [];

  async function showPicker(canCancel) {
    $('#app').hidden = true;
    $('#setup').hidden = true;
    $('#headNav').hidden = true;
    $('#picker').hidden = false;
    applySchool();
    $('#pickerCancel').hidden = !canCancel;
    const listEl = $('#classList');
    classList = LS.get('plan.classes', []);
    drawClasses();
    if (!classList.length) listEl.innerHTML = '<p class="msg">Pobieram listę klas z EduPage…</p>';
    try {
      const res = await api('/api/classes');
      classList = res.classes || [];
      LS.set('plan.classes', classList);
    } catch (e) {
      if (e.code === 'NOT_CONFIGURED') { showSetup(); return; }
      if (!classList.length) {
        listEl.innerHTML = `<p class="msg">Nie udało się pobrać listy klas (${esc(e.message)}).</p><button class="btn" type="button" data-act="picker-retry">Spróbuj ponownie</button>`;
        return;
      }
    }
    drawClasses();
    $('#classSearch').focus();
  }

  function drawClasses(msg) {
    const q = ($('#classSearch').value || '').toLowerCase().replace(/\s+/g, '');
    const list = classList.filter((c) => !q || (c.name + c.short).toLowerCase().replace(/\s+/g, '').includes(q));
    const groups = {};
    list.forEach((c) => { const y = /^(\d)/.exec(c.name); const key = y ? y[1] : 'x'; (groups[key] = groups[key] || []).push(c); });
    let html = msg ? `<p class="msg">${msg}</p>` : '';
    Object.keys(groups).sort().forEach((y) => {
      html += `<div class="class-group"><h2>${YEAR_NAMES[y] || 'Pozostałe'}</h2><div class="class-grid">`;
      html += groups[y].map((c) => {
        const rest = c.name.slice(c.short.length).trim();
        const k = ['class-opt'];
        if (state.cls && state.cls.name === c.name) k.push('current');
        return `<button class="${k.join(' ')}" type="button" data-class="${esc(c.name)}"><b>${esc(c.short || c.name)}</b>${rest ? `<span>${esc(rest)}</span>` : ''}</button>`;
      }).join('');
      html += '</div></div>';
    });
    if (!list.length && !msg) html = '<p class="msg">Nie ma takiej klasy. Sprawdź pisownię.</p>';
    $('#classList').innerHTML = html;
  }

  function chooseClass(name) {
    const c = classList.find((x) => x.name === name) || { id: null, name, short: name.split(/\s+/)[0] };
    const changed = !state.cls || state.cls.name !== c.name;
    state.cls = c;
    LS.set('plan.class', c);
    if (changed) {
      state.tt = null; state.subst = {}; state.ttMeta = { fetchedAt: null, error: null, stale: false };
      restoreCache();
    }
    $('#picker').hidden = true;
    $('#app').hidden = false;
    render();
    refreshAll().then(() => { if (changed) syncPush(); });
  }

  function restoreCache() {
    state.prefs = LS.get(prefsKey(), {});
    const cached = LS.get(ttKey(), null);
    if (cached && cached.tt) { state.tt = cached.tt; state.ttMeta = { fetchedAt: cached.tt.fetchedAt || cached.savedAt, error: null, stale: true }; }
    state.subst = LS.get(substKey(), {});
  }

  const push = { checked: false, key: null, off: null };
  const pushInfo = () => LS.get('plan.push', null);
  function isIos() { const ua = navigator.userAgent || ''; return /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
  function isStandalone() { return window.navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches); }

  function pushSupport() {
    if (isIos() && !isStandalone()) return 'ios-home';
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return 'unsupported';
    return 'ok';
  }
  async function pushServer() {
    if (push.checked) return !!push.key;
    push.checked = true;
    if (DEMO) { push.key = 'demo'; return true; }
    try {
      const r = await fetch((CFG.apiBase || '') + 'push/key', { cache: 'no-store' });
      const j = await r.json();
      if (r.ok && j.key) push.key = j.key; else push.off = j.error || 'off';
    } catch (_) { push.off = 'off'; }
    render();
    return !!push.key;
  }
  function pushExclude() {
    const out = [];
    const sel = state.prefs.groups || {};
    for (const d of (state.tt && state.tt.divisions) || []) {
      const c = sel[d.id];
      if (c === 'none') out.push(...d.groups);
      else if (c && c !== '*') out.push(...d.groups.filter((g) => g !== c));
    }
    return out;
  }
  function b64ToBytes(b64) {
    const s = atob(b64.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((b64.length + 3) % 4));
    return Uint8Array.from(s, (c) => c.charCodeAt(0));
  }
  async function postJson(path, body) {
    const r = await fetch((CFG.apiBase || '') + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || `Błąd ${r.status}`);
    return j;
  }
  async function enablePush() {
    if (DEMO) { toast('W podglądzie powiadomienia są wyłączone.'); return; }
    if (!(await pushServer())) throw new Error('Powiadomienia nie są jeszcze włączone na serwerze.');
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') throw new Error('Nie zezwolono na powiadomienia. Możesz to zmienić w ustawieniach telefonu lub przeglądarki.');
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(push.key) });
    const prev = pushInfo();
    const r = await postJson('push/subscribe', { endpoint: sub.endpoint, cls: { name: state.cls.name, short: state.cls.short || state.cls.name.split(/\s+/)[0] }, exclude: pushExclude(), prevKey: prev && prev.key });
    LS.set('plan.push', { id: r.id, key: r.key, msgKey: r.msgKey, cls: state.cls.name });
    try { await (await caches.open('plan-push')).put('config', new Response(JSON.stringify({ id: r.id, msgKey: r.msgKey }))); } catch (_) {}
  }
  async function disablePush() {
    const info = pushInfo();
    try { const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.getSubscription(); if (sub) await sub.unsubscribe(); } catch (_) {}
    if (info) await postJson('push/unsubscribe', { key: info.key }).catch(() => {});
    LS.del('plan.push');
    try { await caches.delete('plan-push'); } catch (_) {}
  }

  function syncPush() {
    if (pushInfo() && 'Notification' in window && Notification.permission === 'granted') enablePush().catch(() => {});
  }

  const PUSH_WHY = (cls) => `Dostaniesz powiadomienie, gdy w EduPage pojawi się zastępstwo, odwołana lekcja albo zmiana sali w klasie ${esc(cls)}.
    Zmiany na jutro przychodzą zwykle po południu i wieczorem, a na dziś rano, więc nie musisz sprawdzać planu przed wyjściem z domu.
    Plan sprawdzamy co 5 minut; między 22:00 a 6:00 nic nie wysyłamy.`;
  const PUSH_PRIVACY = 'Nie podajesz imienia ani numeru telefonu. Zapisujemy tylko anonimowy adres powiadomień tego urządzenia, klasę i grupę.';
  const PUSH_IOS = 'Na iPhonie powiadomienia działają, gdy plan jest dodany do ekranu początkowego (Udostępnij → Do ekranu początkowego). Potem otwórz plan z ikony na ekranie i włącz je tutaj. Potrzebny jest iOS 16.4 lub nowszy.';

  function renderPushCard() {
    const el = $('#pushCard');
    if (!el) return;
    const sup = pushSupport();
    if (!push.key || pushInfo() || LS.get('plan.pushCard', '') === 'hidden' || sup === 'unsupported' || !state.tt) { el.innerHTML = ''; return; }
    const cls = state.cls.short || state.cls.name;
    const groupNote = (state.tt.divisions || []).some((d) => d.groups.length > 1) && !state.prefs.asked
      ? '<p class="hint">Najpierw wybierz swoją grupę, żeby nie dostawać zmian drugiej grupy.</p>' : '';
    el.innerHTML = `<div class="notice info push-card"><div class="push-text"><b>Powiadomienia o zmianach w planie</b>
      <p>${PUSH_WHY(cls)}</p>${sup === 'ios-home' ? `<p>${PUSH_IOS}</p>` : ''}${groupNote}<p class="hint">${PUSH_PRIVACY}</p></div>
      <div class="btns">${sup === 'ok' ? '<button class="btn primary" type="button" data-act="push-on">Włącz powiadomienia</button>' : ''}
      <button class="btn" type="button" data-act="push-later">Nie teraz</button></div></div>`;
  }

  function pushSettingsHtml() {
    const sup = pushSupport();
    const info = pushInfo();
    const cls = state.cls.short || state.cls.name;
    let body;
    if (push.off || (!push.key && push.checked)) body = '<p class="hint">Powiadomienia działają w wersji strony na Cloudflare, po dodaniu bazy PUSH (instrukcja w README).</p>';
    else if (!push.checked) body = '<p class="hint">Sprawdzam…</p>';
    else if (sup === 'ios-home') body = `<p class="hint">${PUSH_IOS}</p>`;
    else if (sup === 'unsupported') body = '<p class="hint">Ta przeglądarka nie obsługuje powiadomień ze stron. Spróbuj w Chrome, Edge albo Safari na iPhonie (iOS 16.4+).</p>';
    else if (info) body = `<p>Włączone dla klasy ${esc(info.cls)}${pushExclude().length ? ` (bez grup: ${esc(pushExclude().join(', '))})` : ''}.</p>
      <div class="btns"><button class="btn" type="button" data-act="push-test">Wyślij próbne</button><button class="btn" type="button" data-act="push-off">Wyłącz</button></div>`;
    else body = `<div class="btns"><button class="btn primary" type="button" data-act="push-on">Włącz powiadomienia</button></div>`;
    return `<div class="field"><span class="lbl">Powiadomienia o zmianach</span>
      <p class="hint">${PUSH_WHY(cls)}</p>${body}<p class="hint">${PUSH_PRIVACY}</p></div>`;
  }

  async function pushAction(act) {
    try {
      if (act === 'push-on') { await enablePush(); toast(`Powiadomienia włączone dla ${state.cls.short || state.cls.name}.`); }
      if (act === 'push-off') { await disablePush(); toast('Powiadomienia wyłączone.'); }
      if (act === 'push-test') { const info = pushInfo(); const r = await postJson('push/test', { key: info.key }); toast(r.ok ? 'Wysłano próbne powiadomienie.' : 'Serwer powiadomień odrzucił próbę. Wyłącz i włącz je ponownie.'); }
    } catch (e) { toast(e.message); }
    render();
    if ($('#settings').open) openSettings();
  }

  function applySchool() {
    const sch = state.school;
    const name = sch && sch.name;
    $('#schoolName').textContent = name || '';
    $('#schoolName').hidden = !name;
    $('#pickerSchool').textContent = name ? name : '';
    $('#pickerSchool').hidden = !name;
    document.title = name ? `Plan lekcji · ${name}` : 'Plan lekcji';
  }

  function forgetSchoolData() {
    try { Object.keys(localStorage).filter((k) => k.startsWith('plan.') && k !== 'plan.view').forEach((k) => LS.del(k)); } catch (_) {}
    localApi = null;
    state.cls = null; state.tt = null; state.subst = {}; state.prefs = {};
  }

  async function loadSchool() {
    const r = await api('/api/school');
    const prev = state.school;
    if (prev && prev.edupage && r.edupage && prev.edupage !== r.edupage) forgetSchoolData();
    state.school = { name: r.name || null, edupage: r.edupage || null };
    LS.set('plan.school', state.school);
    applySchool();
    return state.school;
  }

  function showSetup(canCancel) {
    $('#app').hidden = true;
    $('#picker').hidden = true;
    $('#headNav').hidden = true;
    $('#setup').hidden = false;
    $('#setupCancel').hidden = !canCancel;
    const proxy = CFG.mode === 'proxy';
    $('#setupSave').hidden = proxy;
    $('#setupLead').textContent = proxy
      ? 'Ta strona nie ma jeszcze ustawionej szkoły. Wpisz adres EduPage szkoły, a pokażemy, co ustawić w Cloudflare.'
      : 'Wpisz adres EduPage swojej szkoły. Strona sprawdzi go i zapamięta.';
    updateSetupHelp();
    $('#setupInput').focus();
  }

  function hideSetup() {
    $('#setup').hidden = true;
    if (state.cls) { $('#app').hidden = false; $('#headNav').hidden = false; render(); } else showPicker(false);
  }

  function normalizeAddress(v) {
    let s = String(v || '').trim().toLowerCase().replace(/^[a-z]+:\/\//, '').split(/[/?#]/)[0].replace(/:\d+$/, '').replace(/\.edupage\.org$/, '');
    return /^[a-z0-9][a-z0-9-]{0,62}$/.test(s) ? s : null;
  }

  let probeTimer = null;
  function updateSetupHelp() {
    const raw = $('#setupInput').value;
    const id = normalizeAddress(raw);
    const out = $('#setupHelp');
    if (!raw.trim()) { out.innerHTML = ''; return; }
    if (!id) { out.innerHTML = '<p class="msg">To nie wygląda na adres EduPage. Przykład: <b>mojaszkola.edupage.org</b></p>'; return; }
    if (CFG.mode !== 'proxy') { out.innerHTML = `<p class="msg">Adres: <b>${esc(id)}.edupage.org</b></p>`; return; }
    out.innerHTML = `<p class="msg">Adres: <b>${esc(id)}.edupage.org</b> <span id="probeResult"></span></p>
      <ol class="steps">
        <li>Otwórz <b>dash.cloudflare.com</b> → <b>Workers &amp; Pages</b> → ten Worker → <b>Settings</b>.</li>
        <li>W części <b>Variables and Secrets</b> kliknij <b>Add</b>.</li>
        <li>Type: <b>Text</b>, Variable name: <b>EDUPAGE</b>, Value: <b>${esc(id)}</b>.</li>
        <li>Kliknij <b>Deploy</b>, a potem odśwież tę stronę.</li>
      </ol>`;
    clearTimeout(probeTimer);
    probeTimer = setTimeout(async () => {
      const el = $('#probeResult');
      if (!el) return;
      el.textContent = 'sprawdzam…';
      try {
        const r = await fetch((CFG.apiBase || '') + '/ep/probe?edupage=' + encodeURIComponent(id), { cache: 'no-store' });
        const j = await r.json();
        if (!$('#probeResult')) return;
        $('#probeResult').textContent = r.ok ? `✓ znaleziono${j.school ? ': ' + j.school : ''}` : `✗ ${j.error || 'nie znaleziono'}`;
      } catch (_) { if ($('#probeResult')) $('#probeResult').textContent = ''; }
    }, 500);
  }

  async function saveSetup() {
    const id = normalizeAddress($('#setupInput').value);
    const out = $('#setupHelp');
    if (!id) { out.innerHTML = '<p class="msg">To nie wygląda na adres EduPage. Przykład: <b>mojaszkola.edupage.org</b></p>'; return; }
    $('#setupSave').disabled = true;
    out.innerHTML = `<p class="msg">Sprawdzam ${esc(id)}.edupage.org…</p>`;
    try {
      const r = await fetch((CFG.apiBase || '') + '/api/setup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ edupage: id }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || `Błąd ${r.status}`);
      const changed = !state.school || state.school.edupage !== j.edupage;
      if (changed) forgetSchoolData();
      state.school = { name: j.name || null, edupage: j.edupage };
      LS.set('plan.school', state.school);
      toast(`Ustawiono szkołę: ${j.name || j.edupage + '.edupage.org'}`);
      if (changed || !state.cls) showPicker(false); else hideSetup();
    } catch (e) {
      out.innerHTML = `<p class="msg">✗ ${esc(e.message)}</p>`;
    } finally {
      $('#setupSave').disabled = false;
    }
  }

  function renderInstallHint() {
    const el = $('#installHint');
    const ua = navigator.userAgent || '';
    const ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const standalone = window.navigator.standalone === true || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
    if (!ios || standalone || DEMO || LS.get('plan.installHint', '') === 'hidden') { el.innerHTML = ''; return; }
    el.innerHTML = `<div class="notice info"><p>Dodaj plan do ekranu iPhone'a: stuknij Udostępnij (kwadrat ze strzałką) w Safari, potem „Do ekranu początkowego”. Plan otworzy się jak aplikacja.</p>
      <button class="btn" type="button" data-act="hide-install">Nie pokazuj</button></div>`;
  }

  if ('serviceWorker' in navigator && !DEMO && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }

  let toastTimer = null;
  function toast(text) {
    const t = $('#toast');
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 4200);
  }

  document.addEventListener('click', (ev) => {
    const t = ev.target.closest('button, dialog');
    if (!t) return;
    if (t.tagName === 'DIALOG') { if (ev.target === t) t.close(); return; }
    if (t.dataset.close !== undefined) { t.closest('dialog').close(); return; }
    if (t.dataset.date) { state.selected = t.dataset.date; if (state.view === 'week') state.view = 'day'; render(); return; }
    if (t.dataset.view) { state.view = t.dataset.view; render(); return; }
    if (t.dataset.detail) { const [iso, id] = t.dataset.detail.split('|'); openDetail(iso, id); return; }
    if (t.dataset.class) { chooseClass(t.dataset.class); return; }
    if (t.dataset.group) {
      const [div, g] = t.dataset.group.split('|');
      state.prefs.groups = { ...(state.prefs.groups || {}), [div]: g };
      state.prefs.asked = true;
      LS.set(prefsKey(), state.prefs);
      render();
      syncPush();
      toast(g === '*' ? 'Pokazuję obie grupy. Zmienisz to w ustawieniach.' : `Pokazuję lekcje grupy ${g}.`);
      return;
    }
    switch (t.dataset.act || t.id) {
      case 'retry': refreshAll(true); break;
      case 'classBtn': showPicker(true); break;
      case 'settingsBtn': openSettings(); break;
      case 'prevWeek': state.weekOffset--; state.selected = null; render(); loadSubstitutions().then(render); break;
      case 'nextWeek': state.weekOffset++; state.selected = null; render(); loadSubstitutions().then(render); break;
      case 'pickerCancel': $('#picker').hidden = true; $('#app').hidden = false; $('#headNav').hidden = false; break;
      case 'check': {
        const out = $('#checkOut');
        out.hidden = false; out.textContent = 'Sprawdzam…';
        api('/api/check').then((r) => { out.textContent = typeof r === 'string' ? r : JSON.stringify(r, null, 2); })
          .catch((e) => { out.textContent = '✗ ' + e.message; });
        break;
      }
      case 'push-on': case 'push-off': case 'push-test': pushAction(t.dataset.act); break;
      case 'push-later': LS.set('plan.pushCard', 'hidden'); render(); toast('Powiadomienia włączysz później w Ustawieniach.'); break;
      case 'picker-retry': showPicker(!!state.cls); break;
      case 'change-school': $('#settings').close(); showSetup(true); break;
      case 'setup-save': saveSetup(); break;
      case 'setup-cancel': hideSetup(); break;
      case 'hide-install': LS.set('plan.installHint', 'hidden'); renderInstallHint(); break;
      case 'change-class': $('#settings').close(); showPicker(true); break;
      case 'reset':
        Object.keys(localStorage).filter((k) => k.startsWith('plan.')).forEach((k) => LS.del(k));
        location.reload();
        break;
      default:
    }
  });

  document.addEventListener('change', (ev) => {
    const t = ev.target;
    if (t.dataset && t.dataset.div) {
      state.prefs.groups = { ...(state.prefs.groups || {}), [t.dataset.div]: t.value };
      state.prefs.asked = true;
      LS.set(prefsKey(), state.prefs);
      render();
      syncPush();
    }
    if (t.id === 'defView') { state.view = t.value; LS.set('plan.view', t.value); render(); }
    if (t.id === 'demoTime') {
      if (t.value === 'live') setSim(null);
      else {
        const [h, m] = t.value.split(':').map(Number);
        const d = DEMO && DEMO.date ? C.parseIso(DEMO.date) : new Date();
        d.setHours(h, m, 0, 0);
        setSim(d);
      }
    }
  });
  $('#classSearch').addEventListener('input', () => drawClasses());
  $('#classSearch').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { const first = $('#classList .class-opt'); if (first) first.click(); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, select, dialog') || $('#app').hidden) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const week = visibleWeek(); const i = week.indexOf(state.selected);
      const j = i + (e.key === 'ArrowRight' ? 1 : -1);
      if (j >= 0 && j < week.length) { state.selected = week[j]; render(); }
    }
  });
  window.addEventListener('online', () => refreshAll());
  window.addEventListener('offline', render);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && state.cls && (!state.lastSync || Date.now() - state.lastSync > 2 * 60 * 1000)) refreshAll();
    else render();
  });

  let lastMinute = -1;
  setInterval(() => {
    if (!state.cls || $('#app').hidden) return;
    const m = now().getMinutes();
    if (m !== lastMinute) { lastMinute = m; render(); }
  }, TICK_MS / 3);
  setInterval(() => { if (state.cls && document.visibilityState !== 'hidden') loadSubstitutions().then(render); }, REFRESH_SUBST_MS);
  setInterval(() => { if (state.cls && document.visibilityState !== 'hidden') loadTimetable().then(render); }, REFRESH_TT_MS);

  if (DEMO) {
    $('#demoBar').innerHTML = `<div class="demo-bar notice info"><span>${esc(DEMO.note || 'Podgląd z zapisanymi danymi.')}</span>
      <label>Godzina: <select id="demoTime"><option value="live">aktualna</option>
      ${['07:40', '08:20', '09:50', '10:30', '12:00', '13:12', '14:45'].map((t) => `<option value="${t}">${t}</option>`).join('')}</select></label></div>`;
  }

  const wantDay = params.get('dzien');
  if (wantDay && /^\d{4}-\d{2}-\d{2}$/.test(wantDay)) {
    const base = C.weekDates(now(), isWeekend(now()) ? 1 : 0)[0];
    const diff = Math.round((C.parseIso(wantDay) - C.parseIso(base)) / (7 * 86400000));
    state.weekOffset = Math.floor(diff); state.selected = wantDay; state.view = 'day';
  }
  pushServer();

  $('#setupInput').addEventListener('input', updateSetupHelp);
  $('#setupInput').addEventListener('keydown', (e) => { if (e.key === 'Enter' && CFG.mode !== 'proxy') saveSetup(); });

  function startApp() {
    if (state.cls) {
      restoreCache();
      $('#app').hidden = false;
      $('#headNav').hidden = false;
      render();
      refreshAll();
    } else {
      showPicker(false);
    }
  }

  applySchool();
  if (state.school) {
    startApp();
    loadSchool().then(() => { if (!state.cls && $('#picker').hidden && $('#setup').hidden) showPicker(false); })
      .catch((e) => { if (e.code === 'NOT_CONFIGURED') showSetup(); });
  } else {
    loadSchool().then(startApp).catch((e) => {
      if (e.code === 'NOT_CONFIGURED') showSetup();
      else startApp();
    });
  }
}());
