const CACHE_NAME = 'privacy-inspector-v1';
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

// Instalar el Service Worker y almacenar recursos en caché
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
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
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then(fetchResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    if (event.request.method === 'GET') {
                        cache.put(event.request.url, fetchResponse.clone());
                    }
                    return fetchResponse;
                });
            });
        }).catch(() => {
            // Falla de red, y no está en caché (podrías servir un offline.html aquí)
        })
    );
});
