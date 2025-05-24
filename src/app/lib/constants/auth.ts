export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  FORGOT_PASSWORD: '/auth/forgot-password',
  CALLBACK: '/auth/callback',
} as const

export const PROTECTED_ROUTES = [
  '/',
  '/chat',
  '/settings',
  '/profile',
] as const

export const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/callback',
] as const

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_NOT_CONFIRMED: 'Please check your email and click the confirmation link',
  USER_ALREADY_EXISTS: 'A user with this email already exists',
  WEAK_PASSWORD: 'Password is too weak',
  INVALID_EMAIL: 'Invalid email address',
  NETWORK_ERROR: 'Network error. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred',
} as const

export const AUTH_SUCCESS_MESSAGES = {
  SIGNUP_SUCCESS: 'Account created successfully! Please check your email for verification.',
  LOGIN_SUCCESS: 'Welcome back!',
  LOGOUT_SUCCESS: 'You have been logged out successfully',
  PASSWORD_RESET_SENT: 'Password reset link sent to your email',
  PROFILE_UPDATED: 'Profile updated successfully',
} as const