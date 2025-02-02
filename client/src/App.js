import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  validateToken,
} from "./api";
import { api } from "./api";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./components/Register";
import Login from "./components/Login";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    (async () => {
      if (!token) return setIsValid(false);

      try {
        const res = await validateToken();
        setIsValid(res.status === 200);
      } catch {
        setIsValid(false);
      }
    })();
    if (token) loadTasks();
  }, [isValid]);

  const loadTasks = async () => {
    const res = await fetchTasks();
    setTasks(res.data);
  };

  const handleAdd = async (title) => {
    const res = await createTask(title);
    setTasks([res.data, ...tasks]);
  };
  const handleToggle = async (id, completed) => {
    const res = await updateTask(id, completed);
    setTasks(tasks.map((t) => (t._id === id ? res.data : t)));
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    setTasks(tasks.filter((t) => t._id !== id));
  };
  const handleAuth = () => {
    setIsValid(true); // triggers useEffect again
  };
  return (
    <Router>
      <Routes>
        <Route
          path="/register"
          element={<Register onRegister={handleAuth} />}
        />
        <Route path="/login" element={<Login onLogin={handleAuth} />} />
        <Route
          path="/"
          element={
            <ProtectedRoute isValid>
              <div className="container">
                <h1>Task Manager</h1>
                <TaskForm onAdd={handleAdd} />
                <TaskList
                  tasks={tasks}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
