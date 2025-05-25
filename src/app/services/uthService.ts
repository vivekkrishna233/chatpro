
import { supabase } from '../lib/supabase'
import {  Profile } from '../types/auth'

// Sign up new user
export async function signUp(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        fullName: fullName, // backup key
      }
    }
  })

  return { data, error }
}

// Sign in existing user
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  return { data, error }
}

// Sign out user
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Reset password
export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  })

  return { data, error }
}

// Get current user profile
export async function getCurrentUserProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return profile
}

// Update user profile
export async function updateProfile(updates: { full_name?: string; avatar_url?: string }) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: { message: 'No authenticated user' } }
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)
    .select()
    .single()

  return { data, error }
}

// Upload avatar image
export async function uploadAvatar(file: File): Promise<{ url?: string; error?: any }> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: { message: 'No authenticated user' } }
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Math.random()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file)

  if (uploadError) {
    return { error: uploadError }
  }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  return { url: publicUrl }
}

// Check if email exists
export async function checkEmailExists(email: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  return !error && !!data
}

// Get user by ID
export async function getUserById(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null
  return data
}

// Search users
export async function searchUsers(query: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
    .limit(10)

  if (error) {
    console.error('Error searching users:', error)
    return []
  }

  return data || []
}