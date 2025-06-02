const logger = require("../utils/logger");

/**
 * Request logging middleware
 * Logs all HTTP requests with timing information
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Skip logging for polling requests to reduce console clutter
  const isPollingRequest =
    req.url.includes("/api/tasks") ||
    req.url.includes("/api/task-sharing") ||
    req.url.includes("/requests") ||
    req.url.includes("/shared-tasks") ||
    req.url.includes("/api/task-sharing/requests") ||
    req.url.includes("/api/task-sharing/shared-tasks");

  if (!isPollingRequest) {
    // Log request start (only for non-polling requests)
    logger.debug(`Request started: ${req.method} ${req.url}`, {
      method: req.method,
      url: req.url,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
    });
  }

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const duration = Date.now() - start;

    // Log request completion (only for non-polling requests)
    if (!isPollingRequest) {
      logger.logRequest(req, res, duration);
    }

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

module.exports = requestLogger;
