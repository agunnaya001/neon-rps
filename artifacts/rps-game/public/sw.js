const CACHE_NAME = "neon-rps-v1";
const RUNTIME_CACHE = "neon-rps-runtime";

const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
];

// Install: cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting()),
  );
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        }),
      );
    }).then(() => self.clients.claim()),
  );
});

// Fetch: network-first for API, cache-first for assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // API calls: network-first with cache fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response.ok) return response;
          const cache = caches.open(RUNTIME_CACHE);
          cache.then((c) => c.put(request, response.clone()));
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || new Response("Offline: API unavailable", { status: 503 });
          });
        }),
    );
    return;
  }

  // Assets: cache-first
  if (
    request.method === "GET" &&
    (url.pathname.match(/\.(js|css|png|jpg|svg|woff2?)$/) ||
     url.pathname === "/")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (!response.ok) return response;
          const cache = caches.open(RUNTIME_CACHE);
          cache.then((c) => c.put(request, response.clone()));
          return response;
        }).catch(() => {
          // Offline fallback
          if (url.pathname === "/") {
            return caches.match("/index.html");
          }
          return new Response("Offline: Resource unavailable", { status: 503 });
        });
      }),
    );
    return;
  }
});

// Background sync for failed transactions
self.addEventListener("sync", (event) => {
  if (event.tag === "retry-transaction") {
    event.waitUntil(
      (async () => {
        const db = await openIDB();
        const tx = await db.get("pendingTransactions", event.tag);
        if (tx) {
          try {
            // Notify clients to retry
            self.clients.matchAll().then((clients) => {
              clients.forEach((client) => {
                client.postMessage({ type: "RETRY_TRANSACTION", payload: tx });
              });
            });
          } catch {
            // Retry next time
          }
        }
      })(),
    );
  }
});

// Message handling for updates and notifications
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
