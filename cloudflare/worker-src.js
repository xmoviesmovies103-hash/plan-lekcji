const UA = 'Mozilla/5.0 (PlanLekcji) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';
const ALLOWED_POST = new Set([
  '/timetable/server/ttviewer.js',
  '/timetable/server/regulartt.js',
  '/rpr/server/maindbi.js',
  '/substitution/server/viewer.js',
]);
const ALLOWED_FUNC = /^(getTTViewerData|regularttGetData|mainDBIAccessor|getSubstViewerDayDataHtml)$/;

let session = null;

function schoolId(env) {
  return LIB.normalizeEdupage(env && env.EDUPAGE);
}

function base(env) {
  if (env && env.EDUPAGE_BASE) return env.EDUPAGE_BASE;
  const id = schoolId(env);
  if (!id) throw LIB.notConfigured();
  return `https://${id}.edupage.org`;
}

async function getSession(env, force) {
  const b = base(env);
  if (!force && session && session.base === b && Date.now() - session.at < 20 * 60 * 1000) return session;
  const res = await fetch(b + '/timetable/', { headers: { 'User-Agent': UA, 'Accept-Language': 'pl' } });
  if (!res.ok) throw new Error(`EduPage odpowiedział ${res.status}. Sprawdź adres szkoły w zmiennej EDUPAGE.`);
  const html = await res.text();
  if (!/ASC\.|edupage/i.test(html)) throw new Error('Pod tym adresem nie ma strony EduPage. Sprawdź zmienną EDUPAGE.');
  const cookies = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [res.headers.get('set-cookie')].filter(Boolean);
  session = {
    base: b,
    cookie: cookies.map((c) => c.split(';')[0]).join('; '),
    gsh: (/gsechash\s*=\s*["']([0-9a-fA-F]+)["']/.exec(html) || [])[1] || '00000000',
    year: Number((/"year_auto"\s*:\s*(\d{4})/.exec(html) || [])[1]) || null,
    school: LIB.schoolNameFromHtml(html),
    at: Date.now(),
  };
  return session;
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
}

async function forwardPost(request, env, path, search) {
  const body = await request.json();
  if (!body || !Array.isArray(body.__args)) return json({ error: 'Zły format zapytania' }, 400);
  for (let attempt = 0; attempt < 2; attempt++) {
    const s = await getSession(env, attempt > 0);
    const res = await fetch(base(env) + path + search, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'User-Agent': UA,
        Referer: base(env) + '/timetable/',
        'X-Requested-With': 'XMLHttpRequest',
        ...(s.cookie ? { Cookie: s.cookie } : {}),
      },
      body: JSON.stringify({ __args: body.__args, __gsh: s.gsh }),
    });
    if (res.ok || attempt > 0) {
      return new Response(res.body, { status: res.status, headers: { 'Content-Type': res.headers.get('content-type') || 'application/json', 'Cache-Control': 'no-store' } });
    }
  }
  return json({ error: 'EduPage nie odpowiada' }, 502);
}

function warsawToday() {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Warsaw' }).format(new Date());
}

function ttlFor(func, args) {
  if (func === 'mainDBIAccessor') return 12 * 3600;
  if (func === 'getSubstViewerDayDataHtml') {
    const date = args && args[1] && args[1].date;
    return date && date < warsawToday() ? 6 * 3600 : 3 * 60;
  }
  return 30 * 60;
}

function cacheApi() {
  try { return typeof caches !== 'undefined' && caches.default ? caches.default : null; } catch (_) { return null; }
}

async function upstreamPost(env, path, func, args) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const s = await getSession(env, attempt > 0);
    const res = await fetch(`${base(env)}${path}?__func=${func}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'User-Agent': UA,
        Referer: base(env) + '/timetable/',
        'X-Requested-With': 'XMLHttpRequest',
        ...(s.cookie ? { Cookie: s.cookie } : {}),
      },
      body: JSON.stringify({ __args: args, __gsh: s.gsh }),
    });
    const text = await res.text();
    if (res.ok && /^\s*\{\s*"r"\s*:/.test(text)) return text;
    if (attempt > 0) throw new Error(`EduPage odpowiedział ${res.status}`);
  }
  throw new Error('EduPage nie odpowiada');
}

async function forwardGet(request, env, ctx, path, url) {
  const func = url.searchParams.get('__func') || '';
  let args;
  try { args = JSON.parse(url.searchParams.get('args') || 'null'); } catch (_) { args = null; }
  if (!Array.isArray(args)) return json({ error: 'Zły format zapytania' }, 400);
  const ttl = ttlFor(func, args);
  const cache = cacheApi();

  const keyUrl = `https://${schoolId(env) || 'test'}.plan-cache.internal${path}?__func=${func}&args=${encodeURIComponent(JSON.stringify(args))}`;
  const key = new Request(keyUrl, { method: 'GET' });
  const staleKey = new Request(keyUrl + '&_stale=1', { method: 'GET' });
  if (cache) {
    const hit = await cache.match(key);
    if (hit) return hit;
  }
  try {
    const text = await upstreamPost(env, path, func, args);
    const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': `public, max-age=${ttl}` };
    const res = new Response(text, { headers });
    if (cache) {
      const work = Promise.all([
        cache.put(key, new Response(text, { headers })),
        cache.put(staleKey, new Response(text, { headers: { ...headers, 'Cache-Control': 'public, max-age=1209600' } })),
      ]).catch(() => {});
      if (ctx && ctx.waitUntil) ctx.waitUntil(work); else await work;
    }
    return res;
  } catch (e) {
    const old = cache ? await cache.match(staleKey) : null;
    if (old) return new Response(old.body, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Plan-Stale': '1' } });
    return json({ error: e.message }, 502);
  }
}

function serveStatic(pathname) {
  let p = pathname === '/' ? '/index.html' : pathname;
  let f = STATIC[p];
  if (!f && !/\.[a-z0-9]+$/i.test(p)) f = STATIC['/index.html'];
  if (!f) return new Response('Nie znaleziono', { status: 404 });
  const bodyData = f.b64 ? Uint8Array.from(atob(f.body), (c) => c.charCodeAt(0)) : f.body;
  const noCache = p.endsWith('.html') || p === '/sw.js';
  return new Response(bodyData, { headers: { 'Content-Type': f.type, 'Cache-Control': noCache ? 'no-cache' : 'public, max-age=300' } });
}

export default {
  async scheduled(event, env, ctx) {
    const work = runCron(env, event && event.scheduledTime).catch((e) => console.log('cron error', e && e.message));
    if (ctx && ctx.waitUntil) ctx.waitUntil(work); else await work;
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const p = url.pathname;
    try {
      if (p === '/ep/session') {
        const s = await getSession(env, url.searchParams.get('refresh') === '1');
        return new Response(JSON.stringify({ year: s.year, school: s.school, edupage: schoolId(env) }), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=600' } });
      }
      if (p === '/ep/probe') {
        if (schoolId(env)) return json({ error: 'Szkoła jest już ustawiona.' }, 403);
        const id = LIB.normalizeEdupage(url.searchParams.get('edupage'));
        if (!id) return json({ error: 'To nie jest adres EduPage.' }, 400);
        const res = await fetch(`https://${id}.edupage.org/timetable/`, { headers: { 'User-Agent': UA } });
        const html = res.ok ? await res.text() : '';
        if (!res.ok || !/ASC\.|edupage/i.test(html)) return json({ error: `nie znaleziono ${id}.edupage.org` }, 404);
        return json({ ok: true, school: LIB.schoolNameFromHtml(html) });
      }
      if (p.startsWith('/ep/') && request.method === 'GET' && ALLOWED_POST.has(p.slice(3))) {
        const func = url.searchParams.get('__func') || '';
        if (!ALLOWED_FUNC.test(func)) return json({ error: 'Niedozwolony adres' }, 403);
        return forwardGet(request, env, ctx, p.slice(3), url);
      }
      if (p.startsWith('/ep/') && request.method === 'POST') {
        const path = p.slice(3);
        const func = url.searchParams.get('__func') || '';
        if (!ALLOWED_POST.has(path) || !ALLOWED_FUNC.test(func)) return json({ error: 'Niedozwolony adres' }, 403);
        return forwardPost(request, env, path, url.search);
      }
      if (p === '/ep/substitution/' && request.method === 'GET') {
        const date = url.searchParams.get('date') || '';
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ error: 'Zła data' }, 400);
        const res = await fetch(`${base(env)}/substitution/?date=${date}`, { headers: { 'User-Agent': UA } });
        return new Response(res.body, { status: res.status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
      }
      if (p.startsWith('/ep/')) return json({ error: 'Niedozwolony adres' }, 403);
      if (p.startsWith('/push/')) return pushRoute(request, env, url);
      if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Metoda niedozwolona', { status: 405 });
      return serveStatic(p);
    } catch (e) {
      if (e && e.code === 'NOT_CONFIGURED') return json({ error: 'Nie ustawiono adresu EduPage szkoły (zmienna EDUPAGE w ustawieniach Workera).', code: 'NOT_CONFIGURED' }, 503);
      return json({ error: e.message || String(e) }, 502);
    }
  },
};
