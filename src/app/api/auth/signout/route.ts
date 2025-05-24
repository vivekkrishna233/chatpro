import { createClient } from '@/app/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Sign out the user
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Signout error:', error)
      return NextResponse.json(
        { error: 'Failed to sign out' },
        { status: 500 }
      )
    }

    // Create response and clear auth cookies
    const response = NextResponse.json(
      { message: 'Successfully signed out' },
      { status: 200 }
    )

    // Clear authentication cookies
    response.cookies.set('sb-access-token', '', {
      path: '/',
      expires: new Date(0),
    })
    
    response.cookies.set('sb-refresh-token', '', {
      path: '/',
      expires: new Date(0),
    })

    return response
  } catch (error) {
    console.error('Signout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle GET requests (for direct navigation)
export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Sign out the user
    await supabase.auth.signOut()

    // Redirect to login page
    return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
  } catch (error) {
    console.error('Signout error:', error)
    return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
  }
}