const CACHE_NAME = "al-ilm-v8";
const BASE_PATH = new URL(self.registration.scope).pathname.replace(/\/$/, "");
const withBase = (path) => `${BASE_PATH}${path}`;
const STATIC_ASSETS = [withBase("/"), withBase("/index.html")];

function cacheResponse(request, response) {
  if (response && response.status === 200) {
    const cloned = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned));
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
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => cacheResponse(request, response))
        .catch(() => caches.match(request).then((cached) => cached || caches.match(withBase("/index.html"))))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((response) => cacheResponse(request, response));
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
      icon: withBase("/al-ilm-logo.png"),
      badge: withBase("/al-ilm-logo.png"),
      tag: "al-ilm"
    })
  );
});
