// Script to generate deployment version information
const fs = require("fs");
const path = require("path");

// Generate a unique deployment ID
const deploymentId = Date.now().toString();
const buildTime = new Date().toISOString();

// Create deployment info
const deploymentInfo = {
  deploymentId,
  buildTime,
  timestamp: Date.now(),
  version: process.env.npm_package_version || "1.0.0",
};

// Write to a file that can be imported
const deploymentPath = path.join(__dirname, "..", "src", "deployment-info.js");
const deploymentContent = `// Auto-generated deployment info
export const DEPLOYMENT_INFO = ${JSON.stringify(deploymentInfo, null, 2)};
export const DEPLOYMENT_ID = '${deploymentId}';
export const BUILD_TIME = '${buildTime}';
export const CACHE_BUST = '${deploymentId}';
`;

fs.writeFileSync(deploymentPath, deploymentContent);

// Also create a simple cache-busting file for debugging
const cacheBustPath = path.join(__dirname, "..", "public", "cache-bust.txt");
fs.writeFileSync(
  cacheBustPath,
  `Deployment: ${deploymentId}\nBuild Time: ${buildTime}\n`
);
