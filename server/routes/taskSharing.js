const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const User = require("../models/User");
const TaskShareRequest = require("../models/TaskShareRequest");
const cache = require("../utils/cache");
const {
  asyncHandler,
  createNotFoundError,
  createBadRequestError,
} = require("../utils/errorHandler");
const { STATUS_CODES, ERROR_MESSAGES } = require("../config/constants");

// Clear cache for user
const clearUserCache = (userId) => {
  const cacheKey = `tasks_${userId}`;
  cache.delete(cacheKey);
};

// GET pending share requests for the logged-in user
router.get(
  "/requests",
  asyncHandler(async (req, res) => {
    const requests = await TaskShareRequest.find({
      receiver: req.user.id,
      status: "pending",
    })
      .populate("sender", "firstName lastName username")
      .populate("task", "title")
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.json(requests);
  })
);

// POST send share request
router.post(
  "/send-request",
  asyncHandler(async (req, res) => {
    const { taskId, usernames } = req.body;

    if (
      !taskId ||
      !usernames ||
      !Array.isArray(usernames) ||
      usernames.length === 0
    ) {
      throw createBadRequestError("Task ID and usernames array are required");
    }

    // Verify the task belongs to the sender
    const task = await Task.findOne({
      _id: taskId,
      user: req.user.id,
    }).exec();

    if (!task) {
      throw createNotFoundError(
        "Task not found or you don't have permission to share it"
      );
    }

    // Find users by usernames
    const users = await User.find({ username: { $in: usernames } }).exec();
    const foundUsernames = users.map((user) => user.username);
    const notFoundUsernames = usernames.filter(
      (username) => !foundUsernames.includes(username)
    );

    if (notFoundUsernames.length > 0) {
      throw createBadRequestError(
        `Users not found: ${notFoundUsernames.join(", ")}`
      );
    }

    // Create share requests for each user
    const requests = [];
    for (const user of users) {
      // Check if request already exists
      const existingRequest = await TaskShareRequest.findOne({
        sender: req.user.id,
        receiver: user._id,
        task: taskId,
        status: "pending",
      }).exec();

      if (!existingRequest) {
        const request = await TaskShareRequest.create({
          sender: req.user.id,
          receiver: user._id,
          task: taskId,
        });
        requests.push(request);
      }
    }

    res.status(STATUS_CODES.CREATED).json({
      message: `Share requests sent to ${users.length} users`,
      requests: requests.length,
    });
  })
);

// POST accept share request
router.post(
  "/accept-request/:requestId",
  asyncHandler(async (req, res) => {
    const request = await TaskShareRequest.findOne({
      _id: req.params.requestId,
      receiver: req.user.id,
      status: "pending",
    })
      .populate("task")
      .populate("sender", "firstName lastName username")
      .exec();

    if (!request) {
      throw createNotFoundError("Share request not found");
    }

    // Update request status
    request.status = "accepted";
    request.respondedAt = new Date();
    await request.save();

    // Create a copy of the task for the receiver
    const originalTask = request.task;
    const sharedTask = await Task.create({
      user: req.user.id,
      title: originalTask.title,
      completed: originalTask.completed,
      subtasks: originalTask.subtasks,
      dueDate: originalTask.dueDate,
      isShared: true,
      originalCreator: originalTask.user,
      sharedTaskId: originalTask._id,
    });

    // Update the original task's sharedWith array
    await Task.findByIdAndUpdate(originalTask._id, {
      $push: {
        sharedWith: {
          user: req.user.id,
          accepted: true,
          acceptedAt: new Date(),
        },
      },
    }).exec();

    clearUserCache(req.user.id);
    clearUserCache(originalTask.user.toString());

    // Force clear all possible cache keys for the receiver
    const cacheKeys = [
      `tasks_${req.user.id}`,
      `shared_tasks_${req.user.id}`,
      `tasks_${originalTask.user.toString()}`,
      `shared_tasks_${originalTask.user.toString()}`,
    ];

    cacheKeys.forEach((key) => cache.delete(key));

    res.json({
      message: "Task shared successfully",
      sharedTask,
    });
  })
);

// POST decline share request
router.post(
  "/decline-request/:requestId",
  asyncHandler(async (req, res) => {
    const request = await TaskShareRequest.findOneAndUpdate(
      {
        _id: req.params.requestId,
        receiver: req.user.id,
        status: "pending",
      },
      {
        status: "declined",
        respondedAt: new Date(),
      },
      { new: true }
    ).exec();

    if (!request) {
      throw createNotFoundError("Share request not found");
    }

    res.json({
      message: "Share request declined",
    });
  })
);

// GET shared tasks for the logged-in user
router.get(
  "/shared-tasks",
  asyncHandler(async (req, res) => {
    const sharedTasks = await Task.find({
      user: req.user.id,
      isShared: true,
    })
      .populate("originalCreator", "firstName lastName username")
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.json(sharedTasks);
  })
);

// DELETE unlink shared task (remove from receiver's view)
router.delete(
  "/unlink-task/:taskId",
  asyncHandler(async (req, res) => {
    const task = await Task.findOne({
      _id: req.params.taskId,
      user: req.user.id,
      isShared: true,
    }).exec();

    if (!task) {
      throw createNotFoundError("Shared task not found");
    }

    // Remove from original task's sharedWith array
    await Task.findByIdAndUpdate(task.sharedTaskId, {
      $pull: {
        sharedWith: { user: req.user.id },
      },
    }).exec();

    // Delete the shared task instance
    await Task.findByIdAndDelete(req.params.taskId).exec();

    clearUserCache(req.user.id);
    clearUserCache(task.originalCreator.toString());

    res.status(STATUS_CODES.NO_CONTENT).end();
  })
);

// POST sync shared task changes
router.post(
  "/sync-changes/:taskId",
  asyncHandler(async (req, res) => {
    const { changes } = req.body;
    const task = await Task.findOne({
      _id: req.params.taskId,
      user: req.user.id,
    }).exec();

    if (!task) {
      throw createNotFoundError("Task not found");
    }

    // Apply changes to the task
    if (changes.completed !== undefined) {
      task.completed = changes.completed;
    }
    if (changes.subtasks !== undefined) {
      task.subtasks = changes.subtasks;
    }
    if (changes.dueDate !== undefined) {
      task.dueDate = changes.dueDate;
    }

    await task.save();

    // If this is a shared task, sync changes to all other instances
    if (task.isShared && task.sharedTaskId) {
      // Update the original task
      await Task.findByIdAndUpdate(task.sharedTaskId, {
        completed: task.completed,
        subtasks: task.subtasks,
        dueDate: task.dueDate,
      }).exec();

      // Update all other shared instances
      const otherInstances = await Task.find({
        sharedTaskId: task.sharedTaskId,
        _id: { $ne: task._id },
      }).exec();

      for (const instance of otherInstances) {
        instance.completed = task.completed;
        instance.subtasks = task.subtasks;
        instance.dueDate = task.dueDate;
        await instance.save();
        clearUserCache(instance.user.toString());
      }
    } else if (task.sharedWith && task.sharedWith.length > 0) {
      // This is an original task that's shared, update all shared instances
      const sharedInstances = await Task.find({
        sharedTaskId: task._id,
      }).exec();

      for (const instance of sharedInstances) {
        instance.completed = task.completed;
        instance.subtasks = task.subtasks;
        instance.dueDate = task.dueDate;
        await instance.save();
        clearUserCache(instance.user.toString());
      }
    }

    clearUserCache(req.user.id);
    res.json(task);
  })
);

module.exports = router;
