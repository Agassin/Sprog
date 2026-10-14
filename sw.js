const C = 'sprog-v2', F = ['./', 'index.html', 'style.css', 'program.js', 'app.js', 'manifest.webmanifest', 'icon.svg'];
self.addEventListener('install', e => e.waitUntil(caches.open(C).then(c => c.addAll(F))));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x))))));
// Cache d'abord (hors ligne), mis à jour en arrière-plan pour recevoir les nouvelles versions
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(r => {
    const net = fetch(e.request).then(n => { if (n.ok) caches.open(C).then(c => c.put(e.request, n.clone())); return n; }).catch(() => r);
    return r || net;
  }));
});
