// Minimal service worker for PWA
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Bypass caching for API requests
  if (event.request.url.includes("/api/")) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      return fetch(event.request).catch((err) => {
        // Log error and optionally return a fallback response
        console.error("Service Worker fetch failed:", event.request.url, err);
        // Optionally, return a fallback response here
        return new Response("Network error", {
          status: 503,
          statusText: "Service Unavailable",
        });
      });
    })
  );
});
