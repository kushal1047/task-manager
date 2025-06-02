// API configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || "http://localhost:5000",
  TIMEOUT: 30000,
  ENDPOINTS: {
    AUTH: {
      REGISTER: "/api/auth/register",
      LOGIN: "/api/auth/login",
      VALIDATE_TOKEN: "/api/auth/validate-token",
    },
    TASKS: {
      LIST: "/api/tasks",
      CREATE: "/api/tasks",
      UPDATE: (id) => `/api/tasks/${id}`,
      DELETE: (id) => `/api/tasks/${id}`,
      COMPLETION: (id) => `/api/tasks/${id}/completion`,
      DUE_DATE: (id) => `/api/tasks/${id}/due-date`,
      SUBTASKS: {
        ADD: (taskId) => `/api/tasks/${taskId}/subtasks`,
        DELETE: (taskId, index) => `/api/tasks/${taskId}/subtasks/${index}`,
        TOGGLE: (taskId, index) => `/api/tasks/${taskId}/subtasks/${index}`,
      },
    },
    TASK_SHARING: {
      GET_REQUESTS: "/api/task-sharing/requests",
      SEND_REQUEST: "/api/task-sharing/send-request",
      ACCEPT_REQUEST: (requestId) =>
        `/api/task-sharing/accept-request/${requestId}`,
      DECLINE_REQUEST: (requestId) =>
        `/api/task-sharing/decline-request/${requestId}`,
      GET_SHARED_TASKS: "/api/task-sharing/shared-tasks",
      UNLINK_TASK: (taskId) => `/api/task-sharing/unlink-task/${taskId}`,
    },
  },
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER_ID: "userId",
  USER_NAME: "name",
  SOUND_ENABLED: "soundEnabled",
  SOUND_VOLUME: "soundVolume",
};

// Validation constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  TASK_TITLE_MAX_LENGTH: 200,
};

// UI constants
export const UI = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 200,
  CONGRATS_DISPLAY_TIME: 3000,
  MAX_TASKS_DISPLAY: 3,
  SOUND_FREQUENCIES: {
    TASK_COMPLETE: { start: 800, end: 1200 },
    TASK_UNCHECK: { start: 600, end: 400 },
    SUBTASK_COMPLETE: { start: 1000, end: 1400 },
    SUBTASK_UNCHECK: { start: 500, end: 300 },
  },
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  TIMEOUT_ERROR: "Request timeout. Please try again.",
  VALIDATION_ERROR: "Please check your input and try again.",
  AUTH_ERROR: "Authentication failed. Please log in again.",
  TASK_CREATE_ERROR: "Failed to create task. Please try again.",
  TASK_UPDATE_ERROR: "Failed to update task. Please try again.",
  TASK_DELETE_ERROR: "Failed to delete task. Please try again.",
  SUBTASK_ERROR: "Failed to update subtask. Please try again.",
};

// Success messages
export const SUCCESS_MESSAGES = {
  TASK_CREATED: "Task created successfully",
  TASK_UPDATED: "Task updated successfully",
  TASK_DELETED: "Task deleted successfully",
  SUBTASK_ADDED: "Subtask added successfully",
  SUBTASK_UPDATED: "Subtask updated successfully",
  SUBTASK_DELETED: "Subtask deleted successfully",
};

// Route paths
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
};

// Task categories
export const TASK_CATEGORIES = {
  DUE_TASKS: "dueTasks",
  OTHER_TASKS: "otherTasks",
};

const constants = {
  API_CONFIG,
  STORAGE_KEYS,
  VALIDATION,
  UI,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROUTES,
  TASK_CATEGORIES,
};

export default constants;
