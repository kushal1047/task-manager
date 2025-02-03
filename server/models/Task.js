const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, // reference to User
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

TaskSchema.index({ user: 1, createdAt: -1 }); // index for faster lookups by user
module.exports = mongoose.model("Task", TaskSchema);
