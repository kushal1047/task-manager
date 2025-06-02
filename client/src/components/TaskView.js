import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import TaskForm from "./TaskForm";
import TaskList from "./TaskList";
import SoundSettings from "./SoundSettings";
import LoadingBar from "./LoadingBar";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../contexts/AuthContext";
import { UI } from "../config/constants";
import soundManager from "../utils/sound";

export default function TaskView({
  tasks,
  sharedTasks,
  user,
  loading,
  error,
  updatingTasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onSetDueDate,
  onUnlinkSharedTask,
  onRefreshSharedTasks,
}) {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const [showCongrats, setShowCongrats] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const completedStreak = useRef(false);

  // Handle logout navigation
  useEffect(() => {
    if (isAuthenticated === false) {
      // Add a small delay to ensure state has updated
      const timeoutId = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, navigate]);

  // Handle scroll for h1 fade effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Progress calculation
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const percentCompleted = total ? (completed / total) * 100 : 0;
  const percentIncomplete = total ? 100 - percentCompleted : 0;

  // Split and sort tasks (memoized to prevent infinite re-renders)
  const dueTasks = useMemo(() => {
    return tasks
      .filter((t) => t.dueDate)
      .sort((a, b) => {
        // First sort by completion status (incomplete first, then completed)
        const completionDiff = Number(a.completed) - Number(b.completed);
        if (completionDiff !== 0) return completionDiff;
        // Then sort by due date for incomplete tasks
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
  }, [tasks]);

  const otherTasks = useMemo(() => {
    return tasks
      .filter((t) => !t.dueDate)
      .sort((a, b) => {
        // First sort by completion status (incomplete first, then completed)
        const completionDiff = Number(a.completed) - Number(b.completed);
        if (completionDiff !== 0) return completionDiff;
        // Then sort by creation date for incomplete tasks (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [tasks]);

  // Section visibility logic (memoized to prevent infinite re-renders)
  const hasYourTasks = useMemo(() => otherTasks.length > 0, [otherTasks]);
  const hasDueTasks = useMemo(() => dueTasks.length > 0, [dueTasks]);
  const hasSharedTasks = useMemo(
    () => sharedTasks && sharedTasks.length > 0,
    [sharedTasks]
  );

  // Create array of visible sections (memoized to prevent infinite re-renders)
  const visibleSections = useMemo(() => {
    const sections = [];
    if (hasYourTasks)
      sections.push({
        type: "your",
        tasks: otherTasks,
        title: "Your Tasks",
        color: "text-gray-600",
      });
    if (hasDueTasks)
      sections.push({
        type: "due",
        tasks: dueTasks,
        title: "Due Tasks",
        color: "text-red-600",
      });
    if (hasSharedTasks)
      sections.push({
        type: "shared",
        tasks: sharedTasks,
        title: "Shared Tasks",
        color: "text-green-700",
      });
    return sections;
  }, [
    hasYourTasks,
    hasDueTasks,
    hasSharedTasks,
    otherTasks,
    dueTasks,
    sharedTasks,
  ]);

  // Section order state
  const [sectionOrder, setSectionOrder] = useState(
    visibleSections.map((s) => s.type)
  );

  // Update section order when visibility changes
  const prevVisibleSections = useRef([]);

  useEffect(() => {
    const currentSectionTypes = visibleSections.map((s) => s.type);
    const prevSectionTypes = prevVisibleSections.current.map((s) => s.type);

    // Only update if the section types have actually changed
    if (
      JSON.stringify(currentSectionTypes) !== JSON.stringify(prevSectionTypes)
    ) {
      setSectionOrder(currentSectionTypes);
      prevVisibleSections.current = visibleSections;
    }
  }, [visibleSections]);

  // Function to swap adjacent sections
  const swapSections = (index) => {
    if (index >= sectionOrder.length - 1) return;

    const newOrder = [...sectionOrder];
    [newOrder[index], newOrder[index + 1]] = [
      newOrder[index + 1],
      newOrder[index],
    ];
    setSectionOrder(newOrder);
  };

  // Get section by type
  const getSectionByType = (type) => {
    return visibleSections.find((s) => s.type === type);
  };

  const handleLogout = () => {
    logout();
    // Remove manual navigation - let the auth state handle it
  };

  // Show congrats popup when all tasks are completed, only once per streak
  useEffect(() => {
    if (tasks.length > 0 && tasks.every((t) => t.completed)) {
      if (!completedStreak.current) {
        setShowCongrats(true);
        completedStreak.current = true;
        // Play crowd cheering sound
        soundManager.playCrowdCheeringSound();
        setTimeout(() => setShowCongrats(false), UI.CONGRATS_DISPLAY_TIME);
      }
    } else {
      completedStreak.current = false;
    }
  }, [tasks]);

  // Reset congrats streak when a new task is added
  const handleAddWithReset = async (...args) => {
    completedStreak.current = false;
    await onAddTask(...args);
  };

  // Accordion state
  const [dueOpen, setDueOpen] = useState(false);
  const [otherOpen, setOtherOpen] = useState(false);
  const [sharedOpen, setSharedOpen] = useState(false);
  const [showSoundSettings, setShowSoundSettings] = useState(false);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingBar percent={75} />
          <p className="text-indigo-600 font-medium mt-4">
            Loading your tasks...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-50 px-2 py-2 relative">
      {/* Congrats popup */}
      {showCongrats && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white shadow-2xl rounded-2xl px-8 py-6 border-4 border-indigo-300 animate-pop text-center">
            <h2 className="text-2xl font-extrabold text-indigo-600 mb-2 animate-bounce">
              Bravo {user?.name || "Darling"}!
            </h2>
            <p className="text-lg text-gray-700">
              We always knew you could make it.
            </p>
          </div>
        </div>
      )}

      {/* Faded background image when no tasks */}
      {tasks.length === 0 && (!sharedTasks || sharedTasks.length === 0) && (
        <img
          src={process.env.PUBLIC_URL + "/happy-bird.webp"}
          alt="Happy Bird"
          className="absolute left-1/2 bottom-24 w-2/3 max-w-xs opacity-15 pointer-events-none z-0 select-none transform -translate-x-1/2"
        />
      )}

      {/* Sticky header: Logo/title, logout, progress bar */}
      <div
        className="sticky top-0 z-30 bg-indigo-50 pb-2 pt-1"
        style={{ marginLeft: -8, marginRight: -8 }}
      >
        <div className="flex justify-between items-start mb-6 px-2">
          <h1 className="italic text-2xl font-bold text-indigo-600 ml-2 mt-2">
            Get it Done.
          </h1>
          <div className="flex gap-2 mt-2 mr-2">
            <NotificationBell
              onRequestAccepted={() => {
                // Refresh shared tasks when a request is accepted
                onRefreshSharedTasks();
              }}
            />
            <button
              onClick={() => setShowSoundSettings(true)}
              className="p-2 rounded-full border border-indigo-600 hover:bg-indigo-200 transition"
              aria-label="Sound settings"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                className="w-5 h-5 text-indigo-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full border border-red-600 hover:bg-red-200 transition"
              aria-label="Log out"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                className="w-5 h-5 text-red-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 px-2">
          <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${percentCompleted}%` }}
            ></div>
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${percentIncomplete}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs mt-1 px-1">
            <span className="text-green-600 font-semibold">
              {completed} completed
            </span>
            <span className="text-red-600 font-semibold">
              {total - completed} incomplete
            </span>
          </div>
        </div>

        {/* TaskForm in sticky header */}
        <div className="mx-2 mb-6">
          <TaskForm onAdd={handleAddWithReset} />
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        {(tasks.length > 0 || (sharedTasks && sharedTasks.length > 0)) && (
          <>
            <h1
              className="text-lg text-indigo-600 mb-2 ml-3 transition-opacity duration-300"
              style={{
                opacity: Math.max(0, 1 - scrollY / 50),
                transform: `translateY(${Math.min(scrollY * 0.5, 20)}px)`,
              }}
            >
              Hey <span className="font-bold">{user?.name || "there"}</span>,
              let's remember to....
            </h1>

            {/* Task sections in white card */}
            <div className="bg-white rounded-xl shadow-md py-6 px-3">
              {sectionOrder.map((sectionType, index) => {
                const section = getSectionByType(sectionType);
                if (!section) return null;
                const isLast = index === sectionOrder.length - 1;
                return (
                  <div key={section.type}>
                    {/* Section Header */}
                    <h2 className={`text-md font-bold ${section.color} mb-3`}>
                      {section.title}
                    </h2>

                    {/* Section Content */}
                    <TaskList
                      tasks={section.tasks.slice(0, UI.MAX_TASKS_DISPLAY)}
                      onToggle={onToggleTask}
                      onDelete={onDeleteTask}
                      onAddSubtask={onAddSubtask}
                      onToggleSubtask={onToggleSubtask}
                      onDeleteSubtask={onDeleteSubtask}
                      onSetDueDate={onSetDueDate}
                      onUnlinkTask={onUnlinkSharedTask}
                      showEmpty={false}
                      updatingTasks={updatingTasks}
                    />

                    {/* Show More Logic for each section */}
                    {section.tasks.length > UI.MAX_TASKS_DISPLAY && (
                      <>
                        <AnimatePresence initial={false}>
                          {(section.type === "your" && otherOpen) ||
                          (section.type === "due" && dueOpen) ||
                          (section.type === "shared" && sharedOpen) ? (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                              }}
                              className="overflow-hidden"
                            >
                              <TaskList
                                tasks={section.tasks.slice(
                                  UI.MAX_TASKS_DISPLAY
                                )}
                                onToggle={onToggleTask}
                                onDelete={onDeleteTask}
                                onAddSubtask={onAddSubtask}
                                onToggleSubtask={onToggleSubtask}
                                onDeleteSubtask={onDeleteSubtask}
                                onSetDueDate={onSetDueDate}
                                onUnlinkTask={onUnlinkSharedTask}
                                showEmpty={false}
                                updatingTasks={updatingTasks}
                              />
                            </motion.ul>
                          ) : null}
                        </AnimatePresence>
                        <button
                          className="w-full text-center text-xs text-indigo-500 font-semibold py-2 mt-1 rounded transition bg-indigo-50 hover:bg-indigo-100"
                          onClick={() => {
                            if (section.type === "your")
                              setOtherOpen((v) => !v);
                            if (section.type === "due") setDueOpen((v) => !v);
                            if (section.type === "shared")
                              setSharedOpen((v) => !v);
                          }}
                        >
                          {(section.type === "your" && otherOpen) ||
                          (section.type === "due" && dueOpen) ||
                          (section.type === "shared" && sharedOpen)
                            ? "Show less"
                            : `Show ${
                                section.tasks.length - UI.MAX_TASKS_DISPLAY
                              } more`}
                        </button>
                      </>
                    )}

                    {/* Border between sections with centered toggle (only if not last and there are multiple sections) */}
                    {!isLast && visibleSections.length > 1 && (
                      <div className="relative mt-12 mb-8">
                        {/* Border line with gap for toggle */}
                        <div className="flex items-center">
                          <div
                            className="flex-1 border-t border-gray-200"
                            style={{ marginRight: "25px" }}
                          ></div>
                          <div
                            className="flex-1 border-t border-gray-200"
                            style={{ marginLeft: "25px" }}
                          ></div>
                        </div>

                        {/* Centered toggle button */}
                        <button
                          onClick={() => swapSections(index)}
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 bg-indigo-100 hover:bg-indigo-200 rounded-full transition-colors duration-200 shadow-sm z-10"
                          aria-label="Swap sections"
                        >
                          <svg
                            className="w-4 h-4 text-indigo-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Empty state message below card */}
      {tasks.length === 0 && (!sharedTasks || sharedTasks.length === 0) && (
        <div className="w-full flex justify-center mt-10">
          <p className="text-2xl text-center text-gray-500 opacity-40 font-medium">
            No tasks yet. <br />
            You're free as a bird.
          </p>
        </div>
      )}

      {/* Sound Settings Modal */}
      <SoundSettings
        isOpen={showSoundSettings}
        onClose={() => setShowSoundSettings(false)}
      />
    </div>
  );
}
