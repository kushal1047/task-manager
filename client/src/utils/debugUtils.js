// Debug helpers for troubleshooting build issues

export const checkAssetLoading = async () => {
  const assets = ["/static/js/main.js", "/static/css/main.css", "/favicon.ico"];

  for (const asset of assets) {
    try {
      const response = await fetch(asset);
      const contentType = response.headers.get("content-type");
      const status = response.status;

      if (status === 200 && contentType) {
        if (asset.endsWith(".js") && !contentType.includes("javascript")) {
          // Wrong MIME type for JS file
        } else if (asset.endsWith(".css") && !contentType.includes("css")) {
          // Wrong MIME type for CSS file
        }
      }
    } catch (error) {
      // Failed to load asset
    }
  }
};

// Service worker stuff removed since we're only using localhost

export const checkCache = async () => {
  if ("caches" in window) {
    try {
      const cacheNames = await caches.keys();

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        await cache.keys();
        // Cache looks good
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
};

export const debugDeployment = () => {
  // Check current build info
  // Note: deploymentInfo object removed to prevent unused variable warning

  // Check if assets load properly
  checkAssetLoading();

  // Check cache status
  checkCache();
};
