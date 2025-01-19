require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Routes
const authRouter = require("./routes/auth");
app.use("/api/auth", authRouter);

const tasksRouter = require("./routes/tasks");
// protect task routes
const authMiddleware = require("./middleware/auth");
app.use("/api/tasks", authMiddleware, tasksRouter);

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
