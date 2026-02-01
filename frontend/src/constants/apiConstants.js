// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    GOOGLE: '/auth/google'
  },
  
  // Station endpoints
  STATIONS: {
    BASE: '/stations',
    BY_ID: (id) => `/stations/${id}`,
    NEARBY: '/stations/nearby',
    SEARCH: '/stations/search'
  },
  
  // Booking endpoints
  BOOKINGS: {
    BASE: '/bookings',
    BY_ID: (id) => `/bookings/${id}`,
    USER: '/bookings/user',
    ADMIN: '/bookings/admin'
  },
  
  // User endpoints
  USERS: {
    BASE: '/users',
    BY_ID: (id) => `/users/${id}`,
    PROFILE: '/users/profile',
    PASSWORD: (id) => `/users/${id}/password`
  },
  
  // Review endpoints
  REVIEWS: {
    BASE: '/reviews',
    BY_STATION: (stationId) => `/reviews/station/${stationId}`,
    ADMIN: '/reviews/admin'
  },
  
  // Admin endpoints
  ADMIN: {
    DASHBOARD: '/admin/dashboard-stats',
    USERS: '/admin/users',
    BOOKINGS: '/admin/bookings',
    REVIEWS: '/admin/reviews',
    ANALYTICS: '/admin/station-analytics'
  },
  
  // Car endpoints
  CARS: {
    BASE: '/cars',
    USER: '/cars/user',
    BY_ID: (id) => `/cars/${id}`
  },
  
  // Payment endpoints
  PAYMENT: {
    CREATE_ORDER: '/payment/create-order',
    VERIFY: '/payment/verify'
  },

  // Vehicle endpoints
  VEHICLES: {
    BRANDS: '/vehicles/brands',
    MODELS: (brandId) => `/vehicles/brands/${brandId}/models`,
    USER_VEHICLE: '/vehicles/user-vehicle'
  }
};

// Application Constants
export const APP_CONSTANTS = {
  TOKEN_KEY: 'token',
  USER_KEY: 'user',
  REFRESH_TOKEN_KEY: 'refreshToken',
  
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  // File upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  
  // Validation
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  
  // Booking status
  BOOKING_STATUS: {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    CANCELLED: 'Cancelled',
    COMPLETED: 'Completed'
  },
  
  // Station status
  STATION_STATUS: {
    AVAILABLE: 'Available',
    OCCUPIED: 'Occupied',
    MAINTENANCE: 'Maintenance',
    OFFLINE: 'Offline'
  },
  
  // User roles
  USER_ROLES: {
    ADMIN: 'Admin',
    USER: 'User'
  }
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TOKEN_EXPIRED: 'Your session has expired. Please login again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTER_SUCCESS: 'Registration successful!',
  BOOKING_SUCCESS: 'Booking created successfully!',
  UPDATE_SUCCESS: 'Updated successfully!',
  DELETE_SUCCESS: 'Deleted successfully!'
};