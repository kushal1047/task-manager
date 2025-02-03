// server/models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// virtual to populate all tasks for a user
UserSchema.virtual("tasks", {
  ref: "Task", // refers to Task model
  localField: "_id", // matches this User’s _id
  foreignField: "user", // to Task.user
  justOne: false,
});

module.exports = mongoose.model("User", UserSchema);
