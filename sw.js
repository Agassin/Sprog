/* Bump the cache version whenever an application asset changes. */
const CACHE = 'sprog-v4';
const FILES = ['./', 'index.html', 'style.css', 'program.js', 'data.js', 'app.js', 'privacy.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-180.png'];
const URLS = FILES.map(path => new URL(path, self.registration.scope).href);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(URLS)));
});
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => /^sprog-v[0-9]+$/.test(key) && key !== CACHE).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  const canonical = url.origin + url.pathname;
  if (!URLS.includes(canonical)) return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(canonical);
    // A release is an immutable app shell: never mix JS from different releases.
    return cached || fetch(event.request);
  }));
});
