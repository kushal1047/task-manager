export default function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li className="flex justify-between items-start bg-gray-50 p-3 rounded mb-2 shadow-sm">
      <div className="flex gap-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task._id, !task.completed)}
          className="h-6 w-6 shrink-0 accent-indigo-500"
        />
        <p
          className={`text-lg leading-tight font-medium ${
            task.completed ? "line-through text-gray-400" : "text-gray-800"
          }`}
        >
          {task.title}
        </p>
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
