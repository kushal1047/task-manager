import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import { useNavigate } from "react-router-dom";
export default function TaskView({
  tasks,
  handleAdd,
  handleToggle,
  handleDelete,
}) {
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  const navigate = useNavigate();
  return (
    <div>
      <button className="logout" onClick={handleLogout}>
        Log out
      </button>

      <div className="container">
        <h1>Task Manager</h1>
        <TaskForm onAdd={handleAdd} />
        <TaskList
          tasks={tasks}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
