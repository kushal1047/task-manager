const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const cache = require("../utils/cache");
const {
  validateTaskCreation,
  validateSubtaskCreation,
  validateSubtaskIndex,
} = require("../utils/validation");
const {
  asyncHandler,
  createNotFoundError,
  createBadRequestError,
} = require("../utils/errorHandler");
const { STATUS_CODES, ERROR_MESSAGES } = require("../config/constants");

// Cache middleware
const cacheMiddleware = (req, res, next) => {
  const cacheKey = `tasks_${req.user.id}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    return res.json(cached);
  }

  res.sendResponse = res.json;
  res.json = (data) => {
    cache.set(cacheKey, data);
    res.sendResponse(data);
  };

  next();
};

// Clear cache for user
const clearUserCache = (userId) => {
  const cacheKey = `tasks_${userId}`;
  cache.delete(cacheKey);
};

// GET all tasks for the logged-in user (only original tasks, not shared ones)
router.get(
  "/",
  cacheMiddleware,
  asyncHandler(async (req, res) => {
    const tasks = await Task.find({
      user: req.user.id,
      isShared: { $ne: true }, // Exclude shared tasks from this endpoint
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.json(tasks);
  })
);

// POST a new task for this user
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { title, dueDate } = req.body;

    // Validate input
    const validation = validateTaskCreation({ title, dueDate });
    if (!validation.isValid) {
      throw createBadRequestError(validation.errors.join(", "));
    }

    const newTask = await Task.create({
      user: req.user.id,
      title: title.trim(),
      dueDate,
    });

    clearUserCache(req.user.id);
    res.status(STATUS_CODES.CREATED).json(newTask);
  })
);

// PUT toggle completion—but only if the task belongs to this user
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { completed } = req.body;

    // Get the current task to check if it has subtasks
    const currentTask = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).exec();

    if (!currentTask) {
      throw createNotFoundError();
    }

    // Update the task completion
    currentTask.completed = completed;

    // If task has subtasks, update all subtasks to match parent task completion
    if (currentTask.subtasks && currentTask.subtasks.length > 0) {
      currentTask.subtasks.forEach((subtask) => {
        subtask.completed = completed;
      });
    }

    // Save the updated task
    const updated = await currentTask.save();

    // Sync changes to shared task instances if this is a shared task
    if (currentTask.isShared && currentTask.sharedTaskId) {
      // Update the original task
      await Task.findByIdAndUpdate(currentTask.sharedTaskId, {
        completed: currentTask.completed,
        subtasks: currentTask.subtasks,
      }).exec();

      // Clear cache for the original task creator
      const originalTask = await Task.findById(currentTask.sharedTaskId).exec();
      if (originalTask) {
        clearUserCache(originalTask.user.toString());
      }

      // Update all other shared instances
      const otherInstances = await Task.find({
        sharedTaskId: currentTask.sharedTaskId,
        _id: { $ne: currentTask._id },
      }).exec();

      for (const instance of otherInstances) {
        instance.completed = currentTask.completed;
        instance.subtasks = currentTask.subtasks;
        await instance.save();
        clearUserCache(instance.user.toString());
      }
    } else if (currentTask.sharedWith && currentTask.sharedWith.length > 0) {
      // This is an original task that's shared, update all shared instances
      const sharedInstances = await Task.find({
        sharedTaskId: currentTask._id,
      }).exec();

      for (const instance of sharedInstances) {
        instance.completed = currentTask.completed;
        instance.subtasks = currentTask.subtasks;
        await instance.save();
        clearUserCache(instance.user.toString());
      }
    }

    clearUserCache(req.user.id);
    res.json(updated);
  })
);

// DELETE a task—only if it belongs to the user
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const deleted = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    }).exec();

    if (!deleted) {
      throw createNotFoundError();
    }

    // If this was a shared task, also delete all shared instances
    if (deleted.sharedWith && deleted.sharedWith.length > 0) {
      // Delete all shared instances of this task
      await Task.deleteMany({
        sharedTaskId: deleted._id,
      }).exec();

      // Clear cache for all affected users
      for (const share of deleted.sharedWith) {
        clearUserCache(share.user.toString());
      }
    }

    clearUserCache(req.user.id);
    res.status(STATUS_CODES.NO_CONTENT).end();
  })
);

// Add a subtask to a task
router.post(
  "/:id/subtasks",
  asyncHandler(async (req, res) => {
    const { title } = req.body;

    // Validate input
    const validation = validateSubtaskCreation({ title });
    if (!validation.isValid) {
      throw createBadRequestError(validation.errors.join(", "));
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $push: { subtasks: { title: title.trim(), completed: false } } },
      { new: true }
    ).exec();

    if (!task) {
      throw createNotFoundError();
    }

    // Sync subtask addition to shared task instances
    if (task.isShared && task.sharedTaskId) {
      // Update the original task
      await Task.findByIdAndUpdate(task.sharedTaskId, {
        $push: { subtasks: { title: title.trim(), completed: false } },
      }).exec();

      // Clear cache for the original task creator
      const originalTask = await Task.findById(task.sharedTaskId).exec();
      if (originalTask) {
        clearUserCache(originalTask.user.toString());
      }

      // Update all other shared instances
      const otherInstances = await Task.find({
        sharedTaskId: task.sharedTaskId,
        _id: { $ne: task._id },
      }).exec();

      for (const instance of otherInstances) {
        instance.subtasks.push({ title: title.trim(), completed: false });
        await instance.save();
        clearUserCache(instance.user.toString());
      }
    } else if (task.sharedWith && task.sharedWith.length > 0) {
      // This is an original task that's shared, update all shared instances
      const sharedInstances = await Task.find({
        sharedTaskId: task._id,
      }).exec();

      for (const instance of sharedInstances) {
        instance.subtasks.push({ title: title.trim(), completed: false });
        await instance.save();
        clearUserCache(instance.user.toString());
      }
    }

    clearUserCache(req.user.id);
    res.json(task);
  })
);

// Remove a subtask by index
router.delete(
  "/:id/subtasks/:subtaskIndex",
  asyncHandler(async (req, res) => {
    const { subtaskIndex } = req.params;
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).exec();

    if (!task) {
      throw createNotFoundError();
    }

    // Validate subtask index
    const validation = validateSubtaskIndex(
      parseInt(subtaskIndex),
      task.subtasks?.length || 0
    );
    if (!validation.isValid) {
      throw createBadRequestError(validation.errors.join(", "));
    }

    task.subtasks.splice(parseInt(subtaskIndex), 1);
    await task.save();

    // Sync subtask deletion to shared task instances
    if (task.isShared && task.sharedTaskId) {
      // Update the original task
      const originalTask = await Task.findById(task.sharedTaskId).exec();
      if (originalTask && originalTask.subtasks[parseInt(subtaskIndex)]) {
        originalTask.subtasks.splice(parseInt(subtaskIndex), 1);
        await originalTask.save();
        // Clear cache for the original task creator
        clearUserCache(originalTask.user.toString());
      }

      // Update all other shared instances
      const otherInstances = await Task.find({
        sharedTaskId: task.sharedTaskId,
        _id: { $ne: task._id },
      }).exec();

      for (const instance of otherInstances) {
        if (instance.subtasks[parseInt(subtaskIndex)]) {
          instance.subtasks.splice(parseInt(subtaskIndex), 1);
          await instance.save();
          clearUserCache(instance.user.toString());
        }
      }
    } else if (task.sharedWith && task.sharedWith.length > 0) {
      // This is an original task that's shared, update all shared instances
      const sharedInstances = await Task.find({
        sharedTaskId: task._id,
      }).exec();

      for (const instance of sharedInstances) {
        if (instance.subtasks[parseInt(subtaskIndex)]) {
          instance.subtasks.splice(parseInt(subtaskIndex), 1);
          await instance.save();
          clearUserCache(instance.user.toString());
        }
      }
    }

    clearUserCache(req.user.id);
    res.json(task);
  })
);

// Toggle subtask completion
router.patch(
  "/:id/subtasks/:subtaskIndex",
  asyncHandler(async (req, res) => {
    const { subtaskIndex } = req.params;
    const { completed } = req.body;
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).exec();

    if (!task) {
      throw createNotFoundError();
    }

    // Validate subtask index
    const validation = validateSubtaskIndex(
      parseInt(subtaskIndex),
      task.subtasks?.length || 0
    );
    if (!validation.isValid) {
      throw createBadRequestError(validation.errors.join(", "));
    }

    task.subtasks[parseInt(subtaskIndex)].completed = completed;

    // Check if we need to update parent task completion
    const allSubtasksCompleted = task.subtasks.every((s) => s.completed);
    const shouldUpdateParent = task.completed !== allSubtasksCompleted;

    if (shouldUpdateParent) {
      task.completed = allSubtasksCompleted;
    }

    await task.save();

    // Sync subtask toggle to shared task instances
    if (task.isShared && task.sharedTaskId) {
      // Update the original task
      const originalTask = await Task.findById(task.sharedTaskId).exec();
      if (originalTask && originalTask.subtasks[parseInt(subtaskIndex)]) {
        originalTask.subtasks[parseInt(subtaskIndex)].completed = completed;

        // Update parent task completion for original task
        const originalAllSubtasksCompleted = originalTask.subtasks.every(
          (s) => s.completed
        );
        const originalShouldUpdateParent =
          originalTask.completed !== originalAllSubtasksCompleted;

        if (originalShouldUpdateParent) {
          originalTask.completed = originalAllSubtasksCompleted;
        }

        await originalTask.save();
        // Clear cache for the original task creator
        clearUserCache(originalTask.user.toString());
      }

      // Update all other shared instances
      const otherInstances = await Task.find({
        sharedTaskId: task.sharedTaskId,
        _id: { $ne: task._id },
      }).exec();

      for (const instance of otherInstances) {
        if (instance.subtasks[parseInt(subtaskIndex)]) {
          instance.subtasks[parseInt(subtaskIndex)].completed = completed;

          // Update parent task completion for other instances
          const instanceAllSubtasksCompleted = instance.subtasks.every(
            (s) => s.completed
          );
          const instanceShouldUpdateParent =
            instance.completed !== instanceAllSubtasksCompleted;

          if (instanceShouldUpdateParent) {
            instance.completed = instanceAllSubtasksCompleted;
          }

          await instance.save();
          clearUserCache(instance.user.toString());
        }
      }
    } else if (task.sharedWith && task.sharedWith.length > 0) {
      // This is an original task that's shared, update all shared instances
      const sharedInstances = await Task.find({
        sharedTaskId: task._id,
      }).exec();

      for (const instance of sharedInstances) {
        if (instance.subtasks[parseInt(subtaskIndex)]) {
          instance.subtasks[parseInt(subtaskIndex)].completed = completed;

          // Update parent task completion for shared instances
          const instanceAllSubtasksCompleted = instance.subtasks.every(
            (s) => s.completed
          );
          const instanceShouldUpdateParent =
            instance.completed !== instanceAllSubtasksCompleted;

          if (instanceShouldUpdateParent) {
            instance.completed = instanceAllSubtasksCompleted;
          }

          await instance.save();
          clearUserCache(instance.user.toString());
        }
      }
    }

    clearUserCache(req.user.id);
    res.json(task);
  })
);

// Update task completion only (without affecting subtasks)
router.patch(
  "/:id/completion",
  asyncHandler(async (req, res) => {
    const { completed } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { completed },
      { new: true, runValidators: true }
    ).exec();

    if (!task) {
      throw createNotFoundError();
    }

    clearUserCache(req.user.id);
    res.json(task);
  })
);

// Set or update due date for a task
router.patch(
  "/:id/due-date",
  asyncHandler(async (req, res) => {
    const { dueDate } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { dueDate },
      { new: true, runValidators: true }
    ).exec();

    if (!task) {
      throw createNotFoundError();
    }

    // Sync due date changes to shared task instances
    if (task.isShared && task.sharedTaskId) {
      // Update the original task
      await Task.findByIdAndUpdate(task.sharedTaskId, { dueDate }).exec();

      // Clear cache for the original task creator
      const originalTask = await Task.findById(task.sharedTaskId).exec();
      if (originalTask) {
        clearUserCache(originalTask.user.toString());
      }

      // Update all other shared instances
      const otherInstances = await Task.find({
        sharedTaskId: task.sharedTaskId,
        _id: { $ne: task._id },
      }).exec();

      for (const instance of otherInstances) {
        instance.dueDate = dueDate;
        await instance.save();
        clearUserCache(instance.user.toString());
      }
    } else if (task.sharedWith && task.sharedWith.length > 0) {
      // This is an original task that's shared, update all shared instances
      const sharedInstances = await Task.find({
        sharedTaskId: task._id,
      }).exec();

      for (const instance of sharedInstances) {
        instance.dueDate = dueDate;
        await instance.save();
        clearUserCache(instance.user.toString());
      }
    }

    clearUserCache(req.user.id);
    res.json(task);
  })
);

module.exports = router;
