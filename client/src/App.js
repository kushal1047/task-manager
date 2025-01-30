import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { fetchTasks, createTask, updateTask, deleteTask } from "./api";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./components/Register";
import Login from "./components/Login";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("user"));
    if (saved) setUser(saved);
    loadTasks();
  }, []);

  const handleAuth = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
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
        <Route path="/register" element={<Register onAuth={handleAuth} />} />
        <Route path="/login" element={<Login onAuth={handleAuth} />} />
        <Route
          path="/"
          element={
            <ProtectedRoute user={user}>
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
