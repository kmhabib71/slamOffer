'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/providers/auth-provider'
import { Loader } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, isInitialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isInitialized && !loading && !user) {
      router.replace(`/auth/login?redirect=${window.location.pathname}`)
    }
  }, [user, loading, isInitialized, router])

  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] dotted-bg flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader className="h-8 w-8 animate-spin text-violet-500" />
          <span className="text-lg font-medium text-slate-700">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
