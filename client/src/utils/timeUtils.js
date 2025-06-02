/**
 * Calculate the time remaining until a due date
 * @param {string|Date} dueDate - The due date
 * @returns {object} Object containing days, hours, minutes remaining
 */
export const calculateTimeRemaining = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);

  // Calculate the difference in milliseconds
  const diff = due - now;

  // If the due date has passed, return null
  if (diff <= 0) {
    return null;
  }

  // Convert to days, hours, minutes
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
};

/**
 * Format time remaining as a string
 * @param {object} timeRemaining - Object with days, hours, minutes
 * @returns {string} Formatted string like "5d 8h 37m"
 */
export const formatTimeRemaining = (timeRemaining) => {
  if (!timeRemaining) {
    return "Overdue";
  }

  const { days, hours, minutes } = timeRemaining;
  const parts = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  // Always show minutes if there are days or hours, or if it's the only unit
  if (minutes > 0 || days > 0 || hours > 0 || parts.length === 0) {
    parts.push(`${minutes}m`);
  }

  return parts.join(" ");
};

/**
 * Get the full formatted time remaining string
 * @param {string|Date} dueDate - The due date
 * @returns {string} Formatted string like "Due in: 5d 8h 37m" or "Overdue"
 */
export const getTimeRemainingString = (dueDate) => {
  const timeRemaining = calculateTimeRemaining(dueDate);

  if (!timeRemaining) {
    return "Overdue";
  }

  return `Due in: ${formatTimeRemaining(timeRemaining)}`;
};
