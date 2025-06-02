const { environment } = require("../config/environment");

/**
 * Log levels
 */
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

/**
 * Logger utility class
 */
class Logger {
  constructor() {
    this.level =
      environment.NODE_ENV === "development"
        ? LOG_LEVELS.INFO
        : LOG_LEVELS.INFO;
  }

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {Error} error - Error object
   * @param {Object} context - Additional context
   */
  error(message, error = null, context = {}) {
    if (this.level >= LOG_LEVELS.ERROR) {
      console.error(`[ERROR] ${message}`, {
        timestamp: new Date().toISOString(),
        error: error?.message || error,
        stack: error?.stack,
        ...context,
      });
    }
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {Object} context - Additional context
   */
  warn(message, context = {}) {
    if (this.level >= LOG_LEVELS.WARN) {
      console.warn(`[WARN] ${message}`, {
        timestamp: new Date().toISOString(),
        ...context,
      });
    }
  }

  /**
   * Log info message
   * @param {string} message - Info message
   * @param {Object} context - Additional context
   */
  info(message, context = {}) {
    if (this.level >= LOG_LEVELS.INFO) {
      console.log(`[INFO] ${message}`, {
        timestamp: new Date().toISOString(),
        ...context,
      });
    }
  }

  /**
   * Log debug message
   * @param {string} message - Debug message
   * @param {Object} context - Additional context
   */
  debug(message, context = {}) {
    if (this.level >= LOG_LEVELS.DEBUG) {
      console.log(`[DEBUG] ${message}`, {
        timestamp: new Date().toISOString(),
        ...context,
      });
    }
  }

  /**
   * Log HTTP request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {number} responseTime - Response time in milliseconds
   */
  logRequest(req, res, responseTime = null) {
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
      userId: req.user?.id,
    };

    if (responseTime !== null) {
      logData.responseTime = `${responseTime}ms`;
    }

    this.info(`${req.method} ${req.url} - ${res.statusCode}`, logData);
  }

  /**
   * Log database operation
   * @param {string} operation - Database operation
   * @param {string} collection - Collection name
   * @param {Object} query - Query object
   * @param {number} duration - Operation duration in milliseconds
   */
  logDatabase(operation, collection, query = {}, duration = null) {
    const logData = {
      operation,
      collection,
      query: JSON.stringify(query),
    };

    if (duration !== null) {
      logData.duration = `${duration}ms`;
    }

    this.debug(`Database ${operation} on ${collection}`, logData);
  }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;
