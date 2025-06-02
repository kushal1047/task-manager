import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendShareRequest } from "../api";

const ShareTaskPopup = ({ isOpen, onClose, task, onShareSuccess }) => {
  const [usernames, setUsernames] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const usernameList = usernames
        .split(",")
        .map((username) => username.trim())
        .filter((username) => username.length > 0);

      if (usernameList.length === 0) {
        setError("Please enter at least one username");
        setIsLoading(false);
        return;
      }

      await sendShareRequest(task._id, usernameList);
      setUsernames("");
      onShareSuccess && onShareSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to send share request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUsernames("");
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Share Task
              </h2>
              <p className="text-gray-600 text-sm">
                Share "{task?.title}" with other users
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="usernames"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Usernames
                </label>
                <textarea
                  id="usernames"
                  value={usernames}
                  onChange={(e) => setUsernames(e.target.value)}
                  placeholder="Enter usernames separated by commas (e.g., john, jane, bob)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  rows="3"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter multiple usernames separated by commas
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    "Send Share Request"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShareTaskPopup;
