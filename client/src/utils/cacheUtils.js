// Helper functions for managing browser cache

// Get build info if available
let DEPLOYMENT_ID = null;
let BUILD_TIME = null;

try {
  const deploymentInfo = require("../deployment-info.js");
  DEPLOYMENT_ID = deploymentInfo.DEPLOYMENT_ID;
  BUILD_TIME = deploymentInfo.BUILD_TIME;
} catch (error) {
  // Use fallback values if build info isn't available
  DEPLOYMENT_ID = process.env.REACT_APP_BUILD_TIME || Date.now().toString();
  BUILD_TIME = new Date().toISOString();
}

export const clearStaleCache = async () => {
  if ("caches" in window) {
    try {
      const cacheNames = await caches.keys();
      const currentAppCache = cacheNames.find(
        (name) => name.includes("task-app") || name.includes("task-dist")
      );

      // Clear old caches but keep the current one
      await Promise.all(
        cacheNames
          .filter((name) => name !== currentAppCache)
          .map((name) => caches.delete(name))
      );

      // Old cache cleared
    } catch (error) {
      // Error clearing cache
    }
  }
};

export const detectDeploymentChange = () => {
  const lastDeployment = localStorage.getItem("lastDeployment");
  const currentDeployment = DEPLOYMENT_ID;

  if (lastDeployment && lastDeployment !== currentDeployment) {
    localStorage.setItem("lastDeployment", currentDeployment);
    return true; // Build has changed
  } else if (!lastDeployment) {
    localStorage.setItem("lastDeployment", currentDeployment);
  }

  return false; // No build change detected
};

export const forceReloadIfNeeded = () => {
  const deploymentChanged = detectDeploymentChange();

  if (deploymentChanged) {
    // Clear cache and reload the page
    clearStaleCache().then(() => {
      // Wait a bit to make sure cache is cleared
      setTimeout(() => {
        window.location.reload();
      }, 100);
    });
  }
};

export const setupCacheHandling = () => {
  // Clear old cache when app starts
  clearStaleCache();

  // Check if build has changed
  const deploymentChanged = detectDeploymentChange();

  if (deploymentChanged) {
    // Build changed, cache cleared
  }

  return deploymentChanged;
};

// Export build info for debugging
export const getDeploymentInfo = () => ({
  deploymentId: DEPLOYMENT_ID,
  buildTime: BUILD_TIME,
  lastDeployment: localStorage.getItem("lastDeployment"),
});
