const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/database");
const { SERVER_CONFIG } = require("./config/constants");
const { globalErrorHandler } = require("./utils/errorHandler");
const requestLogger = require("./middleware/requestLogger");
const logger = require("./utils/logger");

const app = express();

// Allow requests from these domains
const corsOptions = {
  origin: [
    "http://localhost:3000", // Local development
    "https://task-dist.netlify.app", // Old deployment
    "https://task-dist-dev.netlify.app", // Dev deployment
    "https://kushal-task-manager.netlify.app", // Current deployment
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Set up middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(requestLogger);

// Connect to database (skip in test mode)
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// Load auth middleware
const authMiddleware = require("./middleware/auth");

// Set up API routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tasks", authMiddleware, require("./routes/tasks"));
app.use("/api/task-sharing", authMiddleware, require("./routes/taskSharing"));

// API info endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Task Manager API Server",
    status: "Running",
    timestamp: new Date().toISOString(),
    environment: SERVER_CONFIG.NODE_ENV,
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      tasks: "/api/tasks",
      taskSharing: "/api/task-sharing",
    },
  });
});

// Server health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: SERVER_CONFIG.NODE_ENV,
  });
});

// Handle all errors (must be last middleware)
app.use(globalErrorHandler);

const PORT = SERVER_CONFIG.PORT;

// Start server only when run directly (not when imported)
if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Server started`, {
      port: PORT,
      environment: SERVER_CONFIG.NODE_ENV,
    });
  });
}

module.exports = app;
