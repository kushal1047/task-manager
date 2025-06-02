import { useState, useCallback, useEffect, useRef } from "react";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  addSubtask,
  removeSubtask,
  toggleSubtask,
  setTaskDueDate,
  getSharedTasks,
  unlinkSharedTask,
} from "../api";
import { ERROR_MESSAGES } from "../config/constants";
import storage from "../utils/storage";

/**
 * Custom hook for task management
 * Provides centralized task state and operations
 */
export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [sharedTasks, setSharedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatingTasks, setUpdatingTasks] = useState(new Set());
  const mountedRef = useRef(true);

  // Load tasks from API
  const loadTasks = useCallback(async () => {
    // Check if user is authenticated before making API calls
    const token = storage.getToken();
    if (!token) {
      if (mountedRef.current) {
        setLoading(false);
      }
      return;
    }

    if (mountedRef.current) {
      setLoading(true);
      setError(null);
    }

    try {
      const [tasksResponse, sharedTasksResponse] = await Promise.all([
        fetchTasks(),
        getSharedTasks(),
      ]);

      if (mountedRef.current) {
        setTasks(tasksResponse.data);
        setSharedTasks(sharedTasksResponse);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || ERROR_MESSAGES.NETWORK_ERROR);
        console.error("Failed to load tasks:", err);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Refresh all tasks when a share request is accepted
  const refreshSharedTasks = useCallback(async () => {
    try {
      const [tasksResponse, sharedTasksResponse] = await Promise.all([
        fetchTasks(),
        getSharedTasks(),
      ]);

      if (mountedRef.current) {
        setTasks(tasksResponse.data);
        setSharedTasks(sharedTasksResponse);
      }
    } catch (err) {
      console.error("Failed to refresh tasks:", err);
    }
  }, []);

  // Create new task without optimistic update to preserve animations
  const handleAddTask = useCallback(async (title, dueDate) => {
    try {
      const response = await createTask(title, dueDate);
      // Add the task only after server response
      setTasks((prev) => [response.data, ...prev]);
    } catch (err) {
      throw err;
    }
  }, []);

  // Toggle task completion with optimistic update
  const handleToggleTask = useCallback(
    async (id, completed) => {
      // Prevent multiple rapid clicks
      if (updatingTasks.has(id)) return;

      setUpdatingTasks((prev) => new Set(prev).add(id));

      // Find the task to check if it has subtasks
      const task =
        tasks.find((t) => t._id === id) ||
        sharedTasks.find((t) => t._id === id);
      const hasSubtasks =
        task && Array.isArray(task.subtasks) && task.subtasks.length > 0;

      // Optimistic update for both regular and shared tasks
      setTasks((prev) =>
        prev.map((t) =>
          t._id === id
            ? {
                ...t,
                completed,
                // Update all subtasks to match parent task completion
                ...(hasSubtasks && {
                  subtasks: t.subtasks.map((st) => ({ ...st, completed })),
                }),
              }
            : t
        )
      );

      // Also update shared tasks if this is a shared task
      setSharedTasks((prev) =>
        prev.map((t) =>
          t._id === id
            ? {
                ...t,
                completed,
                // Update all subtasks to match parent task completion
                ...(hasSubtasks && {
                  subtasks: t.subtasks.map((st) => ({ ...st, completed })),
                }),
              }
            : t
        )
      );

      try {
        const response = await updateTask(id, completed);
        // Update with server response (which includes updated subtasks)
        setTasks((prev) => prev.map((t) => (t._id === id ? response.data : t)));
        setSharedTasks((prev) =>
          prev.map((t) => (t._id === id ? response.data : t))
        );
      } catch (err) {
        // Revert on error - only revert parent task, not subtasks
        setTasks((prev) =>
          prev.map((t) => (t._id === id ? { ...t, completed: !completed } : t))
        );
        setSharedTasks((prev) =>
          prev.map((t) => (t._id === id ? { ...t, completed: !completed } : t))
        );
        throw err;
      } finally {
        setUpdatingTasks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    },
    [tasks, sharedTasks, updatingTasks]
  );

  // Delete task with optimistic update
  const handleDeleteTask = useCallback(
    async (id) => {
      // Prevent multiple rapid clicks
      if (updatingTasks.has(id)) return;

      setUpdatingTasks((prev) => new Set(prev).add(id));

      // Store task for potential rollback
      const taskToDelete = tasks.find((t) => t._id === id);

      // Optimistic update
      setTasks((prev) => prev.filter((t) => t._id !== id));

      try {
        await deleteTask(id);
      } catch (err) {
        // Restore task on error
        setTasks((prev) => [...prev, taskToDelete]);
        throw err;
      } finally {
        setUpdatingTasks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    },
    [tasks, updatingTasks]
  );

  // Add subtask without optimistic update to preserve animations
  const handleAddSubtask = useCallback(
    async (taskId, title) => {
      const task =
        tasks.find((t) => t._id === taskId) ||
        sharedTasks.find((t) => t._id === taskId);
      if (!task) return;

      try {
        const response = await addSubtask(taskId, title);
        const updatedTask = response.data;

        // Just update the task with server response (backend handles parent task completion)
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? updatedTask : t))
        );
        setSharedTasks((prev) =>
          prev.map((t) => (t._id === taskId ? updatedTask : t))
        );
      } catch (err) {
        throw err;
      }
    },
    [tasks, sharedTasks]
  );

  // Toggle subtask completion with optimistic update
  const handleToggleSubtask = useCallback(
    async (taskId, subtaskIndex, completed) => {
      const task =
        tasks.find((t) => t._id === taskId) ||
        sharedTasks.find((t) => t._id === taskId);
      if (!task || !task.subtasks) return;

      // Optimistic update for subtask in both regular and shared tasks
      setTasks((prev) =>
        prev.map((t) =>
          t._id === taskId
            ? {
                ...t,
                subtasks: t.subtasks.map((st, idx) =>
                  idx === subtaskIndex ? { ...st, completed } : st
                ),
              }
            : t
        )
      );

      setSharedTasks((prev) =>
        prev.map((t) =>
          t._id === taskId
            ? {
                ...t,
                subtasks: t.subtasks.map((st, idx) =>
                  idx === subtaskIndex ? { ...st, completed } : st
                ),
              }
            : t
        )
      );

      try {
        const response = await toggleSubtask(taskId, subtaskIndex, completed);
        const updatedTask = response.data;

        // Just update the task with server response (backend now handles parent task completion)
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? updatedTask : t))
        );
        setSharedTasks((prev) =>
          prev.map((t) => (t._id === taskId ? updatedTask : t))
        );
      } catch (err) {
        // Revert on error
        setTasks((prev) =>
          prev.map((t) =>
            t._id === taskId
              ? {
                  ...t,
                  subtasks: t.subtasks.map((st, idx) =>
                    idx === subtaskIndex ? { ...st, completed: !completed } : st
                  ),
                }
              : t
          )
        );
        setSharedTasks((prev) =>
          prev.map((t) =>
            t._id === taskId
              ? {
                  ...t,
                  subtasks: t.subtasks.map((st, idx) =>
                    idx === subtaskIndex ? { ...st, completed: !completed } : st
                  ),
                }
              : t
          )
        );
        throw err;
      }
    },
    [tasks, sharedTasks]
  );

  // Delete subtask with optimistic update
  const handleDeleteSubtask = useCallback(
    async (taskId, subtaskIndex) => {
      const task =
        tasks.find((t) => t._id === taskId) ||
        sharedTasks.find((t) => t._id === taskId);
      if (!task || !task.subtasks) return;

      const subtaskToDelete = task.subtasks[subtaskIndex];

      // Optimistic update for both regular and shared tasks
      setTasks((prev) =>
        prev.map((t) =>
          t._id === taskId
            ? {
                ...t,
                subtasks: t.subtasks.filter((_, idx) => idx !== subtaskIndex),
              }
            : t
        )
      );

      setSharedTasks((prev) =>
        prev.map((t) =>
          t._id === taskId
            ? {
                ...t,
                subtasks: t.subtasks.filter((_, idx) => idx !== subtaskIndex),
              }
            : t
        )
      );

      try {
        const response = await removeSubtask(taskId, subtaskIndex);
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? response.data : t))
        );
        setSharedTasks((prev) =>
          prev.map((t) => (t._id === taskId ? response.data : t))
        );
      } catch (err) {
        // Restore on error
        setTasks((prev) =>
          prev.map((t) =>
            t._id === taskId
              ? {
                  ...t,
                  subtasks: [
                    ...t.subtasks.slice(0, subtaskIndex),
                    subtaskToDelete,
                    ...t.subtasks.slice(subtaskIndex),
                  ],
                }
              : t
          )
        );
        setSharedTasks((prev) =>
          prev.map((t) =>
            t._id === taskId
              ? {
                  ...t,
                  subtasks: [
                    ...t.subtasks.slice(0, subtaskIndex),
                    subtaskToDelete,
                    ...t.subtasks.slice(subtaskIndex),
                  ],
                }
              : t
          )
        );
        throw err;
      }
    },
    [tasks, sharedTasks]
  );

  // Set due date with optimistic update
  const handleSetDueDate = useCallback(
    async (taskId, dueDate) => {
      const task =
        tasks.find((t) => t._id === taskId) ||
        sharedTasks.find((t) => t._id === taskId);
      if (!task) return;

      const oldDueDate = task.dueDate;

      // Optimistic update for both regular and shared tasks
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, dueDate } : t))
      );

      setSharedTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, dueDate } : t))
      );

      try {
        const response = await setTaskDueDate(taskId, dueDate);
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? response.data : t))
        );
        setSharedTasks((prev) =>
          prev.map((t) => (t._id === taskId ? response.data : t))
        );
      } catch (err) {
        // Revert on error
        setTasks((prev) =>
          prev.map((t) =>
            t._id === taskId ? { ...t, dueDate: oldDueDate } : t
          )
        );
        setSharedTasks((prev) =>
          prev.map((t) =>
            t._id === taskId ? { ...t, dueDate: oldDueDate } : t
          )
        );
        throw err;
      }
    },
    [tasks, sharedTasks]
  );

  // Handle unlinking shared task
  const handleUnlinkSharedTask = useCallback(
    async (taskId) => {
      // Prevent multiple rapid clicks
      if (updatingTasks.has(taskId)) return;

      setUpdatingTasks((prev) => new Set(prev).add(taskId));

      // Optimistic update
      setSharedTasks((prev) => prev.filter((t) => t._id !== taskId));

      try {
        await unlinkSharedTask(taskId);
      } catch (err) {
        // Restore task on error
        const taskToRestore = sharedTasks.find((t) => t._id === taskId);
        if (taskToRestore) {
          setSharedTasks((prev) => [...prev, taskToRestore]);
        }
        throw err;
      } finally {
        setUpdatingTasks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        });
      }
    },
    [sharedTasks, updatingTasks]
  );

  // Load tasks on mount - but only if authenticated
  useEffect(() => {
    // Reset mounted ref on mount
    mountedRef.current = true;

    const token = storage.getToken();
    if (token) {
      loadTasks();
    }

    // Cleanup function
    return () => {
      mountedRef.current = false;
    };
  }, [loadTasks]);

  // Poll for both regular and shared task updates every 5 seconds
  useEffect(() => {
    const token = storage.getToken();
    if (!token) return;

    const interval = setInterval(async () => {
      if (mountedRef.current) {
        try {
          // Poll both regular tasks AND shared tasks for bidirectional sync
          const [tasksResponse, sharedTasksResponse] = await Promise.all([
            fetchTasks(),
            getSharedTasks(),
          ]);

          if (mountedRef.current) {
            // Force state update by comparing content to ensure React detects changes
            setTasks((prev) => {
              const newTasks = tasksResponse.data;
              return JSON.stringify(prev) !== JSON.stringify(newTasks)
                ? newTasks
                : prev;
            });

            setSharedTasks((prev) => {
              const newSharedTasks = sharedTasksResponse;
              return JSON.stringify(prev) !== JSON.stringify(newSharedTasks)
                ? newSharedTasks
                : prev;
            });
          }
        } catch (err) {
          console.error("Failed to poll for task updates:", err);
        }
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    tasks,
    sharedTasks,
    loading,
    error,
    updatingTasks,
    loadTasks,
    refreshSharedTasks,
    handleAddTask,
    handleToggleTask,
    handleDeleteTask,
    handleAddSubtask,
    handleToggleSubtask,
    handleDeleteSubtask,
    handleSetDueDate,
    handleUnlinkSharedTask,
  };
};
