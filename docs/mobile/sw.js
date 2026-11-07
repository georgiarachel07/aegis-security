importScripts('domains.js');

const cachePrefix = 'aegis-shield-mobile-' + new URL(self.registration.scope).pathname;
const cacheName = cachePrefix + '-1.1.0';
const shell = ['./', 'index.html', 'app.js', 'domains.js', 'mobile.css',
  '../preview.css', 'manifest.webmanifest', 'banner.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(shell)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith(cachePrefix) && name !== cacheName) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const matchesAdHost = self.adDomains.some(domain => url.hostname === domain || url.hostname.endsWith('.' + domain));
  const fixture = new URL('banner.json', self.registration.scope);
  const sample = url.origin === fixture.origin && url.pathname === fixture.pathname;
  if (matchesAdHost || (sample && url.searchParams.get('filter') === 'on')) {
    event.respondWith(new Response('Blocked by Aegis Shield', {
      status: 403, headers: {'X-Aegis-Rule': sample ? 'sample-ad' : 'ad-domain'}
    }));
    return;
  }
  if (event.request.method !== 'GET' || url.origin !== fixture.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(sample ? fixture.href : event.request);
    return cached || fetch(event.request);
  })());
});
