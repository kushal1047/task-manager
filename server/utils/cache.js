const { CACHE_CONFIG } = require("../config/constants");

/**
 * Simple in-memory cache implementation
 */
class Cache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Set a value in cache with optional TTL
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  set(key, value, ttl = CACHE_CONFIG.TASK_CACHE_DURATION) {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {*} - Cached value or null if expired/not found
   */
  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    const isExpired = Date.now() - item.timestamp > item.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Delete a key from cache
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache size
   * @returns {number} - Number of cached items
   */
  size() {
    return this.cache.size;
  }

  /**
   * Clean expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Create singleton instance
const cache = new Cache();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);

module.exports = cache;
