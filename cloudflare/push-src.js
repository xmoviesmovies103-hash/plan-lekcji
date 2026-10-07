const PUSH_HOSTS = /(^|\.)push\.apple\.com$|^fcm\.googleapis\.com$|(^|\.)push\.services\.mozilla\.com$|(^|\.)notify\.windows\.com$|^web\.push\.apple\.com$/;
const PUSH_BATCH = 40;
const DAY_PL = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];

const b64url = {
  enc(buf) {
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    let s = '';
    for (const b of bytes) s += String.fromCharCode(b);
    return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  },
  encStr(str) { return b64url.enc(new TextEncoder().encode(str)); },
};

function warsawParts(ms) {
  const f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short' });
  const p = Object.fromEntries(f.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
  return { date: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour), minute: Number(p.minute), weekday: wd };
}

function addDays(iso, n) {
  const d = new Date(iso + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function weekdayOf(iso) { return new Date(iso + 'T12:00:00Z').getUTCDay(); }
function nextSchoolDay(iso) {
  let d = addDays(iso, 1);
  while ([0, 6].includes(weekdayOf(d))) d = addDays(d, 1);
  return d;
}

function cleanGroup(g) { return String(g || '').toLowerCase().replace(/^(grupa|gr\.?|g)\s*(?=\d)/, '').replace(/[^a-z0-9_ąćęłńóśźż]/g, '').slice(0, 12); }
function variantOf(exclude) { const v = [...new Set((exclude || []).map(cleanGroup).filter(Boolean))].sort(); return v.length ? v.join('+') : 'all'; }

async function sha(str) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(d)].slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('');
}

let vapidMemo = null;
async function getVapid(env) {
  if (vapidMemo) return vapidMemo;
  let v = await env.PUSH.get('vapid', 'json');
  if (!v) {
    const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
    const pub = await crypto.subtle.exportKey('raw', kp.publicKey);
    v = { publicKey: b64url.enc(pub), privateJwk: await crypto.subtle.exportKey('jwk', kp.privateKey) };
    await env.PUSH.put('vapid', JSON.stringify(v));
    v = (await env.PUSH.get('vapid', 'json')) || v;
  }
  vapidMemo = { ...v, key: await crypto.subtle.importKey('jwk', v.privateJwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']) };
  return vapidMemo;
}

const jwtMemo = new Map();
async function vapidHeader(env, endpoint) {
  const aud = new URL(endpoint).origin;
  const memo = jwtMemo.get(aud);
  const now = Math.floor(Date.now() / 1000);
  const v = await getVapid(env);
  if (memo && memo.exp - now > 3600) return memo.header;
  const exp = now + 12 * 3600;
  const subject = (await env.PUSH.get('site')) || 'https://edupage.org';
  const unsigned = b64url.encStr(JSON.stringify({ typ: 'JWT', alg: 'ES256' })) + '.' + b64url.encStr(JSON.stringify({ aud, exp, sub: subject }));
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, v.key, new TextEncoder().encode(unsigned));
  const header = `vapid t=${unsigned}.${b64url.enc(sig)}, k=${v.publicKey}`;
  jwtMemo.set(aud, { exp, header });
  return header;
}

async function sendPush(env, endpoint) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: await vapidHeader(env, endpoint), TTL: '43200', Urgency: 'high', 'Content-Length': '0' },
  });
  return res.status;
}

function subjectName(s, dict) {
  if (!s) return '';
  return s.name || (dict && (dict[s.short] || dict[String(s.short).toLowerCase()])) || s.short;
}

function describeEntry(e, dict) {
  let label;
  if (e.allDay) label = 'Cały dzień';
  else if (e.periodFrom === e.periodTo) label = `${e.periodFrom}. lekcja`;
  else label = `Lekcje ${e.periodFrom}–${e.periodTo}`;
  if (e.groups && e.groups.length) label += ` (gr. ${e.groups.join(', ')})`;
  const subj = subjectName(e.subject, dict);
  if (e.absent) return `${label}: klasa nieobecna`;
  if (e.cancelled) return `${label}: odwołana${subj ? ` (${subj})` : ''}`;
  const parts = [];
  if (e.subjectFrom) parts.push(`${subj} (było: ${subjectName(e.subjectFrom, dict)})`);
  else if (subj) parts.push(subj);
  if (e.teacherTo && e.teacherTo.length) parts.push(`zastępstwo: ${e.teacherTo.concat(e.teachersAdded || []).join(', ')}`);
  else if (e.teachersAdded && e.teachersAdded.length) parts.push(`dodatkowo: ${e.teachersAdded.join(', ')}`);
  if (e.roomTo) parts.push(`sala ${e.roomFrom ? e.roomFrom + ' → ' : ''}${e.roomTo}`);
  else if (e.room) parts.push(`sala ${e.room}`);
  if (parts.length <= 1 && e.notes && e.notes.length) parts.push(e.notes[0]);
  return `${label}: ${parts.join(', ')}`;
}

function composeMessage(date, today, short, entries, dict) {
  let day;
  if (date === today) day = 'Dziś';
  else if (date === addDays(today, 1)) day = 'Jutro';
  else day = DAY_PL[weekdayOf(date)].replace(/^./, (c) => c.toUpperCase());
  const title = `${day} (${date.slice(8, 10)}.${date.slice(5, 7)}): ${entries.length === 1 ? 'zmiana' : 'zmiany'} w planie ${short}`;
  const lines = entries.slice(0, 4).map((e) => describeEntry(e, dict));
  if (entries.length > 4) lines.push(`i jeszcze ${entries.length - 4} — otwórz plan`);
  return { title, body: lines.join('\n'), date, ts: Date.now(), tag: `plan-${short}-${date}` };
}

function visibleFor(entry, exclude) {
  if (!entry.groups || !entry.groups.length) return true;
  const ex = new Set((exclude || []).map(cleanGroup));
  return entry.groups.some((g) => !ex.has(cleanGroup(g)));
}

async function readJson(request) {
  try { return await request.json(); } catch (_) { return null; }
}

async function pushRoute(request, env, url) {
  const p = url.pathname;
  if (!env.PUSH) return json({ error: 'Powiadomienia nie są włączone na serwerze (brak bazy PUSH).', off: true }, 404);

  if (p === '/push/key') {
    const v = await getVapid(env);
    return json({ key: v.publicKey });
  }

  if (p === '/push/subscribe' && request.method === 'POST') {
    const b = await readJson(request);
    if (!b || typeof b.endpoint !== 'string' || !b.cls) return json({ error: 'Zły format' }, 400);
    let host;
    try { host = new URL(b.endpoint).hostname; } catch (_) { return json({ error: 'Zły adres' }, 400); }
    if (!(env.PUSH_ALLOW_ANY === '1' || (b.endpoint.startsWith('https://') && PUSH_HOSTS.test(host)))) return json({ error: 'Nieznana usługa powiadomień' }, 400);
    const short = String(b.cls.short || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 12);
    const name = String(b.cls.name || short).slice(0, 40);
    if (!short) return json({ error: 'Brak klasy' }, 400);
    const exclude = (Array.isArray(b.exclude) ? b.exclude : []).map(cleanGroup).filter(Boolean).slice(0, 8);
    const variant = variantOf(exclude);
    const id = await sha(b.endpoint);
    const key = `s:${short}:${variant}:${id}`;
    if (b.prevKey && b.prevKey !== key && /^s:[A-Za-z0-9]+:[^:]+:[0-9a-f]+$/.test(b.prevKey)) await env.PUSH.delete(b.prevKey);
    await env.PUSH.put(key, '1', { metadata: { e: b.endpoint } });
    const reg = (await env.PUSH.get('reg', 'json')) || {};
    const rk = `${short}|${variant}`;
    if (!reg[rk]) { reg[rk] = { name, short, ex: exclude }; await env.PUSH.put('reg', JSON.stringify(reg)); }
    if (!(await env.PUSH.get('site'))) await env.PUSH.put('site', url.origin);
    return json({ id, key, msgKey: `${short}:${variant}` });
  }

  if (p === '/push/unsubscribe' && request.method === 'POST') {
    const b = await readJson(request);
    if (b && typeof b.key === 'string' && /^s:[A-Za-z0-9]+:[^:]+:[0-9a-f]+$/.test(b.key)) await env.PUSH.delete(b.key);
    return json({ ok: true });
  }

  if (p === '/push/test' && request.method === 'POST') {
    const b = await readJson(request);
    if (!b || typeof b.key !== 'string') return json({ error: 'Zły format' }, 400);
    const list = await env.PUSH.list({ prefix: b.key, limit: 1 });
    const k = list.keys[0];
    if (!k || k.name !== b.key) return json({ error: 'Nie znaleziono subskrypcji. Włącz powiadomienia ponownie.' }, 404);
    const id = b.key.split(':').pop();
    await env.PUSH.put(`t:${id}`, JSON.stringify({ title: 'Próbne powiadomienie', body: 'Działa. Tak będą wyglądały powiadomienia o zmianach w planie.', ts: Date.now(), tag: 'plan-test' }), { expirationTtl: 300 });
    const status = await sendPush(env, k.metadata.e);
    return json({ ok: status < 300, status });
  }

  if (p === '/push/msg') {
    const id = (url.searchParams.get('id') || '').replace(/[^0-9a-f]/g, '');
    const mk = (url.searchParams.get('k') || '').replace(/[^A-Za-z0-9:+_ąćęłńóśźż]/g, '');
    const [test, list] = await Promise.all([id ? env.PUSH.get(`t:${id}`, 'json') : null, mk ? env.PUSH.get(`m:${mk}`, 'json') : null]);
    const latest = (list || [])[0] || null;
    const pick = test && (!latest || test.ts > latest.ts) ? test : latest;
    return json(pick || { title: 'Zmiany w planie lekcji', body: 'Otwórz plan, żeby zobaczyć szczegóły.' });
  }

  return json({ error: 'Nieznany adres' }, 404);
}

async function substitutionsFor(env, date) {
  const args = [null, { date, mode: 'classes' }];
  const url = new URL('https://cron.local/ep/substitution/server/viewer.js');
  url.searchParams.set('__func', 'getSubstViewerDayDataHtml');
  url.searchParams.set('args', JSON.stringify(args));
  const res = await forwardGet(null, env, null, '/substitution/server/viewer.js', url, true);
  const j = await res.json();
  if (typeof j.r !== 'string') throw new Error('Brak zastępstw dla ' + date + ': ' + JSON.stringify(j).slice(0, 120));
  return LIB.parseSubstitutions(j.r, { date });
}

async function subjectDict(env) {
  try {
    const url = new URL('https://cron.local/ep/rpr/server/maindbi.js');
    url.searchParams.set('__func', 'mainDBIAccessor');
    const year = (await getSession(env)).year;
    url.searchParams.set('args', JSON.stringify([null, year, {}, { op: 'fetch', needed_part: { subjects: ['short', 'name'] }, needed_combos: {} }]));
    const res = await forwardGet(null, env, null, '/rpr/server/maindbi.js', url, true);
    const j = await res.json();
    const t = ((j.r && j.r.tables) || []).find((x) => x.id === 'subjects');
    const d = {};
    for (const s of (t && t.data_rows) || []) if (s.short && s.name && !d[s.short]) d[s.short] = s.name;
    return d;
  } catch (_) { return null; }
}

async function rebuildRegistry(env) {
  const reg = {};
  let cursor;
  do {
    const r = await env.PUSH.list({ prefix: 's:', cursor, limit: 1000 });
    for (const k of r.keys) {
      const [, short, variant] = k.name.split(':');
      const rk = `${short}|${variant}`;
      if (!reg[rk]) reg[rk] = { name: short, short, ex: variant === 'all' ? [] : variant.split('+') };
    }
    cursor = r.list_complete ? null : r.cursor;
  } while (cursor);
  const old = (await env.PUSH.get('reg', 'json')) || {};
  for (const k of Object.keys(reg)) if (old[k]) reg[k].name = old[k].name;
  await env.PUSH.put('reg', JSON.stringify(reg));
  return reg;
}

async function processJobs(env, jobs, budget) {
  let sent = 0;
  for (const job of jobs) {
    while (budget > 0 && !job.done) {
      const r = await env.PUSH.list({ prefix: job.prefix, cursor: job.cursor || undefined, limit: Math.min(budget, PUSH_BATCH) });
      for (const k of r.keys) {
        if (!k.metadata || !k.metadata.e) continue;
        budget--; sent++;
        try {
          const st = await sendPush(env, k.metadata.e);
          if (st === 404 || st === 410) await env.PUSH.delete(k.name);
        } catch (_) {}
      }
      if (r.list_complete) job.done = true; else job.cursor = r.cursor;
    }
    if (budget <= 0) break;
  }
  return { left: jobs.filter((j) => !j.done), sent };
}

async function runCron(env, scheduledTime) {
  if (!env.PUSH) return { skipped: 'no KV' };
  if (!env.EDUPAGE_BASE && !schoolId(env)) return { skipped: 'no school' };
  const now = warsawParts(scheduledTime || Date.now());
  let jobs = (await env.PUSH.get('jobs', 'json')) || [];

  if (jobs.length) {
    const r = await processJobs(env, jobs, PUSH_BATCH);
    await env.PUSH.put('jobs', JSON.stringify(r.left));
    return { sent: r.sent, pending: r.left.length };
  }

  if (now.minute % 5 !== 0 || now.hour < 6 || now.hour >= 22) return { skipped: 'time' };
  const reg = now.hour === 6 && now.minute === 0 ? await rebuildRegistry(env) : (await env.PUSH.get('reg', 'json')) || {};
  const variants = Object.values(reg);
  if (!variants.length) return { skipped: 'no subscribers' };

  const dates = [];
  if (now.weekday >= 1 && now.weekday <= 5 && now.hour < 16) dates.push(now.date);
  dates.push(nextSchoolDay(now.date));

  let dict;
  const classes = [...new Map(variants.map((v) => [v.short, v])).values()];
  for (const date of dates) {
    let parsed;
    try { parsed = await substitutionsFor(env, date); } catch (e) { console.log('substitutions', date, e && e.message); continue; }
    const seen = (await env.PUSH.get(`seen:${date}`, 'json')) || {};
    let changed = false;
    for (const c of classes) {
      const entries = LIB.entriesForClass(parsed, { name: c.name, short: c.short });
      const known = new Set(seen[c.short] || []);
      const fresh = entries.filter((e) => !known.has(e.raw || JSON.stringify(e)));
      if (!fresh.length) continue;
      if (dict === undefined) dict = await subjectDict(env);
      for (const v of variants.filter((x) => x.short === c.short)) {
        const rel = fresh.filter((e) => visibleFor(e, v.ex));
        if (!rel.length) continue;
        const variant = variantOf(v.ex);
        const mk = `m:${c.short}:${variant}`;
        const list = (await env.PUSH.get(mk, 'json')) || [];
        list.unshift(composeMessage(date, now.date, c.short, rel, dict));
        await env.PUSH.put(mk, JSON.stringify(list.slice(0, 5)), { expirationTtl: 7 * 86400 });
        jobs.push({ prefix: `s:${c.short}:${variant}:`, cursor: null });
      }
      seen[c.short] = [...known, ...fresh.map((e) => e.raw || JSON.stringify(e))];
      changed = true;
    }
    if (changed) await env.PUSH.put(`seen:${date}`, JSON.stringify(seen), { expirationTtl: 4 * 86400 });
  }
  if (!jobs.length) return { checked: dates };
  const r = await processJobs(env, jobs, PUSH_BATCH - 6);
  await env.PUSH.put('jobs', JSON.stringify(r.left));
  return { checked: dates, sent: r.sent, pending: r.left.length };
}
