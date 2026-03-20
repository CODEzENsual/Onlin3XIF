const CACHE_NAME = 'privacy-inspector-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './fonts/fonts.css',
    './fonts/inter.woff2',
    './fonts/roboto-mono.woff2',
    './fonts/material-symbols.ttf',
    './lib/exif-reader.min.js',
    './lib/piexif.js',
    './lib/pdf.min.js',
    './lib/pdf.worker.min.js',
    './lib/jszip.min.js',
    './lib/crypto-js.min.js'
];

function isCacheableRequest(request) {
    if (!request || request.method !== 'GET') return false;
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return false;
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    return ASSETS_TO_CACHE.includes(url.pathname === '/' ? './' : `.${url.pathname}`);
}

// Instalar el Service Worker y almacenar recursos en caché
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
    );
    self.skipWaiting();
});

// Activar el Service Worker y limpiar cachés obsoletas
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Interceptar peticiones para servir desde caché (Estrategia Cache-First)
self.addEventListener('fetch', event => {
    if (!isCacheableRequest(event.request)) {
        return;
    }

    event.respondWith(
        fetch(event.request).then(fetchResponse => {
            if (!fetchResponse || fetchResponse.status !== 200) {
                return caches.match(event.request);
            }

            const responseClone = fetchResponse.clone();
            event.waitUntil(
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone))
            );
            return fetchResponse;
        }).catch(() => caches.match(event.request))
    );
});
