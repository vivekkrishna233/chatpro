import { User } from '@supabase/supabase-js'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone_number?: string | null
  is_online: boolean
  last_seen: string
  created_at: string
  updated_at: string
}

export interface AuthUser extends User {
  full_name?: string
  avatar_url?: string
}

export interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: any }>
  updateProfile: (data: { full_name?: string; avatar_url?: string }) => Promise<{ error?: any }>
}

export interface LoginFormData {
  email: string
  password: string
}

export interface SignUpFormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
}

export interface ForgotPasswordFormData {
  email: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}