import axios from "axios";

const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fetchTasks = () => api.get("/tasks");
export const createTask = (title) => api.post("/tasks", { title });
export const updateTask = (id, completed) =>
  api.put(`/tasks/${id}`, { completed });
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
