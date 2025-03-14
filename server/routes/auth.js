const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { firstName, lastName, username, password } = req.body;
  try {
    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ msg: "Username taken" });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({ firstName, lastName, username, password: hash });
    await user.save();
    res.status(201).json({
      message: "Registration Successful.",
      user: { id: user._id, username },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "No such user" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    res.json({
      token,
      user: { id: user._id, username, firstName: user.firstName },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/validate-token", authMiddleware, (req, res) => {
  res.json({
    valid: true,
  });
});

module.exports = router;
