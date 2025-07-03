'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface LogoutButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  showIcon?: boolean
  children?: React.ReactNode
  redirectTo?: string
}

export function LogoutButton({
  variant = 'outline',
  size = 'default',
  className = '',
  showIcon = true,
  children = 'Logout',
  redirectTo = '/',
}: LogoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const { signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      setLoading(true)

      // Sign out from Supabase and clear storage
      await signOut()

      // Redirect to specified page
      router.push(redirectTo)
    } catch (error) {
      console.error('Logout error:', error)
      // Even if there's an error, redirect to clear the session
      router.push(redirectTo)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={loading}
      variant={variant}
      size={size}
      className={className}
    >
      {showIcon && <LogOut className="w-4 h-4 mr-2" />}
      {loading ? 'Logging out...' : children}
    </Button>
  )
}
