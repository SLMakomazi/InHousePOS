/**
 * Utility functions for managing offline storage using localStorage
 */

const OfflineStorage = {
  /**
   * Set an item in localStorage
   * @param {string} key - The key to store the data under
   * @param {any} value - The value to store
   * @returns {boolean} - True if successfully stored, false otherwise
   */
  setItem: (key, value) => {
    try {
      const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
      localStorage.setItem(key, serializedValue);
      return true;
    } catch (error) {
      console.error('Error setting item:', error);
      return false;
    }
  },

  /**
   * Get an item from localStorage
   * @param {string} key - The key to retrieve
   * @returns {any} - The stored value, or null if not found
   */
  getItem: (key) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error getting item:', error);
      return null;
    }
  },

  /**
   * Remove an item from localStorage
   * @param {string} key - The key to remove
   * @returns {boolean} - True if successfully removed, false otherwise
   */
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing item:', error);
      return false;
    }
  },

  /**
   * Clear all items from localStorage
   * @returns {boolean} - True if successfully cleared, false otherwise
   */
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  },

  /**
   * Check if an item exists in localStorage
   * @param {string} key - The key to check
   * @returns {boolean} - True if exists, false otherwise
   */
  hasItem: (key) => {
    return localStorage.getItem(key) !== null;
  },

  /**
   * Get all keys in localStorage
   * @returns {string[]} - Array of all keys
   */
  getAllKeys: () => {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  },

  /**
   * Get all items in localStorage as an object
   * @returns {Object} - Object containing all key-value pairs
   */
  getAllItems: () => {
    try {
      const keys = Object.keys(localStorage);
      const items = {};
      keys.forEach(key => {
        items[key] = JSON.parse(localStorage.getItem(key));
      });
      return items;
    } catch (error) {
      console.error('Error getting all items:', error);
      return {};
    }
  },

  /**
   * Set multiple items at once
   * @param {Object} items - Object containing key-value pairs
   * @returns {boolean} - True if all items were set successfully, false otherwise
   */
  setMultipleItems: (items) => {
    try {
      Object.entries(items).forEach(([key, value]) => {
        const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
        localStorage.setItem(key, serializedValue);
      });
      return true;
    } catch (error) {
      console.error('Error setting multiple items:', error);
      return false;
    }
  },

  /**
   * Remove multiple items at once
   * @param {string[]} keys - Array of keys to remove
   * @returns {boolean} - True if all items were removed successfully, false otherwise
   */
  removeMultipleItems: (keys) => {
    try {
      keys.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Error removing multiple items:', error);
      return false;
    }
  },

  /**
   * Get the size of localStorage in bytes
   * @returns {number} - Size in bytes
   */
  getSize: () => {
    try {
      let size = 0;
      Object.keys(localStorage).forEach(key => {
        size += (key.length + localStorage.getItem(key).length);
      });
      return size;
    } catch (error) {
      console.error('Error getting storage size:', error);
      return 0;
    }
  }
};

export default OfflineStorage;