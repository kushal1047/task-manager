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

// Cache tasks to speed up repeated requests
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

// Remove cached tasks for a user
const clearUserCache = (userId) => {
  const cacheKey = `tasks_${userId}`;
  cache.delete(cacheKey);
};

// Get all tasks for the current user (not shared tasks)
router.get(
  "/",
  cacheMiddleware,
  asyncHandler(async (req, res) => {
    const tasks = await Task.find({
      user: req.user.id,
      isShared: { $ne: true }, // Don't include shared tasks here
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.json(tasks);
  })
);

// Create a new task
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { title, dueDate } = req.body;

    // Check if task data is valid
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

// Toggle task completion (only for user's own tasks)
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { completed } = req.body;

    // Find the task and check if it has subtasks
    const currentTask = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).exec();

    if (!currentTask) {
      throw createNotFoundError();
    }

    // Mark task as completed or not
    currentTask.completed = completed;

    // If task has subtasks, mark them all the same way
    if (currentTask.subtasks && currentTask.subtasks.length > 0) {
      currentTask.subtasks.forEach((subtask) => {
        subtask.completed = completed;
      });
    }

    // Save changes to database
    const updated = await currentTask.save();

    // Update shared task copies if this is a shared task
    if (currentTask.isShared && currentTask.sharedTaskId) {
      // Update the original task
      await Task.findByIdAndUpdate(currentTask.sharedTaskId, {
        completed: currentTask.completed,
        subtasks: currentTask.subtasks,
      }).exec();

      // Clear cache for the original task owner
      const originalTask = await Task.findById(currentTask.sharedTaskId).exec();
      if (originalTask) {
        clearUserCache(originalTask.user.toString());
      }

      // Update all other copies of this shared task
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
      // This is an original task that's shared, update all copies
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

// Delete a task (only if it belongs to the user)
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

    // If this was a shared task, delete all copies too
    if (deleted.sharedWith && deleted.sharedWith.length > 0) {
      // Delete all copies of this shared task
      await Task.deleteMany({
        sharedTaskId: deleted._id,
      }).exec();

      // Clear cache for everyone who had this task
      for (const share of deleted.sharedWith) {
        clearUserCache(share.user.toString());
      }
    }

    clearUserCache(req.user.id);
    res.status(STATUS_CODES.NO_CONTENT).end();
  })
);

// Add a subtask
router.post(
  "/:id/subtasks",
  asyncHandler(async (req, res) => {
    const { title } = req.body;

    // Check if task data is valid
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

    // Add subtask to all copies of shared tasks
    if (task.isShared && task.sharedTaskId) {
      // Update the original task
      await Task.findByIdAndUpdate(task.sharedTaskId, {
        $push: { subtasks: { title: title.trim(), completed: false } },
      }).exec();

      // Clear cache for the original task owner
      const originalTask = await Task.findById(task.sharedTaskId).exec();
      if (originalTask) {
        clearUserCache(originalTask.user.toString());
      }

      // Update all other copies of this shared task
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
      // This is an original task that's shared, update all copies
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

// Delete a subtask
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

    // Check if subtask index is valid
    const validation = validateSubtaskIndex(
      parseInt(subtaskIndex),
      task.subtasks?.length || 0
    );
    if (!validation.isValid) {
      throw createBadRequestError(validation.errors.join(", "));
    }

    task.subtasks.splice(parseInt(subtaskIndex), 1);
    await task.save();

    // Remove subtask from all copies of shared tasks
    if (task.isShared && task.sharedTaskId) {
      // Update the original task
      const originalTask = await Task.findById(task.sharedTaskId).exec();
      if (originalTask && originalTask.subtasks[parseInt(subtaskIndex)]) {
        originalTask.subtasks.splice(parseInt(subtaskIndex), 1);
        await originalTask.save();
        // Clear cache for the original task owner
        clearUserCache(originalTask.user.toString());
      }

      // Update all other copies of this shared task
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
      // This is an original task that's shared, update all copies
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

    // Check if subtask index is valid
    const validation = validateSubtaskIndex(
      parseInt(subtaskIndex),
      task.subtasks?.length || 0
    );
    if (!validation.isValid) {
      throw createBadRequestError(validation.errors.join(", "));
    }

    task.subtasks[parseInt(subtaskIndex)].completed = completed;

    // See if parent task completion should change
    const allSubtasksCompleted = task.subtasks.every((s) => s.completed);
    const shouldUpdateParent = task.completed !== allSubtasksCompleted;

    if (shouldUpdateParent) {
      task.completed = allSubtasksCompleted;
    }

    await task.save();

    // Update subtask in all copies of shared tasks
    if (task.isShared && task.sharedTaskId) {
      // Update the original task
      const originalTask = await Task.findById(task.sharedTaskId).exec();
      if (originalTask && originalTask.subtasks[parseInt(subtaskIndex)]) {
        originalTask.subtasks[parseInt(subtaskIndex)].completed = completed;

        // Update parent task completion
        const originalAllSubtasksCompleted = originalTask.subtasks.every(
          (s) => s.completed
        );
        const originalShouldUpdateParent =
          originalTask.completed !== originalAllSubtasksCompleted;

        if (originalShouldUpdateParent) {
          originalTask.completed = originalAllSubtasksCompleted;
        }

        await originalTask.save();
        // Clear cache for the original task owner
        clearUserCache(originalTask.user.toString());
      }

      // Update all other copies of this shared task
      const otherInstances = await Task.find({
        sharedTaskId: task.sharedTaskId,
        _id: { $ne: task._id },
      }).exec();

      for (const instance of otherInstances) {
        if (instance.subtasks[parseInt(subtaskIndex)]) {
          instance.subtasks[parseInt(subtaskIndex)].completed = completed;

          // Update parent task completion
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
      // This is an original task that's shared, update all copies
      const sharedInstances = await Task.find({
        sharedTaskId: task._id,
      }).exec();

      for (const instance of sharedInstances) {
        if (instance.subtasks[parseInt(subtaskIndex)]) {
          instance.subtasks[parseInt(subtaskIndex)].completed = completed;

          // Update parent task completion
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

// Update task completion (don't change subtasks)
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

// Set due date for a task
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

    // Update due date in all copies of shared tasks
    if (task.isShared && task.sharedTaskId) {
      // Update the original task
      await Task.findByIdAndUpdate(task.sharedTaskId, { dueDate }).exec();

      // Clear cache for the original task owner
      const originalTask = await Task.findById(task.sharedTaskId).exec();
      if (originalTask) {
        clearUserCache(originalTask.user.toString());
      }

      // Update all other copies of this shared task
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
      // This is an original task that's shared, update all copies
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
