import TaskItem from "./TaskItem";
import { AnimatePresence, motion } from "framer-motion";

export default function TaskList({
  tasks,
  onToggle,
  onDelete,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onSetDueDate,
  onUnlinkTask,
  showEmpty,
  updatingTasks,
}) {
  // Animation variants for task items
  const taskVariants = {
    initial: {
      opacity: 0,
      y: -20,
      scale: 0.95,
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  return (
    <ul>
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <motion.li
            key={task._id}
            layout
            variants={taskVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              layout: {
                duration: 0.4,
                ease: "easeInOut",
              },
              opacity: {
                duration: 0.3,
                ease: "easeOut",
              },
              y: {
                duration: 0.3,
                ease: "easeOut",
              },
              scale: {
                duration: 0.2,
                ease: "easeOut",
              },
            }}
          >
            <TaskItem
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onAddSubtask={onAddSubtask}
              onToggleSubtask={onToggleSubtask}
              onDeleteSubtask={onDeleteSubtask}
              onSetDueDate={onSetDueDate}
              onUnlinkTask={onUnlinkTask}
              isUpdating={updatingTasks?.has(task._id)}
            />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
