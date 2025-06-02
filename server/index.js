const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/database");
const { SERVER_CONFIG } = require("./config/constants");
const { globalErrorHandler } = require("./utils/errorHandler");
const requestLogger = require("./middleware/requestLogger");
const logger = require("./utils/logger");

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000", // Development
    "https://task-dist.netlify.app", // Your Netlify domain
    "https://task-dist-dev.netlify.app", // If you have a dev version
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(requestLogger);

// Connect to database only if not in test mode
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// Import auth middleware
const authMiddleware = require("./middleware/auth");

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tasks", authMiddleware, require("./routes/tasks"));
app.use("/api/task-sharing", authMiddleware, require("./routes/taskSharing"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: SERVER_CONFIG.NODE_ENV,
  });
});

// Global error handler (must be last)
app.use(globalErrorHandler);

const PORT = SERVER_CONFIG.PORT;

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Server started`, {
      port: PORT,
      environment: SERVER_CONFIG.NODE_ENV,
    });
  });
}

module.exports = app;
