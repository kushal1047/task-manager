import { useState } from "react";
import DueDatePopup from "./DueDatePopup";
import { getTimeRemainingString } from "../utils/timeUtils";

export default function TaskForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [showDuePopup, setShowDuePopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAdd(title, dueDate);
      setTitle("");
      setDueDate(null);
    } catch (error) {
      console.error("Failed to add task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = !title.trim() || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 mb-6 mr-3">
      <div className="relative flex-1">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            // Clear due date when input is cleared
            if (!e.target.value.trim()) {
              setDueDate(null);
            }
          }}
          placeholder="Add a new task..."
          className="w-full pl-4 pr-10 py-2.5 border rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
          disabled={isSubmitting}
        />
        {/* Calendar icon button, only show when typing */}
        {title.trim() && !isSubmitting && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-600 p-1"
            aria-label="Set due date"
            onClick={() => setShowDuePopup(true)}
            tabIndex={-1}
          >
            <svg
              className="w-6 h-6"
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
        )}
        {/* Due date popup */}
        <DueDatePopup
          open={showDuePopup}
          initialDate={dueDate}
          onSet={(date) => {
            setDueDate(date ? new Date(date.getTime()) : null); // handle null case
            setShowDuePopup(false);
          }}
          onClose={() => setShowDuePopup(false)}
        />
        {/* Show selected due date as a badge */}
        {dueDate && (
          <span className="absolute right-10 top-1/2 -translate-y-1/2 bg-indigo-100 text-indigo-600 text-xs rounded px-2 py-0.5">
            {getTimeRemainingString(dueDate)}
          </span>
        )}
      </div>
      <button
        type="submit"
        disabled={isDisabled}
        className={`flex items-center justify-center rounded-md transition
          ${
            isDisabled
              ? "text-gray-400 cursor-not-allowed"
              : "text-indigo-500 hover:text-indigo-600"
          }`}
        aria-label="Add task"
      >
        {isSubmitting ? (
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent"></div>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 32 32"
            strokeWidth={3}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <circle cx="16" cy="16" r="13" stroke="currentColor" fill="none" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 9v14M23 16H9"
            />
          </svg>
        )}
      </button>
    </form>
  );
}
