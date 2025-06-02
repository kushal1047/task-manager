import { useState, memo, useEffect } from "react";
import DueDatePopup from "./DueDatePopup";
import SubtaskList from "./SubtaskList";
import SubtaskProgressBar from "./SubtaskProgressBar";
import ShareTaskPopup from "./ShareTaskPopup";
import soundManager from "../utils/sound";
import { getTimeRemainingString } from "../utils/timeUtils";

const TaskItem = memo(
  ({
    task,
    onToggle,
    onDelete,
    onAddSubtask,
    onToggleSubtask,
    onDeleteSubtask,
    onSetDueDate,
    onUnlinkTask,
    isUpdating,
  }) => {
    const [subtaskTitle, setSubtaskTitle] = useState("");
    const [showSubtaskForm, setShowSubtaskForm] = useState(false);
    const [subtasksOpen, setSubtasksOpen] = useState(false);
    const [showDuePopup, setShowDuePopup] = useState(false);
    const [showSharePopup, setShowSharePopup] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    // Due date selection state
    const hasSubtasks =
      Array.isArray(task.subtasks) && task.subtasks.length > 0;
    // Real-time update for progress bar (every minute)
    useEffect(() => {
      if (!task.dueDate) return;

      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 60000); // Update every minute (60 seconds)

      return () => clearInterval(interval);
    }, [task.dueDate]);

    // Remove due date when task is completed (regardless of how it was completed)
    useEffect(() => {
      if (task.completed && task.dueDate && onSetDueDate) {
        onSetDueDate(task._id, null);
      }
    }, [task.completed, task.dueDate, task._id, onSetDueDate]);

    // Progress bar logic
    let subtaskProgress = 0;
    if (hasSubtasks) {
      const total = task.subtasks.length;
      const completed = task.subtasks.filter((s) => s.completed).length;
      subtaskProgress = total ? (completed / total) * 100 : 0;
    }

    return (
      <div
        className={`flex flex-col p-3 rounded bg-gray-100 mb-2 shadow-sm transition-all duration-200 ${
          isUpdating ? "opacity-75 scale-95" : ""
        }`}
      >
        {/* Due date popup */}
        <DueDatePopup
          open={showDuePopup}
          initialDate={task.dueDate}
          onClose={() => setShowDuePopup(false)}
          onSet={(date) => {
            setShowDuePopup(false);
            onSetDueDate && onSetDueDate(task._id, date);
          }}
        />

        {/* Due time display and progress bar at top center */}
        {task.dueDate && (
          <div className="flex flex-col items-center mb-1">
            {/* Time remaining display */}
            <span className="text-xs font-semibold flex items-center relative min-w-[100px] mb-2">
              {/* Time remaining background progress bar */}
              {(() => {
                const due = new Date(task.dueDate);
                const created = new Date(task.createdAt);
                const now = currentTime; // Use the real-time updated currentTime

                // Calculate in minutes for more granular control
                const msPerMinute = 60 * 1000;
                const totalMinutes = Math.max(
                  Math.round((due - created) / msPerMinute),
                  1
                );
                const elapsedMinutes = Math.min(
                  Math.max(Math.round((now - created) / msPerMinute), 0),
                  totalMinutes
                );
                const percent =
                  totalMinutes > 0
                    ? (elapsedMinutes / totalMinutes) * 100
                    : 100;
                const greenWidth = 100 - percent;
                const redWidth = percent;
                return (
                  <span
                    className="absolute left-0 top-0 h-full w-full rounded z-0 overflow-hidden"
                    aria-hidden="true"
                  >
                    <span
                      className="absolute right-0 top-0 h-full bg-green-400 opacity-40"
                      style={{ width: `${greenWidth}%` }}
                    />
                    <span
                      className="absolute left-0 top-0 h-full bg-red-500 opacity-70"
                      style={{ width: `${redWidth}%` }}
                    />
                  </span>
                );
              })()}
              <span
                className="relative z-10 px-2 w-full flex items-center justify-center"
                style={{ minHeight: "1.5em" }}
              >
                {getTimeRemainingString(task.dueDate)}
              </span>
            </span>
          </div>
        )}

        {/* Subtask progress bar - always show if there are subtasks */}
        <SubtaskProgressBar show={hasSubtasks} percent={subtaskProgress} />

        {/* Main task content pushed down */}
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <div className="relative">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={async () => {
                  const newCompleted = !task.completed;
                  // Play sound based on the new state
                  if (newCompleted) {
                    await soundManager.playCheckSound();
                  } else {
                    await soundManager.playUncheckSound();
                  }
                  onToggle(task._id, newCompleted);
                }}
                className={`h-6 w-6 shrink-0 accent-indigo-500 transition-all duration-200 ${
                  isUpdating
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
                disabled={isUpdating}
              />
              {isUpdating && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent"></div>
                </div>
              )}
            </div>
            <p
              className={`text-lg leading-tight font-bold text-indigo-600 transition-all duration-200 ${
                task.completed ? "line-through opacity-60" : ""
              } ${isUpdating ? "opacity-75" : ""}`}
            >
              {task.title}
            </p>
          </div>
          <div className="flex gap-4 items-center">
            {/* Calendar button */}
            <button
              className={`flex items-center justify-center transition p-0.5 ml-2.5 ${
                task.completed || isUpdating
                  ? "text-gray-400 cursor-not-allowed opacity-50"
                  : "text-indigo-500 hover:text-indigo-600"
              }`}
              aria-label="Set due date"
              onClick={() =>
                !task.completed && !isUpdating && setShowDuePopup(true)
              }
              disabled={task.completed || isUpdating}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                {/* Calendar base */}
                <rect x="3" y="4" width="18" height="18" rx="2" />
                {/* Calendar top with dots */}
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="6"
                  rx="2"
                  fill="currentColor"
                  opacity="0.2"
                />
                {/* Calendar dots */}
                <circle cx="7" cy="7" r="1" fill="currentColor" />
                <circle cx="11" cy="7" r="1" fill="currentColor" />
                <circle cx="15" cy="7" r="1" fill="currentColor" />
                {/* Calendar lines for days */}
                <line
                  x1="3"
                  y1="10"
                  x2="21"
                  y2="10"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <line
                  x1="3"
                  y1="14"
                  x2="21"
                  y2="14"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <line
                  x1="3"
                  y1="18"
                  x2="21"
                  y2="18"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <line
                  x1="7"
                  y1="10"
                  x2="7"
                  y2="22"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <line
                  x1="11"
                  y1="10"
                  x2="11"
                  y2="22"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <line
                  x1="15"
                  y1="10"
                  x2="15"
                  y2="22"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <line
                  x1="19"
                  y1="10"
                  x2="19"
                  y2="22"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
            </button>

            {/* Share button - only show for non-shared tasks */}
            {!task.isShared && (
              <button
                className={`flex items-center justify-center transition p-0.5 ${
                  task.completed || isUpdating
                    ? "text-gray-400 cursor-not-allowed opacity-50"
                    : "text-indigo-400 hover:text-indigo-500"
                }`}
                aria-label="Share task"
                onClick={() =>
                  !task.completed && !isUpdating && setShowSharePopup(true)
                }
                disabled={task.completed || isUpdating}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
              </button>
            )}

            {/* Delete button for original tasks, Unlink button for shared tasks */}
            {task.isShared ? (
              <button
                onClick={() => !isUpdating && onUnlinkTask(task._id)}
                className={`flex items-center justify-center text-orange-600 hover:text-orange-700 transition p-0.5 ${
                  isUpdating ? "opacity-50 cursor-not-allowed" : ""
                }`}
                aria-label="Unlink shared task"
                disabled={isUpdating}
              >
                <img
                  src="/unlink-icon.png"
                  alt="Unlink shared task"
                  className="w-6 h-6"
                />
              </button>
            ) : (
              <button
                onClick={() => !isUpdating && onDelete(task._id)}
                className={`flex items-center justify-center text-red-600 hover:text-red-700 transition ${
                  isUpdating ? "opacity-50 cursor-not-allowed" : ""
                }`}
                aria-label="Delete task"
                disabled={isUpdating}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 32 32"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-7 h-7"
                >
                  <circle
                    cx="16"
                    cy="16"
                    r="13"
                    stroke="currentColor"
                    fill="none"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M23 16H9"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
        {/* Subtasks accordion and add form */}
        <SubtaskList
          task={task}
          subtasksOpen={subtasksOpen}
          setSubtasksOpen={setSubtasksOpen}
          showSubtaskForm={showSubtaskForm}
          setShowSubtaskForm={setShowSubtaskForm}
          subtaskTitle={subtaskTitle}
          setSubtaskTitle={setSubtaskTitle}
          onAddSubtask={onAddSubtask}
          onToggleSubtask={onToggleSubtask}
          onDeleteSubtask={onDeleteSubtask}
          isUpdating={isUpdating}
        />

        {/* Task metadata - only show if there's shared content */}
        {(task.isShared && task.originalCreator) ||
        (!task.isShared && task.sharedWith && task.sharedWith.length > 0) ? (
          <div className="flex justify-end items-center mt-3 pt-2 border-t border-gray-200">
            {/* Right side - shared task info and share count */}
            <div className="flex items-center text-xs text-gray-500">
              {/* Shared task info */}
              {task.isShared && task.originalCreator && (
                <span>
                  From{" "}
                  <span className="font-semibold">
                    {task.originalCreator.firstName}{" "}
                    {task.originalCreator.lastName}
                  </span>
                </span>
              )}

              {/* Share count for original tasks */}
              {!task.isShared &&
                task.sharedWith &&
                task.sharedWith.length > 0 && (
                  <div className="flex items-center ml-2 font-semibold">
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    +{task.sharedWith.filter((share) => share.accepted).length}
                  </div>
                )}
            </div>
          </div>
        ) : null}

        {/* Share Task Popup */}
        <ShareTaskPopup
          isOpen={showSharePopup}
          onClose={() => setShowSharePopup(false)}
          task={task}
          onShareSuccess={() => {
            // Refresh tasks or show success message
          }}
        />
      </div>
    );
  }
);

TaskItem.displayName = "TaskItem";

export default TaskItem;
