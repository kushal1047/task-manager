import { STORAGE_KEYS } from "../config/constants";

/**
 * Storage utility for localStorage operations
 */
class Storage {
  /**
   * Set a value in localStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   */
  set(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Failed to set localStorage key "${key}":`, error);
    }
  }

  /**
   * Get a value from localStorage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {*} - Stored value or default
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error(`Failed to get localStorage key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Remove a key from localStorage
   * @param {string} key - Storage key
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove localStorage key "${key}":`, error);
    }
  }

  /**
   * Clear all localStorage
   */
  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Failed to clear localStorage:", error);
    }
  }

  /**
   * Check if a key exists in localStorage
   * @param {string} key - Storage key
   * @returns {boolean} - Whether key exists
   */
  has(key) {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Failed to check localStorage key "${key}":`, error);
      return false;
    }
  }

  // Auth-specific methods
  /**
   * Set authentication token
   * @param {string} token - JWT token
   */
  setToken(token) {
    try {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } catch (error) {
      console.error(
        `Failed to set localStorage key "${STORAGE_KEYS.TOKEN}":`,
        error
      );
    }
  }

  /**
   * Get authentication token
   * @returns {string|null} - JWT token or null
   */
  getToken() {
    try {
      return localStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error(
        `Failed to get localStorage key "${STORAGE_KEYS.TOKEN}":`,
        error
      );
      return null;
    }
  }

  /**
   * Remove authentication token
   */
  removeToken() {
    this.remove(STORAGE_KEYS.TOKEN);
  }

  /**
   * Set user information
   * @param {Object} user - User object
   */
  setUser(user) {
    this.set(STORAGE_KEYS.USER_ID, user.id);
    // Store name as plain string to avoid JSON parsing issues
    try {
      localStorage.setItem(STORAGE_KEYS.USER_NAME, user.firstName);
    } catch (error) {
      console.error(
        `Failed to set localStorage key "${STORAGE_KEYS.USER_NAME}":`,
        error
      );
    }
  }

  /**
   * Get user ID
   * @returns {string|null} - User ID or null
   */
  getUserId() {
    return this.get(STORAGE_KEYS.USER_ID);
  }

  /**
   * Get user name
   * @returns {string|null} - User name or null
   */
  getUserName() {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.USER_NAME);
      if (item === null) {
        return null;
      }
      // Try to parse as JSON first, fallback to plain string
      try {
        return JSON.parse(item);
      } catch {
        // If JSON parsing fails, return as plain string
        return item;
      }
    } catch (error) {
      console.error(
        `Failed to get localStorage key "${STORAGE_KEYS.USER_NAME}":`,
        error
      );
      return null;
    }
  }

  /**
   * Remove user information
   */
  removeUser() {
    this.remove(STORAGE_KEYS.USER_ID);
    this.remove(STORAGE_KEYS.USER_NAME);
  }

  /**
   * Clear all authentication data
   */
  clearAuth() {
    this.removeToken();
    this.removeUser();
  }

  // Sound settings methods
  /**
   * Set sound enabled state
   * @param {boolean} enabled - Whether sound is enabled
   */
  setSoundEnabled(enabled) {
    this.set(STORAGE_KEYS.SOUND_ENABLED, enabled);
  }

  /**
   * Get sound enabled state
   * @returns {boolean} - Whether sound is enabled
   */
  getSoundEnabled() {
    return this.get(STORAGE_KEYS.SOUND_ENABLED, true);
  }

  /**
   * Set sound volume
   * @param {number} volume - Volume level (0-100)
   */
  setSoundVolume(volume) {
    this.set(STORAGE_KEYS.SOUND_VOLUME, volume);
  }

  /**
   * Get sound volume
   * @returns {number} - Volume level (0-100)
   */
  getSoundVolume() {
    return this.get(STORAGE_KEYS.SOUND_VOLUME, 50);
  }
}

// Create singleton instance
const storage = new Storage();

export default storage;
