const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const exists = await User.findOne({ username });
  if (exists) return res.status(400).json({ msg: "Username taken" });

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = new User({ username, password: hash });
  await user.save();
});
