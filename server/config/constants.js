const { environment } = require("./environment");

// Server configuration constants
const SERVER_CONFIG = {
  PORT: environment.PORT,
  NODE_ENV: environment.NODE_ENV,
};

// JWT configuration
const JWT_CONFIG = {
  SECRET: environment.JWT_SECRET,
  EXPIRES_IN: "30d",
};

// Cache configuration
const CACHE_CONFIG = {
  TASK_CACHE_DURATION: environment.CACHE_DURATION,
  API_TIMEOUT: environment.API_TIMEOUT,
};

// Validation constants
const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 200,
};

// HTTP status codes
const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Error messages
const ERROR_MESSAGES = {
  MONGO_URI_MISSING: "MONGO_URI environment variable is not set!",
  JWT_SECRET_MISSING: "JWT_SECRET environment variable is not set!",
  USER_NOT_FOUND: "User not found",
  TASK_NOT_FOUND: "Task not found",
  INVALID_CREDENTIALS: "Invalid credentials",
  USERNAME_TAKEN: "Username already taken",
  TOKEN_INVALID: "Token invalid",
  TOKEN_MISSING: "No token, authorization denied",
  TASK_TITLE_REQUIRED: "Task title is required",
  SUBTASK_TITLE_REQUIRED: "Subtask title required",
  INVALID_SUBTASK_INDEX: "Invalid subtask index",
};

module.exports = {
  SERVER_CONFIG,
  JWT_CONFIG,
  CACHE_CONFIG,
  VALIDATION,
  STATUS_CODES,
  ERROR_MESSAGES,
};
