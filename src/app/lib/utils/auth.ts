import { AuthError } from '@supabase/supabase-js'
import { AUTH_ERRORS, AUTH_ROUTES, PROTECTED_ROUTES, PUBLIC_ROUTES } from '../constants/auth'

export function getAuthErrorMessage(error: AuthError | Error): string {
  if ('message' in error) {
    const message = error.message.toLowerCase()

    if (message.includes('invalid login credentials')) {
      return AUTH_ERRORS.INVALID_CREDENTIALS
    }

    if (message.includes('email not confirmed')) {
      return AUTH_ERRORS.EMAIL_NOT_CONFIRMED
    }

    // if (message.includes('user not found')) {
    //   return AUTH_ERRORS.USER_NOT_FOUND
    // }

    if (message.includes('user already registered')) {
      return AUTH_ERRORS.USER_ALREADY_EXISTS
    }

    if (message.includes('password is too weak')) {
      return AUTH_ERRORS.WEAK_PASSWORD
    }

    // if (message.includes('rate limit')) {
    //   return AUTH_ERRORS.RATE_LIMIT_EXCEEDED
    // }

    if (message.includes('network')) {
      return AUTH_ERRORS.NETWORK_ERROR
    }
  }

  return AUTH_ERRORS.UNKNOWN_ERROR
}

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route))
}

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname as any)
}

export function getRedirectUrl(): string {
  return AUTH_ROUTES.LOGIN
}
