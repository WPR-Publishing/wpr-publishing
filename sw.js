const CACHE_NAME = "wpr-publishing-v13";

const APP_FILES = [
  "/wpr-publishing/",
  "/wpr-publishing/index.html",
  "/wpr-publishing/manifest.json",
  "/wpr-publishing/icon-192.png",
  "/wpr-publishing/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    (event.request.mode === "navigate"
      ? fetch(new Request(event.request, { cache: "no-store" }))
      : fetch(event.request)
    ).catch(() => caches.match(event.request))
  );
});

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch (_) { data = { body: event.data ? event.data.text() : "" }; }
  const title = typeof data.title === "string" ? data.title : "WPR Publishing";
  const options = {
    body: typeof data.body === "string" ? data.body : "È disponibile una novità nel catalogo WPR Publishing.",
    icon: "/wpr-publishing/icon-192.png",
    badge: "/wpr-publishing/icon-192.png",
    data: { url: typeof data.url === "string" ? data.url : "/wpr-publishing/#novita" },
    renotify: false
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(
    event.notification.data && event.notification.data.url
      ? event.notification.data.url
      : "/wpr-publishing/#novita",
    self.location.origin
  );
  if (targetUrl.origin !== self.location.origin) return;
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin)) {
          client.navigate(targetUrl.href);
          return client.focus();
        }
      }
      return clients.openWindow(targetUrl.href);
    })
  );
});
