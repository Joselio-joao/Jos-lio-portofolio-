const CACHE_NAME = "joselio-portfolio-shell-v5";
const APP_SHELL = [new URL("./", self.registration.scope).href];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;
  const isDocument = event.request.mode === "navigate" || requestUrl.pathname.endsWith("/") || requestUrl.pathname.endsWith("index.html");
  const shellUrl = new URL("./", self.registration.scope).href;
  event.respondWith(
    isDocument
      ? fetch(event.request, { cache: "no-store" }).then((response) => response).catch(() => caches.match(shellUrl))
      : caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
          if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
          return response;
        }).catch(() => caches.match(shellUrl))),
  );
});
