
const CACHE_NAME = "wpr-publishing-v7";

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
