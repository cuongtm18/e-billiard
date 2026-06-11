self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.open("pwa-cache-v1").then((cache) => {
      return fetch(event.request)
        .then((response) => {
          if (event.request.method === "GET") {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => cache.match(event.request));
    })
  );
});
