const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// GET all tasks
router.get("/", async (req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.json(tasks);
});

// POST a new task
router.post("/", async (req, res) => {
  const { title } = req.body;
  const newTask = new Task({ title });
  const saved = await newTask.save();
  res.status(201).json(saved);
});
