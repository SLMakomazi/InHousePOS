/**
 * Utility functions for form and data validation
 */

const Validation = {
  /**
   * Validate email format
   * @param {string} email - Email address to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  isValidPhone: (phone) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  },

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  isValidPassword: (password) => {
    // Must be at least 8 characters, contain uppercase, lowercase, number, and special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  /**
   * Validate date format (YYYY-MM-DD)
   * @param {string} date - Date string to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  isValidDate: (date) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(date);
  },

  /**
   * Validate required field
   * @param {any} value - Value to check
   * @returns {boolean} - True if valid, false otherwise
   */
  isRequired: (value) => {
    return value !== undefined && value !== null && value !== '';
  },

  /**
   * Validate number format
   * @param {string} number - Number string to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  isValidNumber: (number) => {
    return !isNaN(number) && number !== '';
  },

  /**
   * Validate minimum length
   * @param {string} value - Value to check
   * @param {number} minLength - Minimum required length
   * @returns {boolean} - True if valid, false otherwise
   */
  minLength: (value, minLength) => {
    return value.length >= minLength;
  },

  /**
   * Validate maximum length
   * @param {string} value - Value to check
   * @param {number} maxLength - Maximum allowed length
   * @returns {boolean} - True if valid, false otherwise
   */
  maxLength: (value, maxLength) => {
    return value.length <= maxLength;
  },

  /**
   * Validate if value is within a range
   * @param {number} value - Value to check
   * @param {number} min - Minimum allowed value
   * @param {number} max - Maximum allowed value
   * @returns {boolean} - True if valid, false otherwise
   */
  isWithinRange: (value, min, max) => {
    return value >= min && value <= max;
  },

  /**
   * Validate if two values match
   * @param {any} value1 - First value to compare
   * @param {any} value2 - Second value to compare
   * @returns {boolean} - True if they match, false otherwise
   */
  doValuesMatch: (value1, value2) => {
    return value1 === value2;
  },

  /**
   * Validate URL format
   * @param {string} url - URL to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  isValidURL: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Validate if value is a valid currency amount
   * @param {string} amount - Amount to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  isValidCurrency: (amount) => {
    const currencyRegex = /^[0-9]+(\.[0-9]{1,2})?$/;
    return currencyRegex.test(amount);
  },

  /**
   * Validate if value is a valid percentage
   * @param {string} percentage - Percentage to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  isValidPercentage: (percentage) => {
    const percentageRegex = /^(100|[0-9]{1,2}(\.[0-9]{1,2})?)$/;
    return percentageRegex.test(percentage);
  },

  /**
   * Validate if value is a valid tax number (VAT)
   * @param {string} taxNumber - Tax number to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  isValidTaxNumber: (taxNumber) => {
    const taxRegex = /^[0-9]{9,12}$/;
    return taxRegex.test(taxNumber);
  },

  /**
   * Validate if value is a valid business registration number
   * @param {string} regNumber - Registration number to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  isValidRegistrationNumber: (regNumber) => {
    const regRegex = /^[A-Z]{2}[0-9]{6,8}$/;
    return regRegex.test(regNumber);
  },

  /**
   * Get validation error message for a field
   * @param {string} fieldName - Name of the field
   * @param {string} validationType - Type of validation failed
   * @returns {string} - Error message
   */
  getErrorMessage: (fieldName, validationType) => {
    const errorMessages = {
      required: `${fieldName} is required`,
      email: `${fieldName} must be a valid email address`,
      phone: `${fieldName} must be a valid phone number`,
      password: `${fieldName} must contain at least 8 characters, including uppercase, lowercase, number, and special character`,
      date: `${fieldName} must be in YYYY-MM-DD format`,
      number: `${fieldName} must be a valid number`,
      minLength: `${fieldName} must be at least {minLength} characters long`,
      maxLength: `${fieldName} must not exceed {maxLength} characters`,
      range: `${fieldName} must be between {min} and {max}`,
      match: `${fieldName} does not match`,
      url: `${fieldName} must be a valid URL`,
      currency: `${fieldName} must be a valid currency amount`,
      percentage: `${fieldName} must be a valid percentage (0-100)`,
      taxNumber: `${fieldName} must be a valid tax number`,
      registrationNumber: `${fieldName} must be a valid registration number`
    };

    return errorMessages[validationType] || `${fieldName} is invalid`;
  }
};

export default Validation;