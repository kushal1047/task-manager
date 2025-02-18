export default function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li className="flex items-center justify-between bg-gray-50 p-3 rounded mb-2 shadow-sm">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task._id, !task.completed)}
          className="h-5 w-5 accent-indigo-500"
        />
        <span
          className={`text-lg ${
            task.completed ? "line-through text-gray-400" : "text-gray-800"
          }`}
        >
          {task.title}
        </span>
      </div>
      <button
        onClick={() => onDelete(task._id)}
        className="text-sm text-red-500 hover:text-red-600 transition"
      >
        Delete
      </button>
    </li>
  );
}
