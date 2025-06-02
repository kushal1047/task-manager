/* eslint-disable no-restricted-globals */
const CACHE_NAME = "task-app-v4";
const urlsToCache = ["/", "/manifest.json", "/favicon.ico"];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        // Cache each URL individually to handle failures gracefully
        return Promise.allSettled(
          urlsToCache.map((url) =>
            cache.add(url).catch((err) => {
              // Failed to cache URL
              return null;
            })
          )
        );
      })
      .then((results) => {
        const successful = results.filter(
          (r) => r.status === "fulfilled"
        ).length;
        // Successfully cached assets
      })
      .catch((error) => {
        // Service worker install failed
      })
  );
});

// Fetch event - serve from cache when possible
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip API requests - let them go through normally
  if (event.request.url.includes("/api/")) {
    return;
  }

  // Skip authentication-related requests and pages
  if (
    event.request.url.includes("/auth/") ||
    event.request.url.includes("/login") ||
    event.request.url.includes("/register") ||
    event.request.url.includes("/logout")
  ) {
    return;
  }

  // Skip requests with authentication headers
  if (event.request.headers.has("Authorization")) {
    return;
  }

  // For dynamic assets (JS/CSS with hashes), always fetch from network first
  const url = new URL(event.request.url);
  if (
    url.pathname.includes("/static/js/") ||
    url.pathname.includes("/static/css/") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css")
  ) {
    // Network first strategy for dynamic assets
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Only cache successful responses with correct MIME types
          if (response.status === 200) {
            const contentType = response.headers.get("content-type");
            if (
              (url.pathname.endsWith(".js") &&
                contentType?.includes("javascript")) ||
              (url.pathname.endsWith(".css") && contentType?.includes("css")) ||
              (!url.pathname.endsWith(".js") && !url.pathname.endsWith(".css"))
            ) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request);
        })
    );
    return;
  }

  // For other requests, use cache first strategy
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return (
        response ||
        fetch(event.request).catch((error) => {
          // Failed to fetch
          // Return a fallback response for failed requests
          return new Response("", { status: 404 });
        })
      );
    })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Message event - handle cache clearing requests
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CLEAR_CACHE") {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName);
      });
    });
  }

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
