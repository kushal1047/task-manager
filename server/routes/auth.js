const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const { validateRegistration, validateLogin } = require("../utils/validation");
const {
  asyncHandler,
  createBadRequestError,
  createUnauthorizedError,
} = require("../utils/errorHandler");
const {
  JWT_CONFIG,
  STATUS_CODES,
  ERROR_MESSAGES,
} = require("../config/constants");

const router = express.Router();

// Register
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { firstName, lastName, username, password } = req.body;

    // Validate input
    const validation = validateRegistration({
      firstName,
      lastName,
      username,
      password,
    });
    if (!validation.isValid) {
      throw createBadRequestError(validation.errors.join(", "));
    }

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw createBadRequestError(ERROR_MESSAGES.USERNAME_TAKEN);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      firstName,
      lastName,
      username,
      password: hashedPassword,
    });

    await user.save();

    res.status(STATUS_CODES.CREATED).json({
      message: "Registration successful",
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
      },
    });
  })
);

// Login
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Validate input
    const validation = validateLogin({ username, password });
    if (!validation.isValid) {
      throw createBadRequestError(validation.errors.join(", "));
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      throw createUnauthorizedError(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createUnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, JWT_CONFIG.SECRET, {
      expiresIn: JWT_CONFIG.EXPIRES_IN,
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
      },
    });
  })
);

// Validate token
router.get("/validate-token", authMiddleware, (req, res) => {
  res.json({ valid: true });
});

module.exports = router;
