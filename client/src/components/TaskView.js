import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import { useNavigate } from "react-router";

export default function TaskView({
  tasks,
  handleAdd,
  handleToggle,
  handleDelete,
}) {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-100 to-white px-2 py-6">
      <div className="flex justify-end mb-8">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Log Out
        </button>
      </div>

      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md py-6 px-3">
        <h1 className="italic text-3xl font-bold text-indigo-600 mb-6 text-center">
          Get it Done
        </h1>
        <h1 className="text-md text-indigo-600 mb-2">
          Hi <span className="font-bold">{name}</span>, let's remember to...
        </h1>
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
