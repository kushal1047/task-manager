import { useState } from "react";

export default function TaskForm({ onAdd }) {
  const [title, setTitle] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title);
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a new task..."
        className="flex-1 px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition"
      >
        Add
      </button>
    </form>
  );
}
