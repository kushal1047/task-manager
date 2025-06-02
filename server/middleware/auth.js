const jwt = require("jsonwebtoken");
const { JWT_CONFIG, ERROR_MESSAGES } = require("../config/constants");
const { createUnauthorizedError } = require("../utils/errorHandler");

/**
 * Authentication middleware
 * Verifies JWT token and adds user info to request
 */
const auth = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return next(createUnauthorizedError(ERROR_MESSAGES.TOKEN_MISSING));
  }

  try {
    const decoded = jwt.verify(token, JWT_CONFIG.SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    next(createUnauthorizedError(ERROR_MESSAGES.TOKEN_INVALID));
  }
};

module.exports = auth;
