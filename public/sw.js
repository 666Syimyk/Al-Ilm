const BASE_PATH = new URL(self.registration.scope).pathname.replace(/\/$/, "");
const CACHE_PREFIX = `al-ilm:${BASE_PATH}:`;
// vite.config.js replaces "dev" with a build id, so every deploy gets a fresh cache.
const CACHE_VERSION = "dev";
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;
const withBase = (path) => `${BASE_PATH}${path}`;
const STATIC_ASSETS = [withBase("/"), withBase("/index.html")];

async function cacheResponse(request, response) {
  if (response && response.status === 200) {
    const cloned = response.clone();
    await caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned)).catch(() => {});
  }
  return response;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME && (k.startsWith(CACHE_PREFIX) || /^al-ilm-v\d+$/.test(k))).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== location.origin || !url.pathname.startsWith(`${BASE_PATH}/`) || request.headers?.has("range")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => response.ok ? cacheResponse(request, response) : fetch(withBase("/index.html")).then((shell) => cacheResponse(withBase("/index.html"), shell)))
        .catch(() => caches.match(request).then((cached) => cached || caches.match(withBase("/index.html"))))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((response) => cacheResponse(request, response)).catch(() => cached || Response.error());
      event.waitUntil(fetchPromise.then(() => {}));
      return cached || fetchPromise;
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => client.url.includes("/namaz"));
      if (existing) return existing.focus();
      return self.clients.openWindow(withBase("/namaz"));
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "SHOW_NOTIFICATION") return;
  const { title = "Аль-Ильм", body = "" } = event.data;
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: withBase("/icons/icon-192.png"),
      badge: withBase("/icons/icon-192.png"),
      tag: "al-ilm"
    })
  );
});
