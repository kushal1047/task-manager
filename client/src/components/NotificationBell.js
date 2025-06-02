import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getShareRequests,
  acceptShareRequest,
  declineShareRequest,
} from "../api";

const NotificationBell = ({ onRequestAccepted }) => {
  const [requests, setRequests] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      const data = await getShareRequests();
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch share requests:", error);
    }
  };

  useEffect(() => {
    fetchRequests();
    // Poll for new requests every 5 seconds for better responsiveness
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (requestId) => {
    setIsLoading(true);
    try {
      await acceptShareRequest(requestId);
      setRequests(requests.filter((req) => req._id !== requestId));
      onRequestAccepted && onRequestAccepted();
    } catch (error) {
      console.error("Failed to accept request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async (requestId) => {
    setIsLoading(true);
    try {
      await declineShareRequest(requestId);
      setRequests(requests.filter((req) => req._id !== requestId));
    } catch (error) {
      console.error("Failed to decline request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const pendingCount = requests.length;

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full border-2 border-indigo-600 hover:bg-indigo-200 transition relative"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
          className="w-5 h-5 text-indigo-600"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>

        {/* Notification Badge */}
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {pendingCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50"
          >
            <div className="p-4">
              {/* Header with close button */}
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Share Requests
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Close notifications"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    className="w-5 h-5 text-gray-500 hover:text-gray-700"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {requests.length === 0 ? (
                <p className="text-gray-500 text-sm">No pending requests</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {requests.map((request) => (
                    <div
                      key={request._id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-semibold">
                          {request.sender.firstName} {request.sender.lastName}
                        </span>{" "}
                        wants to share a task with you
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        Task: "{request.task.title}"
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(request._id)}
                          disabled={isLoading}
                          className="flex-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDecline(request._id)}
                          disabled={isLoading}
                          className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
