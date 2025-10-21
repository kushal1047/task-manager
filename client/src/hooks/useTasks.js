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
 * Hook for managing tasks and shared tasks
 * Handles all task operations and state updates
 */
export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [sharedTasks, setSharedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatingTasks, setUpdatingTasks] = useState(new Set());
  const mountedRef = useRef(true);

  // Fetch tasks from server
  const loadTasks = useCallback(async () => {
    // Make sure user is logged in before fetching
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

  // Reload tasks when sharing changes
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

  // Add new task (no optimistic update to keep animations smooth)
  const handleAddTask = useCallback(async (title, dueDate) => {
    try {
      const response = await createTask(title, dueDate);
      // Add task to list after server confirms
      setTasks((prev) => [response.data, ...prev]);
    } catch (err) {
      throw err;
    }
  }, []);

  // Toggle task completion (with optimistic update)
  const handleToggleTask = useCallback(
    async (id, completed) => {
      // Don't allow multiple clicks at once
      if (updatingTasks.has(id)) return;

      setUpdatingTasks((prev) => new Set(prev).add(id));

      // Check if task has subtasks
      const task =
        tasks.find((t) => t._id === id) ||
        sharedTasks.find((t) => t._id === id);
      const hasSubtasks =
        task && Array.isArray(task.subtasks) && task.subtasks.length > 0;

      // Update UI immediately for both regular and shared tasks
      setTasks((prev) =>
        prev.map((t) =>
          t._id === id
            ? {
                ...t,
                completed,
                // Mark all subtasks as completed too
                ...(hasSubtasks && {
                  subtasks: t.subtasks.map((st) => ({ ...st, completed })),
                }),
              }
            : t
        )
      );

      // Update shared tasks too if this is a shared task
      setSharedTasks((prev) =>
        prev.map((t) =>
          t._id === id
            ? {
                ...t,
                completed,
                // Mark all subtasks as completed too
                ...(hasSubtasks && {
                  subtasks: t.subtasks.map((st) => ({ ...st, completed })),
                }),
              }
            : t
        )
      );

      try {
        const response = await updateTask(id, completed);
        // Update with server response
        setTasks((prev) => prev.map((t) => (t._id === id ? response.data : t)));
        setSharedTasks((prev) =>
          prev.map((t) => (t._id === id ? response.data : t))
        );
      } catch (err) {
        // Revert changes if server call failed
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

  // Delete task (with optimistic update)
  const handleDeleteTask = useCallback(
    async (id) => {
      // Don't allow multiple clicks at once
      if (updatingTasks.has(id)) return;

      setUpdatingTasks((prev) => new Set(prev).add(id));

      // Keep task data in case we need to restore it
      const taskToDelete = tasks.find((t) => t._id === id);

      // Remove from UI immediately
      setTasks((prev) => prev.filter((t) => t._id !== id));

      try {
        await deleteTask(id);
      } catch (err) {
        // Put task back if unlinking failed
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

  // Add subtask (no optimistic update to keep animations smooth)
  const handleAddSubtask = useCallback(
    async (taskId, title) => {
      const task =
        tasks.find((t) => t._id === taskId) ||
        sharedTasks.find((t) => t._id === taskId);
      if (!task) return;

      try {
        const response = await addSubtask(taskId, title);
        const updatedTask = response.data;

        // Update task with server response
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

  // Toggle subtask completion (with optimistic update)
  const handleToggleSubtask = useCallback(
    async (taskId, subtaskIndex, completed) => {
      const task =
        tasks.find((t) => t._id === taskId) ||
        sharedTasks.find((t) => t._id === taskId);
      if (!task || !task.subtasks) return;

      // Update subtask immediately in both regular and shared tasks
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

        // Update task with server response
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? updatedTask : t))
        );
        setSharedTasks((prev) =>
          prev.map((t) => (t._id === taskId ? updatedTask : t))
        );
      } catch (err) {
        // Revert changes if server call failed
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

  // Delete subtask (with optimistic update)
  const handleDeleteSubtask = useCallback(
    async (taskId, subtaskIndex) => {
      const task =
        tasks.find((t) => t._id === taskId) ||
        sharedTasks.find((t) => t._id === taskId);
      if (!task || !task.subtasks) return;

      const subtaskToDelete = task.subtasks[subtaskIndex];

      // Update UI immediately for both regular and shared tasks
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

  // Set due date (with optimistic update)
  const handleSetDueDate = useCallback(
    async (taskId, dueDate) => {
      const task =
        tasks.find((t) => t._id === taskId) ||
        sharedTasks.find((t) => t._id === taskId);
      if (!task) return;

      const oldDueDate = task.dueDate;

      // Update UI immediately for both regular and shared tasks
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
        // Revert changes if server call failed
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

  // Unlink shared task
  const handleUnlinkSharedTask = useCallback(
    async (taskId) => {
      // Don't allow multiple clicks at once
      if (updatingTasks.has(taskId)) return;

      setUpdatingTasks((prev) => new Set(prev).add(taskId));

      // Remove from UI immediately
      setSharedTasks((prev) => prev.filter((t) => t._id !== taskId));

      try {
        await unlinkSharedTask(taskId);
      } catch (err) {
        // Put task back if unlinking failed
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

  // Load tasks when component mounts (only if user is logged in)
  useEffect(() => {
    // Reset tracking variable when component mounts
    mountedRef.current = true;

    const token = storage.getToken();
    if (token) {
      loadTasks();
    }

    // Clean up when component unmounts
    return () => {
      mountedRef.current = false;
    };
  }, [loadTasks]);

  // Check for task updates every 5 seconds
  useEffect(() => {
    const token = storage.getToken();
    if (!token) return;

    const interval = setInterval(async () => {
      if (mountedRef.current) {
        try {
          // Fetch both regular and shared tasks to keep them in sync
          const [tasksResponse, sharedTasksResponse] = await Promise.all([
            fetchTasks(),
            getSharedTasks(),
          ]);

          if (mountedRef.current) {
            // Only update state if data actually changed
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
    }, 5000); // Check every 5 seconds

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
