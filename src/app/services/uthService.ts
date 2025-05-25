// services/authService.ts - Complete version with all authentication functions
import { createClient } from '@/app/lib/supabase/client'
import { Profile } from '@/app/types/auth'

const supabase = createClient()

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

// Search users by name or email
export async function searchUsers(query: string): Promise<Profile[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    console.log('Searching users with query:', query)
    
    // Search in profiles table
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .neq('id', user.id) // Exclude current user
      .limit(10)
    
    if (error) {
      console.error('Search users error:', error)
      throw error
    }
    
    console.log('Found users:', profiles)
    return profiles || []
  } catch (error) {
    console.error('Error searching users:', error)
    throw error
  }
}

// Get user profile (alternative implementation)
export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Get user profile error:', error)
      return null
    }
    
    return profile
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

// Update user profile (alternative implementation with more flexibility)
export async function updateUserProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Update user profile error:', error)
      throw error
    }
    
    return profile
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}