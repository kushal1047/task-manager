const mongoose = require("mongoose");

// Task model with subtasks and sharing support
const TaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, // reference to User
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    subtasks: [
      {
        title: { type: String, required: true },
        completed: { type: Boolean, default: false },
      },
    ],
    dueDate: { type: Date },
    // Fields for sharing tasks with other users
    isShared: { type: Boolean, default: false },
    originalCreator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sharedWith: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        accepted: { type: Boolean, default: false },
        acceptedAt: { type: Date },
      },
    ],
    // For tracking shared task instances
    sharedTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

TaskSchema.index({ user: 1, createdAt: -1 }); // index for faster lookups by user
TaskSchema.index({ originalCreator: 1 }); // index for shared tasks lookup
TaskSchema.index({ sharedTaskId: 1 }); // index for shared task instances

module.exports = mongoose.model("Task", TaskSchema);
