
const CACHE = 'superlist-shell-v31';

const ASSETS = [
  './',
  './index.html',
  './demo.html',
  './demo.css',
  './demo.js',
  './styles.css',
  './app.js',
  './cloud.js',
  './manifest.webmanifest'
];

// Instala o novo service worker e atualiza os arquivos armazenados.
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);

      await Promise.all(
        ASSETS.map(async path => {
          try {
            const request = new Request(path, { cache: 'reload' });
            const response = await fetch(request);

            if (response.ok) {
              await cache.put(path, response);
            }
          } catch (error) {
            console.warn('Não foi possível atualizar:', path, error);
          }
        })
      );

      await self.skipWaiting();
    })()
  );
});

// Assume o controle e remove os caches antigos do Superlist.
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter(key =>
            key.startsWith('superlist-shell') && key !== CACHE
          )
          .map(key => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

// Busca sempre a versão mais recente dos arquivos.
// Se estiver sem internet, utiliza a cópia armazenada.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  const isAppFile =
    event.request.mode === 'navigate' ||
    /\.(html|js|css|webmanifest)$/.test(url.pathname);

  if (!isAppFile) return;

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(event.request, {
          cache: 'no-store'
        });

        if (response.ok) {
          const cache = await caches.open(CACHE);
          await cache.put(event.request, response.clone());
        }

        return response;
      } catch (error) {
        const cached =
          await caches.match(event.request) ||
          await caches.match('./index.html');

        if (cached) return cached;

        return new Response('Você está offline. Conecte-se à internet e tente novamente.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      }
    })()
  );
});

// Permite que a página solicite a ativação imediata.
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
