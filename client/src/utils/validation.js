import { VALIDATION } from "../config/constants";

/**
 * Validates user registration data
 * @param {Object} data - User registration data
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateRegistration = (data) => {
  const errors = [];

  if (!data.firstName || data.firstName.trim().length === 0) {
    errors.push("First name is required");
  }

  if (!data.lastName || data.lastName.trim().length === 0) {
    errors.push("Last name is required");
  }

  if (
    !data.username ||
    data.username.trim().length < VALIDATION.USERNAME_MIN_LENGTH
  ) {
    errors.push(
      `Username must be at least ${VALIDATION.USERNAME_MIN_LENGTH} characters`
    );
  }

  if (!data.password || data.password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    errors.push(
      `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates user login data
 * @param {Object} data - User login data
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateLogin = (data) => {
  const errors = [];

  if (!data.username || data.username.trim().length === 0) {
    errors.push("Username is required");
  }

  if (!data.password || data.password.length === 0) {
    errors.push("Password is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates task creation data
 * @param {Object} data - Task creation data
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateTaskCreation = (data) => {
  const errors = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push("Task title is required");
  } else if (data.title.trim().length > VALIDATION.TASK_TITLE_MAX_LENGTH) {
    errors.push(
      `Task title must be less than ${VALIDATION.TASK_TITLE_MAX_LENGTH} characters`
    );
  }

  if (data.dueDate && isNaN(new Date(data.dueDate).getTime())) {
    errors.push("Invalid due date format");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates subtask creation data
 * @param {Object} data - Subtask creation data
 * @returns {Object} - Validation result with isValid and errors
 */
export const validateSubtaskCreation = (data) => {
  const errors = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push("Subtask title is required");
  } else if (data.title.trim().length > VALIDATION.TASK_TITLE_MAX_LENGTH) {
    errors.push(
      `Subtask title must be less than ${VALIDATION.TASK_TITLE_MAX_LENGTH} characters`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Password strength result
 */
export const validatePasswordStrength = (password) => {
  const checks = {
    length: password.length >= VALIDATION.PASSWORD_MIN_LENGTH,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;
  let strength = "weak";

  if (score >= 4) {
    strength = "strong";
  } else if (score >= 3) {
    strength = "medium";
  }

  return {
    isValid: score >= 3,
    strength,
    checks,
  };
};

/**
 * Sanitizes input string
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

/**
 * Validates date format
 * @param {string} date - Date string to validate
 * @returns {boolean} - Whether date is valid
 */
export const validateDate = (date) => {
  if (!date) return false;

  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

/**
 * Validates that a date is not in the past
 * @param {string} date - Date string to validate
 * @returns {boolean} - Whether date is in the future
 */
export const validateFutureDate = (date) => {
  if (!validateDate(date)) return false;

  const dateObj = new Date(date);
  const now = new Date();

  // Reset time to start of day for comparison
  dateObj.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  return dateObj >= now;
};

const validationUtils = {
  validateRegistration,
  validateLogin,
  validateTaskCreation,
  validateSubtaskCreation,
  validateEmail,
  validatePasswordStrength,
  sanitizeInput,
  validateDate,
  validateFutureDate,
};

export default validationUtils;
