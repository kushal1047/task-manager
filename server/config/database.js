const mongoose = require("mongoose");
const { environment, validateEnvironment } = require("./environment");

/**
 * Connects to MongoDB database
 * @returns {Promise<mongoose.Connection>} Database connection
 */
const connectDB = async () => {
  try {
    // Validate environment variables
    validateEnvironment();

    const conn = await mongoose.connect(environment.MONGO_URI, {
      maxPoolSize: 5,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    return conn;
  } catch (error) {
    process.exit(1);
  }
};

// Optimize mongoose for better performance
// Disable debug mode to reduce console clutter
mongoose.set("debug", false);

module.exports = connectDB;
