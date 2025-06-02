const { VALIDATION, ERROR_MESSAGES } = require("../config/constants");

/**
 * Validates user registration data
 * @param {Object} data - User registration data
 * @returns {Object} - Validation result with isValid and errors
 */
const validateRegistration = (data) => {
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
const validateLogin = (data) => {
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
const validateTaskCreation = (data) => {
  const errors = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push(ERROR_MESSAGES.TASK_TITLE_REQUIRED);
  } else if (data.title.trim().length > VALIDATION.TITLE_MAX_LENGTH) {
    errors.push(
      `Task title must be less than ${VALIDATION.TITLE_MAX_LENGTH} characters`
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
const validateSubtaskCreation = (data) => {
  const errors = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push(ERROR_MESSAGES.SUBTASK_TITLE_REQUIRED);
  } else if (data.title.trim().length > VALIDATION.TITLE_MAX_LENGTH) {
    errors.push(
      `Subtask title must be less than ${VALIDATION.TITLE_MAX_LENGTH} characters`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates subtask index
 * @param {number} index - Subtask index
 * @param {number} totalSubtasks - Total number of subtasks
 * @returns {Object} - Validation result with isValid and errors
 */
const validateSubtaskIndex = (index, totalSubtasks) => {
  const errors = [];

  if (isNaN(index) || index < 0 || index >= totalSubtasks) {
    errors.push(ERROR_MESSAGES.INVALID_SUBTASK_INDEX);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateTaskCreation,
  validateSubtaskCreation,
  validateSubtaskIndex,
};
