const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const authRouter = require("./routes/auth");
app.use("/api/auth", authRouter);

const tasksRouter = require("./routes/tasks");
// protect task routes
const authMiddleware = require("./middleware/auth");
app.use("/api/tasks", authMiddleware, tasksRouter);

module.exports = app;
