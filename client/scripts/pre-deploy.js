// Pre-deployment script to clear caches and prepare for deployment
const fs = require("fs");
const path = require("path");

// Clear any old deployment info files
const deploymentInfoPath = path.join(
  __dirname,
  "..",
  "src",
  "deployment-info.js"
);
if (fs.existsSync(deploymentInfoPath)) {
  fs.unlinkSync(deploymentInfoPath);
}

// Generate new deployment info
const deploymentId = Date.now().toString();
const buildTime = new Date().toISOString();

const deploymentInfo = {
  deploymentId,
  buildTime,
  timestamp: Date.now(),
  version: process.env.npm_package_version || "1.0.0",
};

const deploymentContent = `// Auto-generated deployment info
export const DEPLOYMENT_INFO = ${JSON.stringify(deploymentInfo, null, 2)};
export const DEPLOYMENT_ID = '${deploymentId}';
export const BUILD_TIME = '${buildTime}';
`;

fs.writeFileSync(deploymentInfoPath, deploymentContent);
