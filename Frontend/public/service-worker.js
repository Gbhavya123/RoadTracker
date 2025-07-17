self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Claim clients immediately so the SW controls the page
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Default: just pass through
  event.respondWith(fetch(event.request));
});
