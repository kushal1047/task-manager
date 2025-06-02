// Cache utility functions for handling deployment scenarios

// Import deployment info if available
let DEPLOYMENT_ID = null;
let BUILD_TIME = null;

try {
  const deploymentInfo = require("../deployment-info.js");
  DEPLOYMENT_ID = deploymentInfo.DEPLOYMENT_ID;
  BUILD_TIME = deploymentInfo.BUILD_TIME;
} catch (error) {
  // Fallback if deployment info is not available
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

      // Clear all caches except the current app cache
      await Promise.all(
        cacheNames
          .filter((name) => name !== currentAppCache)
          .map((name) => caches.delete(name))
      );

      // Stale cache cleared
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
    return true; // Deployment has changed
  } else if (!lastDeployment) {
    localStorage.setItem("lastDeployment", currentDeployment);
  }

  return false; // No deployment change detected
};

export const forceReloadIfNeeded = () => {
  const deploymentChanged = detectDeploymentChange();

  if (deploymentChanged) {
    // Clear all caches and reload
    clearStaleCache().then(() => {
      // Small delay to ensure cache is cleared
      setTimeout(() => {
        window.location.reload();
      }, 100);
    });
  }
};

export const setupCacheHandling = () => {
  // Clear stale cache on app load
  clearStaleCache();

  // Check for deployment changes
  const deploymentChanged = detectDeploymentChange();

  if (deploymentChanged) {
    // Deployment change detected, clearing cache
  }

  return deploymentChanged;
};

// Export deployment info for debugging
export const getDeploymentInfo = () => ({
  deploymentId: DEPLOYMENT_ID,
  buildTime: BUILD_TIME,
  lastDeployment: localStorage.getItem("lastDeployment"),
});
