import React from "react";

export default function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task._id, !task.completed)}
      />
      <span style={{ textDecoration: task.completed ? "line-through" : "" }}>
        {task.title}
      </span>
      <button onClick={() => onDelete(task._id)}>Delete</button>
    </li>
  );
}
