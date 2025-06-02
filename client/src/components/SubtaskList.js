import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import soundManager from "../utils/sound";

export default function SubtaskList({
  task,
  subtasksOpen,
  setSubtasksOpen,
  showSubtaskForm,
  setShowSubtaskForm,
  subtaskTitle,
  setSubtaskTitle,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}) {
  const hasSubtasks = Array.isArray(task.subtasks) && task.subtasks.length > 0;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubtaskSubmit = async (e) => {
    e.preventDefault();
    if (!subtaskTitle.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddSubtask(task._id, subtaskTitle);
      setSubtaskTitle("");
      // Keep accordion open when adding subtasks
      setSubtasksOpen(true);
    } catch (error) {
      console.error("Failed to add subtask:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants for subtask items
  const subtaskVariants = {
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
      y: -1,
      scale: 0.995,
      transition: {
        duration: 0.25,
        ease: "easeInOut",
      },
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1,
      },
    },
  };

  // Animation variants for checkbox
  const checkboxVariants = {
    checked: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    unchecked: {
      scale: 1,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Animation variants for delete button
  const deleteButtonVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    hover: {
      scale: 1.1,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    tap: {
      scale: 0.9,
      transition: {
        duration: 0.1,
      },
    },
  };

  return (
    <>
      {/* Subtasks accordion */}
      {hasSubtasks && (
        <div className="mt-1.5 flex flex-col">
          <div
            className="flex items-center cursor-pointer select-none group max-w-[150px]"
            onClick={() => setSubtasksOpen((open) => !open)}
            tabIndex={0}
            role="button"
            aria-expanded={subtasksOpen}
          >
            <svg
              className={`w-4 h-4 mr-1 transition-transform duration-200 text-indigo-400 group-hover:text-indigo-700 ${
                subtasksOpen ? "rotate-90" : "rotate-0"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 16 16"
              strokeWidth={2}
            >
              <polyline points="5,3 11,8 5,13" />
            </svg>
            <span className="text-sm font-semibold text-indigo-400 hover:text-indigo-700 group-hover:underline">
              SubTasks ({task.subtasks.length})
            </span>
          </div>
          {subtasksOpen && (
            <>
              <ul className="mt-2 space-y-1">
                {[...task.subtasks]
                  .map((sub, idx) => ({ sub, origIdx: idx }))
                  .sort(
                    (a, b) => Number(a.sub.completed) - Number(b.sub.completed)
                  )
                  .map(({ sub, origIdx }) => (
                    <AnimatePresence
                      key={sub._id || `subtask-${origIdx}`}
                      mode="wait"
                    >
                      <motion.li
                        layout
                        variants={subtaskVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        whileHover="hover"
                        whileTap="tap"
                        transition={{
                          layout: {
                            duration: 0.3,
                            ease: "easeInOut",
                          },
                        }}
                        className="flex items-center mb-1 p-1 rounded-lg transition-colors duration-200"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <motion.div
                            variants={checkboxVariants}
                            animate={sub.completed ? "checked" : "unchecked"}
                            className="flex items-center justify-center"
                          >
                            <input
                              type="checkbox"
                              checked={sub.completed}
                              onChange={async () => {
                                const newCompleted = !sub.completed;
                                // Play sound based on the new state
                                if (newCompleted) {
                                  await soundManager.playSubtaskCheckSound();
                                } else {
                                  await soundManager.playSubtaskUncheckSound();
                                }
                                onToggleSubtask(
                                  task._id,
                                  origIdx,
                                  newCompleted
                                );
                              }}
                              className="h-5 w-5 accent-indigo-400 cursor-pointer"
                            />
                          </motion.div>
                          <motion.span
                            className={`text-lg flex items-center transition-all duration-300 ${
                              sub.completed
                                ? "line-through text-gray-400"
                                : "text-gray-700"
                            }`}
                            transition={{
                              duration: 0.3,
                              ease: "easeInOut",
                            }}
                          >
                            {sub.title}
                          </motion.span>
                          <motion.button
                            variants={deleteButtonVariants}
                            initial="initial"
                            animate="animate"
                            whileHover="hover"
                            whileTap="tap"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSubtask(task._id, origIdx);
                            }}
                            className="ml-4 text-xs text-red-500 hover:text-red-700 flex items-center justify-center p-1 rounded-full hover:bg-red-50"
                            aria-label="Delete subtask"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 16 16"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <line
                                x1="4"
                                y1="4"
                                x2="12"
                                y2="12"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                              />
                              <line
                                x1="12"
                                y1="4"
                                x2="4"
                                y2="12"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                              />
                            </svg>
                          </motion.button>
                        </div>
                      </motion.li>
                    </AnimatePresence>
                  ))}
              </ul>
              {/* Add subtasks form inside accordion - always shown when accordion is open */}
              <motion.div
                className="mt-2 m-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <form onSubmit={handleSubtaskSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={subtaskTitle}
                    onChange={(e) => setSubtaskTitle(e.target.value)}
                    placeholder="Add subtask..."
                    className="flex-1 px-2 py-1 border rounded-md text-sm"
                    style={{ fontSize: "16px" }}
                    disabled={isSubmitting}
                  />
                  <motion.button
                    type="submit"
                    disabled={!subtaskTitle.trim() || isSubmitting}
                    className="flex items-center justify-center text-indigo-500 hover:text-indigo-700 p-1 rounded disabled:text-gray-400 disabled:cursor-not-allowed"
                    aria-label="Add subtask"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent"></div>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 20"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-7 h-7"
                      >
                        <circle
                          cx="10"
                          cy="10"
                          r="8"
                          stroke="currentColor"
                          fill="none"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10 6v8M14 10H6"
                        />
                      </svg>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            </>
          )}
        </div>
      )}
      {/* Add subtask button and form for tasks with no subtasks */}
      {!hasSubtasks && (
        <div className={`${showSubtaskForm ? "mt-4" : "mt-1"}`}>
          {!showSubtaskForm ? (
            <motion.button
              type="button"
              className="text-indigo-400 hover:text-indigo-700 text-sm rounded flex items-center gap-1"
              onClick={() => setShowSubtaskForm(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <span className="font-bold text-lg align-middle leading-tight">
                +
              </span>
              <span className="font-semibold align-middle leading-tight">
                SubTask
              </span>
            </motion.button>
          ) : (
            <motion.form
              onSubmit={handleSubtaskSubmit}
              className="flex gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <input
                type="text"
                value={subtaskTitle}
                onChange={(e) => setSubtaskTitle(e.target.value)}
                placeholder="Add subtask..."
                className="flex-1 px-2 py-1 border rounded-md text-sm"
                style={{ fontSize: "16px" }}
                autoFocus
                disabled={isSubmitting}
              />
              <motion.button
                type="submit"
                disabled={!subtaskTitle.trim() || isSubmitting}
                className="flex items-center justify-center text-indigo-500 hover:text-indigo-700 p-2 rounded disabled:text-gray-400 disabled:cursor-not-allowed"
                aria-label="Add subtask"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent"></div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <circle
                      cx="10"
                      cy="10"
                      r="8"
                      stroke="currentColor"
                      fill="none"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 6v8M14 10H6"
                    />
                  </svg>
                )}
              </motion.button>
              <motion.button
                type="button"
                className="flex items-center justify-center text-red-500 hover:text-red-700 p-2 rounded"
                aria-label="Cancel"
                onClick={() => setShowSubtaskForm(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 16 16"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <line
                    x1="4"
                    y1="4"
                    x2="12"
                    y2="12"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                  <line
                    x1="12"
                    y1="4"
                    x2="4"
                    y2="12"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </svg>
              </motion.button>
            </motion.form>
          )}
        </div>
      )}
    </>
  );
}
