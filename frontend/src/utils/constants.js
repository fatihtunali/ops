/**
 * Application Constants
 * Centralized location for all app-wide constants
 */

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// App Information
export const APP_NAME = 'Funny Tourism Operations';
export const APP_VERSION = '1.0.0';
export const COMPANY_NAME = 'Funny Tourism';

// Authentication
export const TOKEN_KEY = 'funny_tourism_token';
export const USER_KEY = 'funny_tourism_user';
export const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes

// Booking Statuses
export const BOOKING_STATUS = {
  INQUIRY: 'inquiry',
  QUOTED: 'quoted',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const BOOKING_STATUSES = [
  'inquiry',
  'quoted',
  'confirmed',
  'completed',
  'cancelled',
];

export const BOOKING_STATUS_LABELS = {
  inquiry: 'Inquiry',
  quoted: 'Quoted',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const BOOKING_STATUS_COLORS = {
  inquiry: 'secondary',
  quoted: 'warning',
  confirmed: 'success',
  completed: 'primary',
  cancelled: 'danger',
};

// Client Types
export const CLIENT_TYPES = {
  AGENT: 'agent',
  DIRECT: 'direct',
};

export const CLIENT_TYPE_LABELS = {
  agent: 'Travel Agent',
  direct: 'Direct Client',
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  ACCOUNTANT: 'accountant',
};

export const USER_ROLE_LABELS = {
  admin: 'Administrator',
  staff: 'Staff',
  accountant: 'Accountant',
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  CREDIT_CARD: 'credit_card',
  CHECK: 'check',
};

export const PAYMENT_METHOD_LABELS = {
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  credit_card: 'Credit Card',
  check: 'Check',
};

// Payment Statuses
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PARTIALLY_PAID: 'partially_paid',
  PAID: 'paid',
  OVERDUE: 'overdue',
};

export const PAYMENT_STATUS_LABELS = {
  pending: 'Pending',
  partially_paid: 'Partially Paid',
  paid: 'Paid',
  overdue: 'Overdue',
};

export const PAYMENT_STATUS_COLORS = {
  pending: 'warning',
  partially_paid: 'warning',
  paid: 'success',
  overdue: 'danger',
};

// Currencies
export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  TRY: 'TRY',
  GBP: 'GBP',
};

export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  TRY: '₺',
  GBP: '£',
};

// Expense Categories
export const EXPENSE_CATEGORIES = {
  RENT: 'rent',
  SALARIES: 'salaries',
  UTILITIES: 'utilities',
  MARKETING: 'marketing',
  INSURANCE: 'insurance',
  OFFICE_SUPPLIES: 'office_supplies',
  MAINTENANCE: 'maintenance',
  OTHER: 'other',
};

export const EXPENSE_CATEGORY_LABELS = {
  rent: 'Office Rent',
  salaries: 'Salaries',
  utilities: 'Utilities',
  marketing: 'Marketing',
  insurance: 'Insurance',
  office_supplies: 'Office Supplies',
  maintenance: 'Maintenance',
  other: 'Other',
};

// Service Types
export const SERVICE_TYPES = {
  HOTEL: 'hotel',
  TOUR: 'tour',
  TRANSFER: 'transfer',
  FLIGHT: 'flight',
};

export const SERVICE_TYPE_LABELS = {
  hotel: 'Hotel',
  tour: 'Tour',
  transfer: 'Transfer',
  flight: 'Flight',
};

// Tour Operation Types
export const TOUR_OPERATION_TYPES = {
  SUPPLIER: 'supplier',
  SELF_OPERATED: 'self-operated',
};

export const TOUR_OPERATION_TYPE_LABELS = {
  supplier: 'External Supplier',
  'self-operated': 'Self-Operated',
};

// Transfer Types
export const TRANSFER_TYPES = {
  AIRPORT_PICKUP: 'Airport Pickup',
  AIRPORT_DROPOFF: 'Airport Dropoff',
  INTERCITY: 'Intercity Transfer',
  SIGHTSEEING: 'Sightseeing Transfer',
};

// Vehicle Types
export const VEHICLE_TYPES = [
  'Sedan',
  'SUV',
  'Van',
  'Minibus',
  'Bus',
  'Luxury Car',
];

// Room Types
export const ROOM_TYPES = [
  'Single',
  'Double',
  'Twin',
  'Triple',
  'Family Room',
  'Suite',
  'Deluxe Room',
  'Presidential Suite',
];

// Languages
export const LANGUAGES = [
  'English',
  'Turkish',
  'German',
  'French',
  'Spanish',
  'Italian',
  'Russian',
  'Arabic',
  'Chinese',
  'Japanese',
];

// Guide Specializations
export const GUIDE_SPECIALIZATIONS = [
  'Historical Tours',
  'Cultural Tours',
  'Adventure Tours',
  'Food Tours',
  'City Tours',
  'Nature Tours',
  'Religious Tours',
  'Archaeological Tours',
];

// Tour Durations
export const TOUR_DURATIONS = [
  'Half Day',
  'Full Day',
  '2 Days',
  '3 Days',
  '4+ Days',
];

// Date Formats
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm';
export const DISPLAY_DATE_FORMAT = 'MMM dd, yyyy';
export const DISPLAY_DATETIME_FORMAT = 'MMM dd, yyyy HH:mm';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Notification Duration
export const NOTIFICATION_DURATION = 5000; // 5 seconds

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// Chart Colors
export const CHART_COLORS = [
  '#3b82f6', // primary-500
  '#10b981', // success-500
  '#f59e0b', // warning-500
  '#ef4444', // danger-500
  '#8b5cf6', // purple-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
];

// Navigation Menu
export const MENU_ITEMS = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: 'ChartBarIcon',
    roles: ['admin', 'staff', 'accountant'],
  },
  {
    name: 'Bookings',
    path: '/bookings',
    icon: 'CalendarIcon',
    roles: ['admin', 'staff'],
    submenu: [
      { name: 'All Bookings', path: '/bookings' },
      { name: 'Create Booking', path: '/bookings/create' },
    ],
  },
  {
    name: 'Clients',
    path: '/clients',
    icon: 'UsersIcon',
    roles: ['admin', 'staff'],
  },
  {
    name: 'Inventory',
    path: '#',
    icon: 'CubeIcon',
    roles: ['admin', 'staff'],
    submenu: [
      { name: 'Hotels', path: '/hotels' },
      { name: 'Tour Suppliers', path: '/tour-suppliers' },
      { name: 'Guides', path: '/guides' },
      { name: 'Vehicles', path: '/vehicles' },
    ],
  },
  {
    name: 'Payments',
    path: '#',
    icon: 'CreditCardIcon',
    roles: ['admin', 'staff', 'accountant'],
    submenu: [
      { name: 'Client Payments', path: '/payments/clients' },
      { name: 'Supplier Payments', path: '/payments/suppliers' },
    ],
  },
  {
    name: 'Expenses',
    path: '/expenses',
    icon: 'ReceiptTaxIcon',
    roles: ['admin', 'accountant'],
  },
  {
    name: 'Reports',
    path: '#',
    icon: 'DocumentReportIcon',
    roles: ['admin', 'accountant'],
    submenu: [
      { name: 'Profit & Loss', path: '/reports/profit-loss' },
      { name: 'Cash Flow', path: '/reports/cash-flow' },
      { name: 'Sales Reports', path: '/reports/sales' },
      { name: 'Outstanding', path: '/reports/outstanding' },
    ],
  },
  {
    name: 'Vouchers',
    path: '/vouchers',
    icon: 'DocumentTextIcon',
    roles: ['admin', 'staff'],
  },
  {
    name: 'Users',
    path: '/users',
    icon: 'UserGroupIcon',
    roles: ['admin'],
  },
];

export default {
  API_BASE_URL,
  APP_NAME,
  APP_VERSION,
  COMPANY_NAME,
  TOKEN_KEY,
  USER_KEY,
  BOOKING_STATUS,
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
  CLIENT_TYPES,
  CLIENT_TYPE_LABELS,
  USER_ROLES,
  USER_ROLE_LABELS,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  CURRENCIES,
  CURRENCY_SYMBOLS,
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  SERVICE_TYPES,
  SERVICE_TYPE_LABELS,
  MENU_ITEMS,
};
