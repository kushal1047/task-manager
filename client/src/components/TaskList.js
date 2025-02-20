import TaskItem from "./TaskItem";

export default function TaskList({ tasks, onToggle, onDelete }) {
  if (!tasks.length)
    return (
      <p className="text-center text-gray-500 font-medium">
        No tasks yet. You're free as a bird 🐦
      </p>
    );

  return (
    <ul>
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
