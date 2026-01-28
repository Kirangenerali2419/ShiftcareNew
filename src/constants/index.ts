export const API_CONFIG = {
  BASE_URL: 'https://raw.githubusercontent.com/suyogshiftcare/jsontest/main',
  ENDPOINTS: {
    AVAILABILITY: '/available.json',
  },
  TIMEOUT: 10000,
} as const;

export const STORAGE_KEYS = {
  BOOKINGS: '@shiftcare:bookings',
} as const;

export const TIME_CONFIG = {
  SLOT_DURATION_MINUTES: 30,
  WEEK_START_DAY: 1, // Monday
} as const;

export const DAYS_ORDER = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: {
    primary: '#333333',
    secondary: '#666666',
    disabled: '#999999',
  },
  border: '#E0E0E0',
} as const;