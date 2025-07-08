'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface AdminAuthGuardProps {
  children: React.ReactNode
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { data: session, status } = useSession()
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (status === 'loading') return

      if (!session?.user?.email) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch('/api/admin/check')
        const data = await response.json()

        if (response.ok) {
          setIsAdmin(data.isAdmin)
        } else {
          console.error('Admin check failed:', data.error)
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [session, status])

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-purple-200 rounded-full animate-ping"></div>
          </div>
          <p className="text-gray-600 animate-pulse">Checking admin access...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h2>
            <p className="text-gray-600 mb-6">
              You need to be signed in to access the admin panel.
            </p>
            <a
              href="/auth/login?callbackUrl=/admin"
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-8 border border-white/20">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You don't have admin privileges to access this area.
            </p>
            <div className="space-y-3">
              <a
                href="/dashboard"
                className="block w-full px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
              >
                Back to Dashboard
              </a>
              <p className="text-xs text-gray-500">Signed in as: {session.user.email}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
