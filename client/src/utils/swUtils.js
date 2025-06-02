// Service Worker utilities for handling cache and updates

export const clearServiceWorkerCache = async () => {
  if ("serviceWorker" in navigator) {
    try {
      // Clear all caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));

      // Unregister service worker
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map((registration) => registration.unregister())
      );

      // Service worker cache cleared
    } catch (error) {
      // Error clearing service worker cache
    }
  }
};

export const forceServiceWorkerUpdate = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.waiting) {
        // Send skip waiting message to activate new service worker
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
        // Service worker update triggered
      }
    } catch (error) {
      // Error updating service worker
    }
  }
};

export const checkForServiceWorkerUpdates = () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration) {
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New service worker is ready
                // Optionally reload the page
                window.location.reload();
              }
            });
          }
        });
      }
    });
  }
};

export const setupServiceWorkerHandling = () => {
  // Check for updates on page load
  checkForServiceWorkerUpdates();

  // Listen for service worker messages
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data && event.data.type === "CLEAR_CACHE") {
        clearServiceWorkerCache();
      }
    });
  }
};
