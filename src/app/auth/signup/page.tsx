import React from 'react'
import AuthLayout from '@/app/components/layout/AuthLayout'
import AuthForm from '@/app/components/auth/AuthForm'

export default function SignUpPage() {
  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join ChatPro and start your AI conversations"
    >
      <AuthForm mode="signup" />
    </AuthLayout>
  )
}