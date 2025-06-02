const mongoose = require("mongoose");

const TaskShareRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    respondedAt: { type: Date },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

TaskShareRequestSchema.index({ receiver: 1, status: 1 }); // index for pending requests
TaskShareRequestSchema.index({ sender: 1, task: 1 }); // index for sender's requests

module.exports = mongoose.model("TaskShareRequest", TaskShareRequestSchema);
