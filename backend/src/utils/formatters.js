/**
 * Format utility functions for Funny Tourism Operations
 * Standards: Date: dd/mm/yyyy, Time: hh:mm (24-hour)
 */

/**
 * Format date to dd/mm/yyyy
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Formatted date (dd/mm/yyyy)
 */
function formatDate(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format time to hh:mm
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Formatted time (hh:mm)
 */
function formatTime(date) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format datetime to dd/mm/yyyy hh:mm
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Formatted datetime
 */
function formatDateTime(date) {
  if (!date) return null;
  return `${formatDate(date)} ${formatTime(date)}`;
}

/**
 * Parse date from dd/mm/yyyy to ISO format for database
 * @param {string} dateString - Date in dd/mm/yyyy format
 * @returns {string} ISO date string (yyyy-mm-dd)
 */
function parseDate(dateString) {
  if (!dateString) return null;

  // Handle dd/mm/yyyy format
  const parts = dateString.split('/');
  if (parts.length !== 3) return null;

  const [day, month, year] = parts;
  // Return ISO format for database: yyyy-mm-dd
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Parse datetime from dd/mm/yyyy hh:mm to ISO format
 * @param {string} dateTimeString - DateTime in dd/mm/yyyy hh:mm format
 * @returns {string} ISO datetime string
 */
function parseDateTime(dateTimeString) {
  if (!dateTimeString) return null;

  const [datePart, timePart] = dateTimeString.split(' ');
  if (!datePart || !timePart) return null;

  const [day, month, year] = datePart.split('/');
  const [hours, minutes] = timePart.split(':');

  // Create ISO string: yyyy-mm-ddThh:mm:ss
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
}

/**
 * Format currency with comma separators
 * @param {number|string} amount - Amount to format
 * @param {string} currency - Currency symbol (default: '')
 * @returns {string} Formatted currency
 */
function formatCurrency(amount, currency = '') {
  if (amount === null || amount === undefined) return null;

  const num = parseFloat(amount);
  if (isNaN(num)) return null;

  // Format with 2 decimal places and comma separators
  const formatted = num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return currency ? `${currency}${formatted}` : formatted;
}

/**
 * Parse currency string to float
 * @param {string} currencyString - Currency string (e.g., "1,234.56")
 * @returns {number} Parsed amount
 */
function parseCurrency(currencyString) {
  if (!currencyString) return 0;

  // Remove currency symbols and commas
  const cleaned = currencyString.toString().replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Validate date format (dd/mm/yyyy)
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid
 */
function isValidDate(dateString) {
  if (!dateString) return false;

  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateString.match(regex);

  if (!match) return false;

  const [, day, month, year] = match;
  const d = parseInt(day);
  const m = parseInt(month);
  const y = parseInt(year);

  // Check valid ranges
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  if (y < 2000 || y > 2100) return false;

  // Check valid date
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

/**
 * Validate time format (hh:mm)
 * @param {string} timeString - Time string to validate
 * @returns {boolean} True if valid
 */
function isValidTime(timeString) {
  if (!timeString) return false;

  const regex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
  return regex.test(timeString);
}

/**
 * Format booking code (Funny-XXXX)
 * @param {number} number - Booking number
 * @returns {string} Formatted booking code
 */
function formatBookingCode(number) {
  return `Funny-${number}`;
}

/**
 * Format phone number (keep as entered, just trim)
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone
 */
function formatPhone(phone) {
  if (!phone) return null;
  return phone.trim();
}

/**
 * Format email (lowercase)
 * @param {string} email - Email address
 * @returns {string} Formatted email
 */
function formatEmail(email) {
  if (!email) return null;
  return email.toLowerCase().trim();
}

/**
 * Format name (Title Case)
 * @param {string} name - Name to format
 * @returns {string} Formatted name
 */
function formatName(name) {
  if (!name) return null;
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format database row dates to API format
 * @param {object} row - Database row with date fields
 * @param {array} dateFields - Array of field names to format as dates
 * @param {array} dateTimeFields - Array of field names to format as datetimes
 * @returns {object} Formatted row
 */
function formatRowDates(row, dateFields = [], dateTimeFields = []) {
  if (!row) return row;

  const formatted = { ...row };

  // Format date fields
  dateFields.forEach(field => {
    if (formatted[field]) {
      formatted[field] = formatDate(formatted[field]);
    }
  });

  // Format datetime fields
  dateTimeFields.forEach(field => {
    if (formatted[field]) {
      formatted[field] = formatDateTime(formatted[field]);
    }
  });

  return formatted;
}

module.exports = {
  formatDate,
  formatTime,
  formatDateTime,
  parseDate,
  parseDateTime,
  formatCurrency,
  parseCurrency,
  isValidDate,
  isValidTime,
  formatBookingCode,
  formatPhone,
  formatEmail,
  formatName,
  formatRowDates
};
