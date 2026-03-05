// Service Worker for caching map tiles
const CACHE_NAME = "map-tiles-v1";
const MAX_CACHE_SIZE = 2000; // max number of cached tiles

// Match tile URLs from CartoDB
function isTileRequest(url) {
  return url.includes("basemaps.cartocdn.com");
}

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  if (!isTileRequest(event.request.url)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;

      try {
        const response = await fetch(event.request);
        if (response.ok) {
          // Clone and cache, then trim if needed
          cache.put(event.request, response.clone());
          trimCache(cache);
        }
        return response;
      } catch {
        // Network error — return cached if available, otherwise fail
        return cached || new Response("", { status: 408 });
      }
    })
  );
});

async function trimCache(cache) {
  const keys = await cache.keys();
  if (keys.length > MAX_CACHE_SIZE) {
    // Delete oldest entries (first in list)
    const toDelete = keys.length - MAX_CACHE_SIZE;
    for (let i = 0; i < toDelete; i++) {
      cache.delete(keys[i]);
    }
  }
}
