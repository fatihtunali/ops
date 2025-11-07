/**
 * Validator Utilities
 * Reusable validation functions for forms
 */

/**
 * Check if value is empty
 * @param {any} value - Value to check
 * @returns {boolean} True if empty
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (isEmpty(value)) {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {string|null} Error message or null
 */
export const validateEmail = (email) => {
  if (isEmpty(email)) return null; // Skip if empty (use validateRequired separately)

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }
  return null;
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {string|null} Error message or null
 */
export const validatePhone = (phone) => {
  if (isEmpty(phone)) return null;

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length < 10 || cleaned.length > 15) {
    return 'Phone number must be between 10 and 15 digits';
  }
  return null;
};

/**
 * Validate minimum length
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null
 */
export const validateMinLength = (value, minLength, fieldName = 'This field') => {
  if (isEmpty(value)) return null;

  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

/**
 * Validate maximum length
 * @param {string} value - Value to validate
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null
 */
export const validateMaxLength = (value, maxLength, fieldName = 'This field') => {
  if (isEmpty(value)) return null;

  if (value.length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters`;
  }
  return null;
};

/**
 * Validate numeric value
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null
 */
export const validateNumber = (value, fieldName = 'This field') => {
  if (isEmpty(value)) return null;

  if (isNaN(value)) {
    return `${fieldName} must be a valid number`;
  }
  return null;
};

/**
 * Validate positive number
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null
 */
export const validatePositiveNumber = (value, fieldName = 'This field') => {
  if (isEmpty(value)) return null;

  const numValue = Number(value);
  if (isNaN(numValue) || numValue < 0) {
    return `${fieldName} must be a positive number`;
  }
  return null;
};

/**
 * Validate minimum value
 * @param {any} value - Value to validate
 * @param {number} minValue - Minimum value
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null
 */
export const validateMin = (value, minValue, fieldName = 'This field') => {
  if (isEmpty(value)) return null;

  const numValue = Number(value);
  if (isNaN(numValue)) {
    return `${fieldName} must be a valid number`;
  }

  if (numValue < minValue) {
    return `${fieldName} must be at least ${minValue}`;
  }
  return null;
};

/**
 * Validate maximum value
 * @param {any} value - Value to validate
 * @param {number} maxValue - Maximum value
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null
 */
export const validateMax = (value, maxValue, fieldName = 'This field') => {
  if (isEmpty(value)) return null;

  const numValue = Number(value);
  if (isNaN(numValue)) {
    return `${fieldName} must be a valid number`;
  }

  if (numValue > maxValue) {
    return `${fieldName} must be no more than ${maxValue}`;
  }
  return null;
};

/**
 * Validate date format (yyyy-MM-dd)
 * @param {string} date - Date to validate
 * @returns {string|null} Error message or null
 */
export const validateDate = (date) => {
  if (isEmpty(date)) return null;

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return 'Invalid date format (use YYYY-MM-DD)';
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  return null;
};

/**
 * Validate date range (start date must be before end date)
 * @param {string} startDate - Start date
 * @param {string} endDate - End date
 * @returns {string|null} Error message or null
 */
export const validateDateRange = (startDate, endDate) => {
  if (isEmpty(startDate) || isEmpty(endDate)) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 'Invalid date range';
  }

  if (start > end) {
    return 'Start date must be before end date';
  }

  return null;
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {string|null} Error message or null
 */
export const validatePassword = (password) => {
  if (isEmpty(password)) return null;

  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }

  // Check for at least one uppercase, one lowercase, and one number
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasUpperCase || !hasLowerCase || !hasNumber) {
    return 'Password must contain uppercase, lowercase, and number';
  }

  return null;
};

/**
 * Validate password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {string|null} Error message or null
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (isEmpty(confirmPassword)) return null;

  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }

  return null;
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {string|null} Error message or null
 */
export const validateURL = (url) => {
  if (isEmpty(url)) return null;

  try {
    new URL(url);
    return null;
  } catch (error) {
    return 'Invalid URL format';
  }
};

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSize - Maximum size in bytes
 * @returns {string|null} Error message or null
 */
export const validateFileSize = (file, maxSize) => {
  if (!file) return null;

  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return `File size must be less than ${maxSizeMB}MB`;
  }

  return null;
};

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {string|null} Error message or null
 */
export const validateFileType = (file, allowedTypes) => {
  if (!file) return null;

  if (!allowedTypes.includes(file.type)) {
    return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
  }

  return null;
};

/**
 * Validate booking code format (Funny-XXXX)
 * @param {string} code - Booking code to validate
 * @returns {string|null} Error message or null
 */
export const validateBookingCode = (code) => {
  if (isEmpty(code)) return null;

  const codeRegex = /^Funny-\d+$/;
  if (!codeRegex.test(code)) {
    return 'Invalid booking code format (use Funny-XXXX)';
  }

  return null;
};

/**
 * Validate percentage (0-100)
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null
 */
export const validatePercentage = (value, fieldName = 'This field') => {
  if (isEmpty(value)) return null;

  const numValue = Number(value);
  if (isNaN(numValue)) {
    return `${fieldName} must be a valid number`;
  }

  if (numValue < 0 || numValue > 100) {
    return `${fieldName} must be between 0 and 100`;
  }

  return null;
};

/**
 * Composite validator - runs multiple validations
 * @param {any} value - Value to validate
 * @param {Function[]} validators - Array of validator functions
 * @returns {string|null} First error message or null
 */
export const runValidators = (value, validators) => {
  for (const validator of validators) {
    const error = validator(value);
    if (error) return error;
  }
  return null;
};

/**
 * Validate form fields
 * @param {object} formData - Form data object
 * @param {object} validationRules - Validation rules object
 * @returns {object} Errors object
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};

  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = formData[field];

    for (const rule of rules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });

  return errors;
};

/**
 * Check if form has errors
 * @param {object} errors - Errors object
 * @returns {boolean} True if has errors
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

export default {
  isEmpty,
  validateRequired,
  validateEmail,
  validatePhone,
  validateMinLength,
  validateMaxLength,
  validateNumber,
  validatePositiveNumber,
  validateMin,
  validateMax,
  validateDate,
  validateDateRange,
  validatePassword,
  validatePasswordMatch,
  validateURL,
  validateFileSize,
  validateFileType,
  validateBookingCode,
  validatePercentage,
  runValidators,
  validateForm,
  hasErrors,
};
