import axios from "axios";

export const fetchTasks = () => axios.get("/api/tasks");
export const createTask = (title) => axios.post("/api/tasks", { title });
export const updateTask = (id, completed) =>
  axios.put(`/api/tasks/${id}`, { completed });
export const deleteTask = (id) => axios.delete(`/api/tasks/${id}`);
