import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  validateToken,
} from "./api";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./components/Register";
import Login from "./components/Login";
import TaskView from "./components/TaskView";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [isValid, setIsValid] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    (async () => {
      if (!token) return setIsValid(false);

      try {
        const { valid } = await validateToken();
        console.log(valid);
        setIsValid(valid);
      } catch {
        setIsValid(false);
      }
    })();
    if (token) loadTasks();
  }, []);

  const handleLogin = () => {
    setIsValid(true);
  };

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
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route
          path="/"
          element={
            <ProtectedRoute isValid={isValid}>
              <TaskView
                tasks={tasks}
                handleAdd={handleAdd}
                handleToggle={handleToggle}
                handleDelete={handleDelete}
              />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
