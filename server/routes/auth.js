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

// Sign up new user
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { firstName, lastName, username, password } = req.body;

    // Check if form data is valid
    const validation = validateRegistration({
      firstName,
      lastName,
      username,
      password,
    });
    if (!validation.isValid) {
      throw createBadRequestError(validation.errors.join(", "));
    }

    // See if username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw createBadRequestError(ERROR_MESSAGES.USERNAME_TAKEN);
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save new user to database
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

// Sign in existing user
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Check if form data is valid
    const validation = validateLogin({ username, password });
    if (!validation.isValid) {
      throw createBadRequestError(validation.errors.join(", "));
    }

    // Look up user by username
    const user = await User.findOne({ username });
    if (!user) {
      throw createUnauthorizedError(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createUnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Create login token
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

// Check if token is still valid
router.get("/validate-token", authMiddleware, (req, res) => {
  res.json({ valid: true });
});

module.exports = router;
