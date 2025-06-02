import axios from "axios";
import { API_CONFIG, ERROR_MESSAGES } from "./config/constants";
import storage from "./utils/storage";

// Create axios instance with configuration
export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

// Request interceptor to add authentication token
api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout");
      return Promise.reject(new Error(ERROR_MESSAGES.TIMEOUT_ERROR));
    }

    // Handle network connectivity issues
    if (!error.response) {
      console.error("Network error:", error);
      return Promise.reject(new Error(ERROR_MESSAGES.NETWORK_ERROR));
    }

    // Handle authentication errors - don't auto-redirect, let components handle it
    if (error.response.status === 401) {
      console.log("Authentication error - clearing auth data");
      storage.clearAuth();
      // Don't auto-redirect, let the component handle the navigation
      return Promise.reject(new Error(ERROR_MESSAGES.AUTH_ERROR));
    }

    // Handle validation errors
    if (error.response.status === 400) {
      const errorMessage =
        error.response.data?.error || ERROR_MESSAGES.VALIDATION_ERROR;
      return Promise.reject(new Error(errorMessage));
    }

    // Handle server errors
    if (error.response.status >= 500) {
      console.error("Server error:", error.response.data);
      return Promise.reject(new Error("Server error. Please try again later."));
    }

    // Handle other errors
    const errorMessage =
      error.response.data?.error || "An unexpected error occurred";
    return Promise.reject(new Error(errorMessage));
  }
);

// Authentication API functions
export const registerUser = async (credentials) => {
  const response = await api.post(
    API_CONFIG.ENDPOINTS.AUTH.REGISTER,
    credentials
  );
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
  return response.data;
};

export const validateToken = async () => {
  const response = await api.get(API_CONFIG.ENDPOINTS.AUTH.VALIDATE_TOKEN);
  return response.data;
};

// Task API functions
export const fetchTasks = async () => {
  const response = await api.get(API_CONFIG.ENDPOINTS.TASKS.LIST);
  return response;
};

export const createTask = async (title, dueDate) => {
  const taskData = dueDate ? { title, dueDate } : { title };
  const response = await api.post(API_CONFIG.ENDPOINTS.TASKS.CREATE, taskData);
  return response;
};

export const updateTask = async (id, completed) => {
  const response = await api.put(API_CONFIG.ENDPOINTS.TASKS.UPDATE(id), {
    completed,
  });
  return response;
};

export const updateTaskCompletionOnly = async (id, completed) => {
  const response = await api.patch(API_CONFIG.ENDPOINTS.TASKS.COMPLETION(id), {
    completed,
  });
  return response;
};

export const deleteTask = async (id) => {
  const response = await api.delete(API_CONFIG.ENDPOINTS.TASKS.DELETE(id));
  return response;
};

export const setTaskDueDate = async (id, dueDate) => {
  const response = await api.patch(API_CONFIG.ENDPOINTS.TASKS.DUE_DATE(id), {
    dueDate,
  });
  return response;
};

// Subtask API functions
export const addSubtask = async (taskId, title) => {
  const response = await api.post(
    API_CONFIG.ENDPOINTS.TASKS.SUBTASKS.ADD(taskId),
    { title }
  );
  return response;
};

export const removeSubtask = async (taskId, subtaskIndex) => {
  const response = await api.delete(
    API_CONFIG.ENDPOINTS.TASKS.SUBTASKS.DELETE(taskId, subtaskIndex)
  );
  return response;
};

export const toggleSubtask = async (taskId, subtaskIndex, completed) => {
  const response = await api.patch(
    API_CONFIG.ENDPOINTS.TASKS.SUBTASKS.TOGGLE(taskId, subtaskIndex),
    { completed }
  );
  return response;
};

// Health check function
export const checkHealth = async () => {
  const response = await api.get("/health");
  return response.data;
};

// Task sharing API functions
export const getShareRequests = async () => {
  const response = await api.get(
    API_CONFIG.ENDPOINTS.TASK_SHARING.GET_REQUESTS
  );
  return response.data;
};

export const sendShareRequest = async (taskId, usernames) => {
  const response = await api.post(
    API_CONFIG.ENDPOINTS.TASK_SHARING.SEND_REQUEST,
    {
      taskId,
      usernames,
    }
  );
  return response.data;
};

export const acceptShareRequest = async (requestId) => {
  const response = await api.post(
    API_CONFIG.ENDPOINTS.TASK_SHARING.ACCEPT_REQUEST(requestId)
  );
  return response.data;
};

export const declineShareRequest = async (requestId) => {
  const response = await api.post(
    API_CONFIG.ENDPOINTS.TASK_SHARING.DECLINE_REQUEST(requestId)
  );
  return response.data;
};

export const getSharedTasks = async () => {
  const response = await api.get(
    API_CONFIG.ENDPOINTS.TASK_SHARING.GET_SHARED_TASKS
  );
  return response.data;
};

export const unlinkSharedTask = async (taskId) => {
  const response = await api.delete(
    API_CONFIG.ENDPOINTS.TASK_SHARING.UNLINK_TASK(taskId)
  );
  return response.data;
};
