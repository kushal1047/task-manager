const { STATUS_CODES, ERROR_MESSAGES } = require("../config/constants");

/**
 * Custom error class for application errors
 */
class AppError extends Error {
  constructor(message, statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Creates a standardized error response
 * @param {Error} error - Error object
 * @param {Object} res - Express response object
 */
const sendErrorResponse = (error, res) => {
  const statusCode = error.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR;
  const message = error.message || "Internal server error";

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

/**
 * Async error handler wrapper for route handlers
 * @param {Function} fn - Async route handler function
 * @returns {Function} - Wrapped function with error handling
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Global error handler middleware
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const globalErrorHandler = (error, req, res, next) => {
  // Handle specific error types
  if (error.name === "ValidationError") {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      error: "Validation error",
      details: Object.values(error.errors).map((err) => err.message),
    });
  }

  if (error.name === "CastError") {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      error: "Invalid ID format",
    });
  }

  if (error.name === "JsonWebTokenError") {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({
      error: ERROR_MESSAGES.TOKEN_INVALID,
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({
      error: "Token expired",
    });
  }

  // Default error response
  sendErrorResponse(error, res);
};

/**
 * Creates a not found error
 * @param {string} message - Error message
 * @returns {AppError} - Not found error
 */
const createNotFoundError = (message = ERROR_MESSAGES.TASK_NOT_FOUND) => {
  return new AppError(message, STATUS_CODES.NOT_FOUND);
};

/**
 * Creates a bad request error
 * @param {string} message - Error message
 * @returns {AppError} - Bad request error
 */
const createBadRequestError = (message) => {
  return new AppError(message, STATUS_CODES.BAD_REQUEST);
};

/**
 * Creates an unauthorized error
 * @param {string} message - Error message
 * @returns {AppError} - Unauthorized error
 */
const createUnauthorizedError = (message = ERROR_MESSAGES.TOKEN_INVALID) => {
  return new AppError(message, STATUS_CODES.UNAUTHORIZED);
};

module.exports = {
  AppError,
  sendErrorResponse,
  asyncHandler,
  globalErrorHandler,
  createNotFoundError,
  createBadRequestError,
  createUnauthorizedError,
};
