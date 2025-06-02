require("dotenv").config();

/**
 * Environment configuration
 * Validates and provides access to environment variables
 */
const environment = {
  // Server configuration
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT) || 5000,

  // Database configuration
  MONGO_URI: process.env.MONGO_URI,

  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET,

  // Client configuration
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",

  // API configuration
  API_TIMEOUT: parseInt(process.env.API_TIMEOUT) || 30000,

  // Cache configuration
  CACHE_DURATION: parseInt(process.env.CACHE_DURATION) || 5 * 60 * 1000, // 5 minutes
};

/**
 * Validates required environment variables
 * @throws {Error} If required environment variables are missing
 */
const validateEnvironment = () => {
  const required = ["MONGO_URI", "JWT_SECRET"];
  const missing = required.filter((key) => !environment[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
};

/**
 * Checks if the application is running in development mode
 * @returns {boolean}
 */
const isDevelopment = () => environment.NODE_ENV === "development";

/**
 * Checks if the application is running in production mode
 * @returns {boolean}
 */
const isProduction = () => environment.NODE_ENV === "production";

module.exports = {
  environment,
  validateEnvironment,
  isDevelopment,
  isProduction,
};
