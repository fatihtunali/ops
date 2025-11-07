/**
 * Formatter Utilities
 * Consistent data formatting throughout the application
 */

import { format, parseISO, formatDistance, isValid } from 'date-fns';
import {
  DATE_FORMAT,
  DATETIME_FORMAT,
  DISPLAY_DATE_FORMAT,
  DISPLAY_DATETIME_FORMAT,
  CURRENCY_SYMBOLS
} from './constants';

/**
 * Format currency with symbol
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (USD, EUR, TRY, GBP)
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD', decimals = 2) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${CURRENCY_SYMBOLS[currency] || '$'}0.00`;
  }

  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  const formatted = Number(amount).toFixed(decimals);
  const parts = formatted.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return `${symbol}${parts.join('.')}`;
};

/**
 * Format number with thousand separators
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted number string
 */
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined || isNaN(number)) {
    return '0';
  }

  const formatted = Number(number).toFixed(decimals);
  const parts = formatted.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return decimals > 0 ? parts.join('.') : parts[0];
};

/**
 * Format percentage
 * @param {number} value - Value to format
 * @param {number} total - Total value for percentage calculation
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, total, decimals = 1) => {
  if (!total || total === 0) {
    return '0%';
  }

  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * Parse date from DD/MM/YYYY format to Date object
 * @param {string} dateString - Date string in DD/MM/YYYY format
 * @returns {Date|null} Parsed date object or null
 */
const parseDDMMYYYY = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return null;

  // Check if it's already in DD/MM/YYYY format
  const ddmmyyyyRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateString.match(ddmmyyyyRegex);

  if (match) {
    const [, day, month, year] = match;
    // Create date object (month is 0-indexed in JavaScript)
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return isValid(date) ? date : null;
  }

  return null;
};

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Format string (optional)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = DISPLAY_DATE_FORMAT) => {
  if (!date) return '-';

  try {
    let dateObj;

    if (typeof date === 'string') {
      // Try parsing DD/MM/YYYY format first
      dateObj = parseDDMMYYYY(date);

      // If not DD/MM/YYYY, try ISO format
      if (!dateObj) {
        dateObj = parseISO(date);
      }
    } else {
      dateObj = date;
    }

    if (!isValid(dateObj)) return '-';
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error, 'for date:', date);
    return '-';
  }
};

/**
 * Format datetime for display
 * @param {string|Date} datetime - Datetime to format
 * @param {string} formatStr - Format string (optional)
 * @returns {string} Formatted datetime string
 */
export const formatDateTime = (datetime, formatStr = DISPLAY_DATETIME_FORMAT) => {
  if (!datetime) return '-';

  try {
    const dateObj = typeof datetime === 'string' ? parseISO(datetime) : datetime;
    if (!isValid(dateObj)) return '-';
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return '-';
  }
};

/**
 * Format date for API (yyyy-MM-dd)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string for API
 */
export const formatDateForAPI = (date) => {
  if (!date) return null;

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return null;
    return format(dateObj, DATE_FORMAT);
  } catch (error) {
    console.error('Date API formatting error:', error);
    return null;
  }
};

/**
 * Format datetime for API (yyyy-MM-dd HH:mm)
 * @param {string|Date} datetime - Datetime to format
 * @returns {string} Formatted datetime string for API
 */
export const formatDateTimeForAPI = (datetime) => {
  if (!datetime) return null;

  try {
    const dateObj = typeof datetime === 'string' ? parseISO(datetime) : datetime;
    if (!isValid(dateObj)) return null;
    return format(dateObj, DATETIME_FORMAT);
  } catch (error) {
    console.error('DateTime API formatting error:', error);
    return null;
  }
};

/**
 * Format relative time (e.g., "2 days ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '-';

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '-';
    return formatDistance(dateObj, new Date(), { addSuffix: true });
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return '-';
  }
};

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '-';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format based on length (assuming international format)
  if (cleaned.length === 11) {
    // +1 XXX XXX XXXX
    return `+${cleaned.charAt(0)} ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    // XXX XXX XXXX
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }

  return phone; // Return original if format unknown
};

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format booking code
 * @param {string|number} code - Booking code or number
 * @returns {string} Formatted booking code
 */
export const formatBookingCode = (code) => {
  if (!code) return '-';

  // If it's just a number, format as Funny-XXXX
  if (typeof code === 'number') {
    return `Funny-${code}`;
  }

  // If it already has Funny- prefix, return as is
  if (typeof code === 'string' && code.startsWith('Funny-')) {
    return code;
  }

  // Otherwise, add Funny- prefix
  return `Funny-${code}`;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalizeWords = (text) => {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Format email (lowercase, trim)
 * @param {string} email - Email to format
 * @returns {string} Formatted email
 */
export const formatEmail = (email) => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

/**
 * Calculate and format margin percentage
 * @param {number} sellPrice - Selling price
 * @param {number} costPrice - Cost price
 * @returns {string} Formatted margin percentage
 */
export const formatMarginPercentage = (sellPrice, costPrice) => {
  if (!sellPrice || !costPrice || costPrice === 0) {
    return '0%';
  }

  const margin = ((sellPrice - costPrice) / costPrice) * 100;
  return `${margin.toFixed(1)}%`;
};

/**
 * Format profit margin with color indication
 * @param {number} margin - Margin amount
 * @returns {object} Object with formatted value and color class
 */
export const formatProfitMargin = (margin) => {
  if (margin === null || margin === undefined) {
    return { value: '-', colorClass: 'text-secondary-500' };
  }

  const formatted = formatCurrency(margin);
  let colorClass = 'text-secondary-900';

  if (margin > 0) {
    colorClass = 'text-success-600';
  } else if (margin < 0) {
    colorClass = 'text-danger-600';
  }

  return { value: formatted, colorClass };
};

/**
 * Format status badge label
 * @param {string} status - Status value
 * @param {object} statusLabels - Status label mapping
 * @returns {string} Formatted status label
 */
export const formatStatusLabel = (status, statusLabels) => {
  if (!status) return '-';
  return statusLabels[status] || capitalizeWords(status.replace(/_/g, ' '));
};

export default {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatDateTime,
  formatDateForAPI,
  formatDateTimeForAPI,
  formatRelativeTime,
  formatPhoneNumber,
  formatFileSize,
  formatBookingCode,
  truncateText,
  capitalizeWords,
  formatEmail,
  formatMarginPercentage,
  formatProfitMargin,
  formatStatusLabel,
};
