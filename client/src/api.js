import axios from "axios";

export const api = axios.create({ baseURL: "/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const registerUser = (creds) =>
  api.post("/auth/register", creds).then((r) => r.data);
export const loginUser = (creds) =>
  api.post("/auth/login", creds).then((r) => r.data);

export const fetchTasks = () => api.get("/tasks");
export const createTask = (title) => api.post("/tasks", { title });
export const updateTask = (id, completed) =>
  api.put(`/tasks/${id}`, { completed });
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
