const CACHE = 'plan-v5';
const KEEP = ['plan-push'];
const SHELL = ['./', 'index.html', 'style.css', 'core.js', 'plan-lib.js', 'app.js', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE && !KEEP.includes(k)).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || /\/(api|ep|push)\//.test(url.pathname)) return;

  e.respondWith(
    fetch(e.request).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request).then((r) => r || caches.match('index.html')))
  );
});

self.addEventListener('push', (e) => {
  e.waitUntil((async () => {
    let msg = null;
    try { msg = e.data ? e.data.json() : null; } catch (_) { msg = null; }
    if (!msg) {
      try {
        const cfgRes = await (await caches.open('plan-push')).match('config');
        const cfg = cfgRes ? await cfgRes.json() : {};
        const r = await fetch(`push/msg?id=${encodeURIComponent(cfg.id || '')}&k=${encodeURIComponent(cfg.msgKey || '')}`, { cache: 'no-store' });
        if (r.ok) msg = await r.json();
      } catch (_) {}
    }
    if (!msg || !msg.title) msg = { title: 'Zmiany w planie lekcji', body: 'Otwórz plan, żeby zobaczyć szczegóły.' };
    await self.registration.showNotification(msg.title, {
      body: msg.body || '', icon: 'icon-192.png', badge: 'icon-192.png', tag: msg.tag || 'plan', renotify: true,
      data: { url: './' + (msg.date ? '?dzien=' + msg.date : '') },
    });
  })());
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const target = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const w of wins) { if ('focus' in w) { w.navigate(target).catch(() => {}); return w.focus(); } }
    return self.clients.openWindow(target);
  })());
});
