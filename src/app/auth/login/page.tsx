import React from 'react'
import AuthLayout from '@/app/components/layout/AuthLayout'
import AuthForm from '@/app/components/auth/AuthForm'

export default function LoginPage() {
  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to continue your conversations"
    >
      <AuthForm mode="login" />
    </AuthLayout>
  )
}