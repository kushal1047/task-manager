// Debug utilities for identifying deployment issues

export const checkAssetLoading = async () => {
  const assets = [
    "/static/js/main.js",
    "/static/css/main.css",
    "/manifest.json",
    "/favicon.ico",
  ];

  for (const asset of assets) {
    try {
      const response = await fetch(asset);
      const contentType = response.headers.get("content-type");
      const status = response.status;

      if (status === 200 && contentType) {
        if (asset.endsWith(".js") && !contentType.includes("javascript")) {
          // MIME type error for JS file
        } else if (asset.endsWith(".css") && !contentType.includes("css")) {
          // MIME type error for CSS file
        }
      }
    } catch (error) {
      // Failed to load asset
    }
  }
};

export const checkServiceWorker = () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration) {
        // Service Worker Status available
      } else {
        // No Service Worker registered
      }
    });
  } else {
    // Service Worker not supported
  }
};

export const checkCache = async () => {
  if ("caches" in window) {
    try {
      const cacheNames = await caches.keys();

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        await cache.keys();
        // Cache entries available
      }
    } catch (error) {
      // Error checking cache
    }
  }
};

export const clearAllCaches = async () => {
  // Clear browser cache
  if ("caches" in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
  }

  // Clear localStorage
  localStorage.clear();

  // Unregister service workers
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations.map((registration) => registration.unregister())
    );
  }
};

export const debugDeployment = () => {
  // Check current deployment info
  // Note: deploymentInfo object removed to prevent unused variable warning

  // Check assets
  checkAssetLoading();

  // Check service worker
  checkServiceWorker();

  // Check cache
  checkCache();
};
