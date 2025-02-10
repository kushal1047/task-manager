const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// GET all tasks for the logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new task for this user
router.post("/", auth, async (req, res) => {
  try {
    const newTask = await Task.create({
      user: req.user.id,
      title: req.body.title,
    });
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT toggle completion—but only if the task belongs to this user
router.put("/:id", auth, async (req, res) => {
  try {
    const updated = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { completed: req.body.completed },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ msg: "Task not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a task—only if it belongs to the user
router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!deleted) return res.status(404).json({ msg: "Task not found" });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
