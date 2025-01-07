import React from "react";

export default function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task._id, !task.completed)}
      />
      <span
        style={{
          textDecoration: task.completed ? "line-through" : "",
          marginLeft: "1rem",
        }}
      >
        <h4> {task.title}</h4>
      </span>
      <button className="delete-link" onClick={() => onDelete(task._id)}>
        Delete
      </button>
    </li>
  );
}
